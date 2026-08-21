import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from app.main_window import MainWindow


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("BlazePDF")
    app.setOrganizationName("BlazePDF")
    app.setStyle("Fusion")

    window = MainWindow()
    window.show()

    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
        window.pdf_canvas.open_pdf(sys.argv[1])
        count = window.pdf_canvas.get_page_count()
        window.page_spin.setMaximum(count)
        window.page_count_label.setText(f"/ {count}")
        window.setWindowTitle(f"BlazePDF - {os.path.basename(sys.argv[1])}")
        window.status_label.setText(
            f"Opened: {os.path.basename(sys.argv[1])} ({count} pages)"
        )

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
