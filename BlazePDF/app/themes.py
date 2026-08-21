from PyQt6.QtGui import QPalette, QColor, QFont
from PyQt6.QtCore import Qt


DARK_STYLESHEET = """
QMainWindow {
    background-color: #1a1a2e;
}
QWidget {
    background-color: #1a1a2e;
    color: #e0e0e0;
    font-family: 'Segoe UI', sans-serif;
    font-size: 13px;
}
QToolBar {
    background-color: #16213e;
    border-bottom: 1px solid #0f3460;
    spacing: 4px;
    padding: 4px;
}
QToolBar QToolButton {
    background-color: transparent;
    color: #e0e0e0;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
}
QToolBar QToolButton:hover {
    background-color: #0f3460;
}
QToolBar QToolButton:pressed {
    background-color: #533483;
}
QMenuBar {
    background-color: #16213e;
    color: #e0e0e0;
    border-bottom: 1px solid #0f3460;
}
QMenuBar::item:selected {
    background-color: #0f3460;
}
QMenu {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #0f3460;
}
QMenu::item:selected {
    background-color: #533483;
}
QStatusBar {
    background-color: #16213e;
    color: #a0a0a0;
    border-top: 1px solid #0f3460;
}
QScrollArea {
    border: none;
    background-color: #12121f;
}
QScrollBar:vertical {
    background-color: #1a1a2e;
    width: 12px;
    margin: 0;
}
QScrollBar::handle:vertical {
    background-color: #533483;
    border-radius: 6px;
    min-height: 30px;
}
QScrollBar::handle:vertical:hover {
    background-color: #7b5ea7;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}
QScrollBar:horizontal {
    background-color: #1a1a2e;
    height: 12px;
}
QScrollBar::handle:horizontal {
    background-color: #533483;
    border-radius: 6px;
    min-width: 30px;
}
QScrollBar::handle:horizontal:hover {
    background-color: #7b5ea7;
}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
    width: 0px;
}
QLabel {
    color: #e0e0e0;
}
QSpinBox, QDoubleSpinBox {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #0f3460;
    border-radius: 4px;
    padding: 4px 8px;
    min-width: 50px;
}
QSpinBox:focus, QDoubleSpinBox:focus {
    border: 1px solid #533483;
}
QComboBox {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #0f3460;
    border-radius: 4px;
    padding: 4px 8px;
    min-width: 100px;
}
QComboBox:hover {
    border: 1px solid #533483;
}
QComboBox::drop-down {
    border: none;
    width: 20px;
}
QComboBox QAbstractItemView {
    background-color: #16213e;
    color: #e0e0e0;
    selection-background-color: #533483;
    border: 1px solid #0f3460;
}
QSlider::groove:horizontal {
    background: #0f3460;
    height: 6px;
    border-radius: 3px;
}
QSlider::handle:horizontal {
    background: #533483;
    width: 16px;
    height: 16px;
    margin: -5px 0;
    border-radius: 8px;
}
QSlider::handle:horizontal:hover {
    background: #7b5ea7;
}
QLineEdit {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #0f3460;
    border-radius: 4px;
    padding: 4px 8px;
}
QLineEdit:focus {
    border: 1px solid #533483;
}
QToolTip {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #0f3460;
    padding: 4px;
}
"""

LIGHT_STYLESHEET = """
QMainWindow {
    background-color: #f5f5f5;
}
QWidget {
    background-color: #f5f5f5;
    color: #333333;
    font-family: 'Segoe UI', sans-serif;
    font-size: 13px;
}
QToolBar {
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    spacing: 4px;
    padding: 4px;
}
QToolBar QToolButton {
    background-color: transparent;
    color: #333333;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
}
QToolBar QToolButton:hover {
    background-color: #e8e8e8;
}
QToolBar QToolButton:pressed {
    background-color: #d0d0d0;
}
QMenuBar {
    background-color: #ffffff;
    color: #333333;
    border-bottom: 1px solid #e0e0e0;
}
QMenuBar::item:selected {
    background-color: #e0e0e0;
}
QMenu {
    background-color: #ffffff;
    color: #333333;
    border: 1px solid #e0e0e0;
}
QMenu::item:selected {
    background-color: #0078d4;
    color: #ffffff;
}
QStatusBar {
    background-color: #ffffff;
    color: #666666;
    border-top: 1px solid #e0e0e0;
}
QScrollArea {
    border: none;
    background-color: #e8e8e8;
}
QScrollBar:vertical {
    background-color: #f5f5f5;
    width: 12px;
    margin: 0;
}
QScrollBar::handle:vertical {
    background-color: #c0c0c0;
    border-radius: 6px;
    min-height: 30px;
}
QScrollBar::handle:vertical:hover {
    background-color: #a0a0a0;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}
QScrollBar:horizontal {
    background-color: #f5f5f5;
    height: 12px;
}
QScrollBar::handle:horizontal {
    background-color: #c0c0c0;
    border-radius: 6px;
    min-width: 30px;
}
QScrollBar::handle:horizontal:hover {
    background-color: #a0a0a0;
}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
    width: 0px;
}
QLabel {
    color: #333333;
}
QSpinBox, QDoubleSpinBox {
    background-color: #ffffff;
    color: #333333;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    padding: 4px 8px;
    min-width: 50px;
}
QSpinBox:focus, QDoubleSpinBox:focus {
    border: 1px solid #0078d4;
}
QComboBox {
    background-color: #ffffff;
    color: #333333;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    padding: 4px 8px;
    min-width: 100px;
}
QComboBox:hover {
    border: 1px solid #0078d4;
}
QComboBox::drop-down {
    border: none;
    width: 20px;
}
QComboBox QAbstractItemView {
    background-color: #ffffff;
    color: #333333;
    selection-background-color: #0078d4;
    border: 1px solid #d0d0d0;
}
QSlider::groove:horizontal {
    background: #d0d0d0;
    height: 6px;
    border-radius: 3px;
}
QSlider::handle:horizontal {
    background: #0078d4;
    width: 16px;
    height: 16px;
    margin: -5px 0;
    border-radius: 8px;
}
QSlider::handle:horizontal:hover {
    background: #1a8beb;
}
QLineEdit {
    background-color: #ffffff;
    color: #333333;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    padding: 4px 8px;
}
QLineEdit:focus {
    border: 1px solid #0078d4;
}
QToolTip {
    background-color: #ffffff;
    color: #333333;
    border: 1px solid #d0d0d0;
    padding: 4px;
}
"""


TTS_VOICES = [
    ("en-US-GuyNeural", "Guy (Male)"),
    ("en-US-AriaNeural", "Aria (Female)"),
    ("en-US-ChristopherNeural", "Christopher (Male)"),
]

DEFAULT_ZOOM = 1.5
MIN_ZOOM = 0.5
MAX_ZOOM = 5.0
ZOOM_STEP = 0.25

PDF_BG_DARK = (18, 18, 31)
PDF_BG_LIGHT = (232, 232, 232)

AUTO_SCROLL_MIN_SPEED = 1
AUTO_SCROLL_MAX_SPEED = 100
AUTO_SCROLL_DEFAULT_SPEED = 15
