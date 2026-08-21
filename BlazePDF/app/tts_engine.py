
import asyncio
import os
import subprocess
import tempfile
import edge_tts

from PyQt6.QtCore import QThread, pyqtSignal, QObject, QTimer


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

            chunks = self._split_text(self.text, max_chars=3000)
            if len(chunks) == 1:
                communicate = edge_tts.Communicate(
                    chunks[0], self.voice, rate=self.rate
                )
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    loop.run_until_complete(communicate.save(tmp))
                finally:
                    loop.close()
                self.finished.emit(tmp)
            else:
                part_files = []
                for i, chunk in enumerate(chunks):
                    part_path = os.path.join(
                        tempfile.gettempdir(), f"blaze_tts_part_{i}.mp3"
                    )
                    communicate = edge_tts.Communicate(
                        chunk, self.voice, rate=self.rate
                    )
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    try:
                        loop.run_until_complete(communicate.save(part_path))
                    finally:
                        loop.close()
                    part_files.append(part_path)

                self._concat_mp3(part_files, tmp)
                for f in part_files:
                    try:
                        os.remove(f)
                    except OSError:
                        pass
                self.finished.emit(tmp)
        except Exception as e:
            self.error.emit(str(e))

    def _split_text(self, text, max_chars=3000):
        if len(text) <= max_chars:
            return [text]
        chunks = []
        while text:
            if len(text) <= max_chars:
                chunks.append(text)
                break
            cut = text.rfind(".", 0, max_chars)
            if cut == -1:
                cut = text.rfind(" ", 0, max_chars)
            if cut == -1:
                cut = max_chars
            else:
                cut += 1
            chunks.append(text[:cut])
            text = text[cut:].lstrip()
        return chunks

    def _concat_mp3(self, files, output):
        try:
            import pygame
            pygame.mixer.init(frequency=44100)
            sounds = []
            for f in files:
                sounds.append(pygame.mixer.Sound(f))
            total_length = sum(s.get_length() for s in sounds)
            sr = pygame.mixer.get_init()[0]
            import array
            merged = array.array('h')
            for s in sounds:
                buf = s.get_raw()
                merged.extend(array.array('h', buf))
            merged_sound = pygame.mixer.Sound(buffer=merged)
            pygame.mixer.Sound.write(merged_sound, output)
            pygame.mixer.quit()
        except Exception:
            concat = b""
            for f in files:
                with open(f, "rb") as fh:
                    concat += fh.read()
            with open(output, "wb") as out:
                out.write(concat)


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
        self._audio_out = None

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
            self._init_audio()
            self._play_file(filepath)
            self._start_monitor()
        except Exception as e:
            self.playback_error.emit(str(e))
            self._playing = False
            self.playback_stopped.emit()

    def _init_audio(self):
        try:
            from PyQt6.QtMultimedia import QMediaPlayer, QAudioOutput
            self._audio_out = QAudioOutput()
            self._audio_out.setVolume(1.0)
            self._media_player = QMediaPlayer()
            self._media_player.setAudioOutput(self._audio_out)
            self._use_qt_audio = True
        except ImportError:
            self._use_qt_audio = False
            try:
                import pygame
                if not pygame.mixer.get_init():
                    pygame.mixer.init()
            except Exception:
                pass

    def _play_file(self, filepath):
        if self._use_qt_audio:
            from PyQt6.QtCore import QUrl
            self._media_player.setSource(QUrl.fromLocalFile(filepath))
            self._media_player.play()
        else:
            import pygame
            pygame.mixer.music.load(filepath)
            pygame.mixer.music.play()

    def _start_monitor(self):
        if self._timer:
            self._timer.stop()
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._check_playback)
        self._timer.start(200)

    def _check_playback(self):
        if self._playing and not self._paused:
            busy = False
            if self._use_qt_audio:
                busy = self._media_player.playbackState() == 1
            else:
                try:
                    import pygame
                    busy = pygame.mixer.music.get_busy()
                except Exception:
                    pass

            if not busy:
                self._playing = False
                if self._timer:
                    self._timer.stop()
                self.playback_stopped.emit()
                self.page_finished.emit()

    def pause(self):
        if self._playing and not self._paused:
            if self._use_qt_audio:
                self._media_player.pause()
            else:
                import pygame
                pygame.mixer.music.pause()
            self._paused = True

    def resume(self):
        if self._playing and self._paused:
            if self._use_qt_audio:
                self._media_player.play()
            else:
                import pygame
                pygame.mixer.music.unpause()
            self._paused = False

    def stop(self):
        if self._worker and self._worker.isRunning():
            self._worker.quit()
            self._worker.wait(3000)
        try:
            if self._use_qt_audio:
                self._media_player.stop()
            else:
                import pygame
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
            if not self._use_qt_audio:
                import pygame
                pygame.mixer.quit()
        except Exception:
            pass
