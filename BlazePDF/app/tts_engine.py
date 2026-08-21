
import asyncio
import os
import tempfile
import edge_tts
import pygame

from PyQt6.QtCore import QThread, pyqtSignal, QObject


class _TTSWorker(QThread):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(self, text, voice, rate="+0%", parent=None):
        super().__init__(parent)
        self.text = text
        self.voice = voice
        self.rate = rate

    def run(self):
        try:
            tmp = os.path.join(tempfile.gettempdir(), "blaze_tts_output.mp3")
            communicate = edge_tts.Communicate(
                self.text, self.voice, rate=self.rate
            )

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(
                    communicate.save(tmp)
                )
            finally:
                loop.close()

            self.finished.emit(tmp)
        except Exception as e:
            self.error.emit(str(e))


class TTSEngine(QObject):
    playback_started = pyqtSignal()
    playback_stopped = pyqtSignal()
    playback_error = pyqtSignal(str)
    page_finished = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self._worker = None
        self._playing = False
        self._paused = False
        self._current_file = None
        self._voice = "en-US-GuyNeural"
        self._rate = "+0%"
        self._timer = None

        pygame.mixer.init()

    def set_voice(self, voice_id):
        self._voice = voice_id

    def set_rate(self, rate):
        self._rate = rate

    def speak(self, text):
        if not text or not text.strip():
            self.page_finished.emit()
            return

        self.stop()

        self._worker = _TTSWorker(text, self._voice, self._rate)
        self._worker.finished.connect(self._on_audio_ready)
        self._worker.error.connect(self._on_error)
        self._worker.start()
        self._playing = True
        self._paused = False
        self.playback_started.emit()

    def _on_audio_ready(self, filepath):
        try:
            self._current_file = filepath
            pygame.mixer.music.load(filepath)
            pygame.mixer.music.play()
            self._start_monitor()
        except Exception as e:
            self.playback_error.emit(str(e))
            self._playing = False
            self.playback_stopped.emit()

    def _start_monitor(self):
        from PyQt6.QtCore import QTimer
        if self._timer:
            self._timer.stop()
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._check_playback)
        self._timer.start(200)

    def _check_playback(self):
        if self._playing and not self._paused:
            if not pygame.mixer.music.get_busy():
                self._playing = False
                if self._timer:
                    self._timer.stop()
                self.playback_stopped.emit()
                self.page_finished.emit()

    def pause(self):
        if self._playing and not self._paused:
            pygame.mixer.music.pause()
            self._paused = True

    def resume(self):
        if self._playing and self._paused:
            pygame.mixer.music.unpause()
            self._paused = False

    def stop(self):
        try:
            pygame.mixer.music.stop()
        except Exception:
            pass
        if self._timer:
            self._timer.stop()
        self._playing = False
        self._paused = False
        self.playback_stopped.emit()

    def is_playing(self):
        return self._playing and not self._paused

    def is_paused(self):
        return self._paused

    def _on_error(self, msg):
        self.playback_error.emit(msg)
        self._playing = False
        self.playback_stopped.emit()

    def cleanup(self):
        self.stop()
        try:
            pygame.mixer.quit()
        except Exception:
            pass
