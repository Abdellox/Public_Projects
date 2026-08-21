import os
from PyQt6.QtWidgets import (
    QMainWindow, QToolBar, QStatusBar, QFileDialog,
    QLabel, QSpinBox, QSlider, QComboBox, QMessageBox,
    QSizePolicy
)
from PyQt6.QtGui import QAction, QIcon, QKeySequence, QPixmap
from PyQt6.QtCore import Qt, QTimer, pyqtSignal

from .pdf_canvas import PdfCanvas
from .tts_engine import TTSEngine
from . import themes


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("BlazePDF")
        self.setMinimumSize(1000, 700)
        self.resize(1200, 800)

        self.dark_mode = False
        self.auto_scrolling = False
        self.auto_scroll_speed = themes.AUTO_SCROLL_DEFAULT_SPEED
        self.pdf_filepath = None
        self.tts_reading_all = False
        self.tts_current_page = 0

        self._setup_ui()
        self._setup_auto_scroll()
        self._apply_theme()

    def _setup_ui(self):
        self.pdf_canvas = PdfCanvas(self)
        self.setCentralWidget(self.pdf_canvas)
        self.pdf_canvas.page_changed.connect(self._on_page_changed)

        self.tts = TTSEngine(self)
        self.tts.playback_started.connect(self._on_tts_started)
        self.tts.playback_stopped.connect(self._on_tts_stopped)
        self.tts.playback_error.connect(self._on_tts_error)
        self.tts.page_finished.connect(self._on_tts_page_finished)

        self._create_menu_bar()
        self._create_toolbar()
        self._create_status_bar()

    def _create_menu_bar(self):
        menubar = self.menuBar()

        file_menu = menubar.addMenu("&File")
        open_action = QAction("&Open PDF", self)
        open_action.setShortcut(QKeySequence("Ctrl+O"))
        open_action.triggered.connect(self._open_file)
        file_menu.addAction(open_action)

        file_menu.addSeparator()

        close_action = QAction("&Close PDF", self)
        close_action.setShortcut(QKeySequence("Ctrl+W"))
        close_action.triggered.connect(self._close_file)
        file_menu.addAction(close_action)

        file_menu.addSeparator()

        exit_action = QAction("E&xit", self)
        exit_action.setShortcut(QKeySequence("Alt+F4"))
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        view_menu = menubar.addMenu("&View")

        self.dark_mode_action = QAction("Toggle &Dark Mode", self)
        self.dark_mode_action.setShortcut(QKeySequence("Ctrl+D"))
        self.dark_mode_action.triggered.connect(self._toggle_dark_mode)
        view_menu.addAction(self.dark_mode_action)

        zoom_in_action = QAction("Zoom &In", self)
        zoom_in_action.setShortcut(QKeySequence("Ctrl+="))
        zoom_in_action.triggered.connect(self._zoom_in)
        view_menu.addAction(zoom_in_action)

        zoom_out_action = QAction("Zoom &Out", self)
        zoom_out_action.setShortcut(QKeySequence("Ctrl+-"))
        zoom_out_action.triggered.connect(self._zoom_out)
        view_menu.addAction(zoom_out_action)

        view_menu.addSeparator()

        fit_width_action = QAction("Fit &Width", self)
        fit_width_action.setShortcut(QKeySequence("Ctrl+0"))
        fit_width_action.triggered.connect(self._fit_width)
        view_menu.addAction(fit_width_action)

        tts_menu = menubar.addMenu("&Read Aloud")

        play_action = QAction("&Play", self)
        play_action.setShortcut(QKeySequence("F5"))
        play_action.triggered.connect(self._tts_play)
        tts_menu.addAction(play_action)

        pause_action = QAction("&Pause", self)
        pause_action.setShortcut(QKeySequence("F4"))
        pause_action.triggered.connect(self._tts_pause)
        tts_menu.addAction(pause_action)

        stop_action = QAction("&Stop", self)
        stop_action.setShortcut(QKeySequence("F6"))
        stop_action.triggered.connect(self._tts_stop)
        tts_menu.addAction(stop_action)

        tts_menu.addSeparator()

        read_all_action = QAction("Read &All Pages", self)
        read_all_action.setShortcut(QKeySequence("Ctrl+R"))
        read_all_action.triggered.connect(self._tts_read_all)
        tts_menu.addAction(read_all_action)

    def _create_toolbar(self):
        toolbar = QToolBar("Main Toolbar")
        toolbar.setIconSize(QPixmap(24, 24).size())
        toolbar.setMovable(False)
        self.addToolBar(toolbar)

        open_btn = QAction("Open", self)
        open_btn.setShortcut(QKeySequence("Ctrl+O"))
        open_btn.triggered.connect(self._open_file)
        open_btn.setToolTip("Open PDF (Ctrl+O)")
        toolbar.addAction(open_btn)

        toolbar.addSeparator()

        prev_btn = QAction("< Prev", self)
        prev_btn.triggered.connect(self._prev_page)
        prev_btn.setToolTip("Previous Page")
        toolbar.addAction(prev_btn)

        self.page_spin = QSpinBox()
        self.page_spin.setMinimum(1)
        self.page_spin.setMaximum(1)
        self.page_spin.setValue(1)
        self.page_spin.setPrefix("Page ")
        self.page_spin.setFixedWidth(110)
        self.page_spin.valueChanged.connect(self._goto_page)
        toolbar.addWidget(self.page_spin)

        self.page_count_label = QLabel("/ 0")
        self.page_count_label.setMinimumWidth(50)
        toolbar.addWidget(self.page_count_label)

        next_btn = QAction("> Next", self)
        next_btn.triggered.connect(self._next_page)
        next_btn.setToolTip("Next Page")
        toolbar.addAction(next_btn)

        toolbar.addSeparator()

        zoom_out_btn = QAction("-", self)
        zoom_out_btn.triggered.connect(self._zoom_out)
        zoom_out_btn.setToolTip("Zoom Out (Ctrl+-)")
        toolbar.addAction(zoom_out_btn)

        self.zoom_label = QLabel("150%")
        self.zoom_label.setMinimumWidth(45)
        self.zoom_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        toolbar.addWidget(self.zoom_label)

        zoom_in_btn = QAction("+", self)
        zoom_in_btn.triggered.connect(self._zoom_in)
        zoom_in_btn.setToolTip("Zoom In (Ctrl+=)")
        toolbar.addAction(zoom_in_btn)

        toolbar.addSeparator()

        theme_btn = QAction("Dark/Light", self)
        theme_btn.triggered.connect(self._toggle_dark_mode)
        theme_btn.setToolTip("Toggle Dark Mode (Ctrl+D)")
        toolbar.addAction(theme_btn)

        toolbar.addSeparator()

        scroll_label = QLabel("Auto-Scroll:")
        toolbar.addWidget(scroll_label)

        self.scroll_speed_slider = QSlider(Qt.Orientation.Horizontal)
        self.scroll_speed_slider.setMinimum(themes.AUTO_SCROLL_MIN_SPEED)
        self.scroll_speed_slider.setMaximum(themes.AUTO_SCROLL_MAX_SPEED)
        self.scroll_speed_slider.setValue(themes.AUTO_SCROLL_DEFAULT_SPEED)
        self.scroll_speed_slider.setFixedWidth(120)
        self.scroll_speed_slider.setTickPosition(QSlider.TickPosition.NoTicks)
        self.scroll_speed_slider.valueChanged.connect(self._on_scroll_speed_changed)
        self.scroll_speed_slider.setToolTip("Scroll Speed")
        toolbar.addWidget(self.scroll_speed_slider)

        self.scroll_btn = QAction("Start Scroll", self)
        self.scroll_btn.triggered.connect(self._toggle_auto_scroll)
        self.scroll_btn.setToolTip("Start/Stop Auto-Scroll")
        toolbar.addAction(self.scroll_btn)

        toolbar.addSeparator()

        tts_label = QLabel("Voice:")
        toolbar.addWidget(tts_label)

        self.voice_combo = QComboBox()
        for voice_id, voice_name in themes.TTS_VOICES:
            self.voice_combo.addItem(voice_name, voice_id)
        self.voice_combo.setFixedWidth(160)
        self.voice_combo.currentIndexChanged.connect(self._on_voice_changed)
        toolbar.addWidget(self.voice_combo)

        self.tts_play_btn = QAction("Play", self)
        self.tts_play_btn.triggered.connect(self._tts_play)
        self.tts_play_btn.setToolTip("Play TTS (F5)")
        toolbar.addAction(self.tts_play_btn)

        self.tts_pause_btn = QAction("Pause", self)
        self.tts_pause_btn.triggered.connect(self._tts_pause)
        self.tts_pause_btn.setToolTip("Pause TTS (F4)")
        toolbar.addAction(self.tts_pause_btn)

        self.tts_stop_btn = QAction("Stop", self)
        self.tts_stop_btn.triggered.connect(self._tts_stop)
        self.tts_stop_btn.setToolTip("Stop TTS (F6)")
        toolbar.addAction(self.tts_stop_btn)

    def _create_status_bar(self):
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_label = QLabel("Ready - Open a PDF to start reading")
        self.status_bar.addWidget(self.status_label)

    def _apply_theme(self):
        if self.dark_mode:
            self.setStyleSheet(themes.DARK_STYLESHEET)
            self.pdf_canvas.set_dark_mode(True)
        else:
            self.setStyleSheet(themes.LIGHT_STYLESHEET)
            self.pdf_canvas.set_dark_mode(False)

    def _toggle_dark_mode(self):
        self.dark_mode = not self.dark_mode
        self._apply_theme()
        mode = "Dark" if self.dark_mode else "Light"
        self.status_label.setText(f"Switched to {mode} Mode")

    def _open_file(self):
        filepath, _ = QFileDialog.getOpenFileName(
            self,
            "Open PDF",
            "",
            "PDF Files (*.pdf);;All Files (*)"
        )
        if filepath:
            self.pdf_filepath = filepath
            ok, msg = self.pdf_canvas.open_pdf(filepath)
            if ok:
                count = self.pdf_canvas.get_page_count()
                self.page_spin.setMaximum(count)
                self.page_spin.setValue(1)
                self.page_count_label.setText(f"/ {count}")
                name = os.path.basename(filepath)
                self.setWindowTitle(f"BlazePDF - {name}")
                self.status_label.setText(
                    f"Opened: {name} ({count} pages)"
                )
                self._update_zoom_label()
            else:
                QMessageBox.critical(
                    self, "Error", f"Could not open PDF:\n\n{msg}"
                )

    def _close_file(self):
        self._tts_stop()
        self._stop_auto_scroll()
        self.pdf_canvas.close_pdf()
        self.pdf_filepath = None
        self.page_spin.setMaximum(1)
        self.page_spin.setValue(1)
        self.page_count_label.setText("/ 0")
        self.setWindowTitle("BlazePDF")
        self.status_label.setText("Ready - Open a PDF to start reading")

    def _prev_page(self):
        self.pdf_canvas.go_to_prev_page()

    def _next_page(self):
        self.pdf_canvas.go_to_next_page()

    def _goto_page(self, page_num):
        if page_num != self.pdf_canvas.current_page + 1:
            self.pdf_canvas.go_to_page(page_num - 1)

    def _on_page_changed(self, page_num):
        self.page_spin.blockSignals(True)
        self.page_spin.setValue(page_num + 1)
        self.page_spin.blockSignals(False)

    def _zoom_in(self):
        self.pdf_canvas.set_zoom(self.pdf_canvas.zoom + themes.ZOOM_STEP)
        self._update_zoom_label()

    def _zoom_out(self):
        self.pdf_canvas.set_zoom(self.pdf_canvas.zoom - themes.ZOOM_STEP)
        self._update_zoom_label()

    def _fit_width(self):
        if not self.pdf_canvas.doc:
            return
        viewport_w = self.pdf_canvas.scroll_area.viewport().width()
        page = self.pdf_canvas.doc[self.pdf_canvas.current_page]
        page_width = page.rect.width
        self.pdf_canvas.set_zoom(viewport_w / page_width)
        self._update_zoom_label()

    def _update_zoom_label(self):
        pct = int(self.pdf_canvas.zoom * 100)
        self.zoom_label.setText(f"{pct}%")

    def _setup_auto_scroll(self):
        self.scroll_timer = QTimer(self)
        self.scroll_timer.timeout.connect(self._auto_scroll_tick)

    def _on_scroll_speed_changed(self, value):
        self.auto_scroll_speed = value
        if self.auto_scrolling:
            interval = max(1, int(500 / value))
            self.scroll_timer.setInterval(interval)

    def _toggle_auto_scroll(self):
        if self.auto_scrolling:
            self._stop_auto_scroll()
        else:
            self._start_auto_scroll()

    def _start_auto_scroll(self):
        if not self.pdf_canvas.doc:
            return
        self.auto_scrolling = True
        self.scroll_btn.setText("Stop Scroll")
        interval = max(1, int(500 / self.auto_scroll_speed))
        self.scroll_timer.start(interval)
        self.status_label.setText(
            f"Auto-scrolling (speed: {self.auto_scroll_speed})"
        )

    def _stop_auto_scroll(self):
        self.auto_scrolling = False
        self.scroll_timer.stop()
        self.scroll_btn.setText("Start Scroll")
        self.status_label.setText("Auto-scroll stopped")

    def _auto_scroll_tick(self):
        if self.auto_scrolling:
            bar = self.pdf_canvas.get_scroll_bar()
            if bar.value() >= bar.maximum():
                self._stop_auto_scroll()
                self.status_label.setText("Auto-scroll finished (end of document)")
            else:
                self.pdf_canvas.scroll_down(self.auto_scroll_speed)

    def _on_voice_changed(self, index):
        voice_id = self.voice_combo.currentData()
        if voice_id:
            self.tts.set_voice(voice_id)

    def _tts_play(self):
        if self.tts.is_paused():
            self.tts.resume()
            return

        if not self.pdf_canvas.doc:
            return

        self.pdf_canvas.get_visible_page()
        text = self.pdf_canvas.get_current_page_text()

        if not text.strip():
            found = False
            for i in range(self.pdf_canvas.current_page, len(self.pdf_canvas.doc)):
                t = self.pdf_canvas.doc[i].get_text("text")
                if t.strip():
                    self.pdf_canvas.go_to_page(i)
                    text = t
                    found = True
                    break
            if not found:
                self.status_label.setText("No extractable text (scanned/image PDF?)")
                return

        self.tts_current_page = self.pdf_canvas.current_page
        self.tts_reading_all = False
        self.tts.speak(text)
        self.status_label.setText(
            f"Reading page {self.tts_current_page + 1}..."
        )

    def _tts_pause(self):
        if self.tts.is_playing():
            self.tts.pause()
            self.status_label.setText("TTS paused")
        elif self.tts.is_paused():
            self.tts.resume()
            self.status_label.setText("TTS resumed")

    def _tts_stop(self):
        self.tts_reading_all = False
        self.tts.stop()
        self.status_label.setText("TTS stopped")

    def _tts_read_all(self):
        if not self.pdf_canvas.doc:
            return

        self.tts_reading_all = True
        self.tts_current_page = 0

        total = self.pdf_canvas.get_page_count()
        while self.tts_current_page < total:
            t = self.pdf_canvas.doc[self.tts_current_page].get_text("text")
            if t.strip():
                break
            self.tts_current_page += 1

        if self.tts_current_page >= total:
            self.tts_reading_all = False
            self.status_label.setText("No extractable text in this PDF")
            return

        self.pdf_canvas.go_to_page(self.tts_current_page)
        self._speak_current_page()

    def _speak_current_page(self):
        if not self.tts_reading_all:
            return

        total = self.pdf_canvas.get_page_count()

        while self.tts_current_page < total:
            text = self.pdf_canvas.doc[self.tts_current_page].get_text("text")
            if text.strip():
                self.pdf_canvas.go_to_page(self.tts_current_page)
                self.tts.speak(text)
                self.status_label.setText(
                    f"Reading all: page {self.tts_current_page + 1} of "
                    f"{total}..."
                )
                return
            self.tts_current_page += 1

        self.tts_reading_all = False
        self.status_label.setText("Finished reading all pages")

    def _on_tts_page_finished(self):
        if self.tts_reading_all:
            self._advance_tts_page()

    def _advance_tts_page(self):
        if not self.tts_reading_all:
            return

        total = self.pdf_canvas.get_page_count()

        next_page = self.tts_current_page + 1
        while next_page < total:
            t = self.pdf_canvas.doc[next_page].get_text("text")
            if t.strip():
                break
            next_page += 1

        self.tts_current_page = next_page

        if self.tts_current_page >= total:
            self.tts_reading_all = False
            self.status_label.setText("Finished reading all pages")
            return

        self.pdf_canvas.go_to_page(self.tts_current_page)
        QTimer.singleShot(300, self._speak_current_page)

    def _on_tts_started(self):
        self.status_label.setText("TTS playing...")

    def _on_tts_stopped(self):
        pass

    def _on_tts_error(self, msg):
        self.status_label.setText(f"TTS Error: {msg}")

    def keyPressEvent(self, event):
        key = event.key()
        if key == Qt.Key.Key_Space:
            if self.tts.is_playing():
                self._tts_pause()
            elif self.tts.is_paused():
                self._tts_resume()
            else:
                self._tts_play()
            event.accept()
        elif key == Qt.Key.Key_F7:
            self._toggle_auto_scroll()
            event.accept()
        else:
            super().keyPressEvent(event)

    def _tts_resume(self):
        if self.tts.is_paused():
            self.tts.resume()
            self.status_label.setText("TTS resumed")

    def closeEvent(self, event):
        self._tts_stop()
        self.tts.cleanup()
        self.pdf_canvas.close_pdf()
        event.accept()
