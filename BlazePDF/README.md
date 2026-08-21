# BlazePDF

A lightweight, modern PDF reader for Windows with dark mode, auto-scroll, and text-to-speech.

## Features

- **Dark / Light Mode** - Toggle with `Ctrl+D` for comfortable night reading
- **Auto-Scroll** - Adjustable speed (1-100), press `F7` to start/stop
- **Text-to-Speech** - 3 natural Microsoft Neural voices (English US):
  - Guy (Male)
  - Aria (Female)
  - Christopher (Male)
- **Smart TTS** - Auto-skips cover pages, blank pages, and pages with no text. Splits long text into chunks for reliable playback.
- **PDF Rendering** - Fast rendering powered by PyMuPDF (MuPDF engine)
- **Zoom** - Ctrl+= / Ctrl+- or mouse wheel with Ctrl
- **Page Navigation** - Previous/Next buttons, page number input
- **Scroll Tracking** - Page indicator updates as you scroll

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
python main.py
```

Or open a specific PDF directly:

```bash
python main.py "path/to/your/file.pdf"
```

Double-click `run.bat` for quick launch.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open PDF |
| `Ctrl+W` | Close PDF |
| `Ctrl+D` | Toggle Dark/Light mode |
| `Ctrl+=` | Zoom In |
| `Ctrl+-` | Zoom Out |
| `Ctrl+0` | Fit to Width |
| `F4` | Pause TTS |
| `F5` | Play TTS |
| `F6` | Stop TTS |
| `F7` | Toggle Auto-Scroll |
| `Ctrl+R` | Read All Pages (TTS) |
| `Space` | Play/Pause TTS |

## Tech Stack

- **Python 3.9+**
- **PyQt6** - Modern GUI framework
- **PyMuPDF** - Fast PDF rendering (MuPDF engine)
- **edge-tts** - Microsoft Neural TTS voices (free, no API key needed)
- **Qt Multimedia / pygame** - Audio playback (auto-selects best available)

## Project Structure

```
BlazePDF/
├── main.py              # Entry point
├── requirements.txt     # Dependencies
├── run.bat              # Quick launcher
└── app/
    ├── __init__.py
    ├── main_window.py   # Main window + toolbar
    ├── pdf_canvas.py    # PDF rendering + scroll tracking
    ├── tts_engine.py    # Text-to-speech engine (edge-tts + Qt audio)
    └── themes.py        # Dark/Light theme styles + constants
```
