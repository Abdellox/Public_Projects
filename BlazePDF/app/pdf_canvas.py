import fitz
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QScrollArea, QSizePolicy
)
from PyQt6.QtGui import QImage, QPixmap, QColor
from PyQt6.QtCore import Qt, pyqtSignal, QSize

from . import themes


class PdfCanvas(QWidget):
    page_changed = pyqtSignal(int)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.doc = None
        self.dark_mode = False
        self.zoom = themes.DEFAULT_ZOOM
        self.current_page = 0
        self._page_labels = []

        self.scroll_area = QScrollArea(self)
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.scroll_area.setHorizontalScrollBarPolicy(
            Qt.ScrollBarPolicy.ScrollBarAsNeeded
        )
        self.scroll_area.setVerticalScrollBarPolicy(
            Qt.ScrollBarPolicy.ScrollBarAsNeeded
        )
        self.scroll_area.verticalScrollBar().valueChanged.connect(
            self._on_scroll
        )

        self.container = QWidget()
        self.container_layout = QVBoxLayout(self.container)
        self.container_layout.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.container_layout.setSpacing(8)
        self.container_layout.setContentsMargins(0, 8, 0, 8)

        self.scroll_area.setWidget(self.container)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.scroll_area)

    def open_pdf(self, filepath):
        try:
            self.doc = fitz.open(filepath)
            self.current_page = 0
            self._render_all_pages()
            self.page_changed.emit(0)
            return True, ""
        except Exception as e:
            return False, str(e)

    def close_pdf(self):
        if self.doc:
            self.doc.close()
            self.doc = None
        self._clear_pages()

    def _clear_pages(self):
        for label in self._page_labels:
            self.container_layout.removeWidget(label)
            label.deleteLater()
        self._page_labels.clear()

    def _render_all_pages(self):
        self._clear_pages()
        if not self.doc:
            return

        for page_num in range(len(self.doc)):
            pixmap = self._render_page(page_num)
            label = QLabel()
            label.setPixmap(pixmap)
            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            label.setSizePolicy(
                QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed
            )
            label.setMinimumSize(pixmap.size())
            label.setStyleSheet("background: transparent; border: none;")
            self.container_layout.addWidget(label)
            self._page_labels.append(label)

    def _render_page(self, page_num):
        if not self.doc or page_num >= len(self.doc):
            return QPixmap()

        page = self.doc[page_num]
        mat = fitz.Matrix(self.zoom, self.zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)

        fmt = QImage.Format.Format_RGB888
        if pix.alpha:
            fmt = QImage.Format.Format_RGBA8888

        qimg = QImage(pix.samples, pix.width, pix.height, pix.stride, fmt).copy()

        if self.dark_mode:
            qimg.invertPixels(QImage.InvertMode.InvertRgb)

        return QPixmap.fromImage(qimg)

    def rerender_all(self):
        if self.doc:
            self._render_all_pages()

    def set_dark_mode(self, dark):
        self.dark_mode = dark
        self.rerender_all()

    def set_zoom(self, zoom):
        self.zoom = max(themes.MIN_ZOOM, min(themes.MAX_ZOOM, zoom))
        if self.doc:
            self._render_all_pages()

    def get_page_count(self):
        return len(self.doc) if self.doc else 0

    def go_to_page(self, page_num):
        if not self.doc:
            return
        page_num = max(0, min(page_num, len(self.doc) - 1))
        self.current_page = page_num
        if page_num < len(self._page_labels):
            label = self._page_labels[page_num]
            self.scroll_area.ensureWidgetVisible(label, 50, 50)
        self.page_changed.emit(page_num)

    def go_to_next_page(self):
        if self.current_page < self.get_page_count() - 1:
            self.go_to_page(self.current_page + 1)

    def go_to_prev_page(self):
        if self.current_page > 0:
            self.go_to_page(self.current_page - 1)

    def get_current_page_text(self):
        if not self.doc or self.current_page >= len(self.doc):
            return ""
        page = self.doc[self.current_page]
        text = page.get_text("text")
        if not text or not text.strip():
            blocks = page.get_text("blocks")
            parts = []
            for b in blocks:
                if b[6] == 0:
                    t = b[4].strip()
                    if t:
                        parts.append(t)
            text = "\n".join(parts)
        return text

    def _on_scroll(self, value):
        if self.doc and self._page_labels:
            prev = self.current_page
            self.get_visible_page()
            if self.current_page != prev:
                self.page_changed.emit(self.current_page)

    def get_visible_page(self):
        viewport = self.scroll_area.viewport()
        center_y = viewport.height() // 2 + self.scroll_area.verticalScrollBar().value()

        best_page = 0
        best_dist = float("inf")

        for i, label in enumerate(self._page_labels):
            geo = label.geometry()
            label_center = geo.y() + geo.height() // 2
            dist = abs(label_center - center_y)
            if dist < best_dist:
                best_dist = dist
                best_page = i

        self.current_page = best_page
        return best_page

    def scroll_down(self, amount):
        bar = self.scroll_area.verticalScrollBar()
        bar.setValue(bar.value() + amount)
        self.get_visible_page()
        self.page_changed.emit(self.current_page)

    def scroll_up(self, amount):
        bar = self.scroll_area.verticalScrollBar()
        bar.setValue(bar.value() - amount)
        self.get_visible_page()
        self.page_changed.emit(self.current_page)

    def get_scroll_bar(self):
        return self.scroll_area.verticalScrollBar()

    def wheelEvent(self, event):
        if event.modifiers() & Qt.KeyboardModifier.ControlModifier:
            delta = event.angleDelta().y()
            if delta > 0:
                self.set_zoom(self.zoom + themes.ZOOM_STEP)
            else:
                self.set_zoom(self.zoom - themes.ZOOM_STEP)
            event.accept()
        else:
            super().wheelEvent(event)

    def sizeHint(self):
        return QSize(900, 700)
