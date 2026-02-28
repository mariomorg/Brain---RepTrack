from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from faster_whisper import WhisperModel
import tempfile
import os
import shutil
import subprocess
import json
import re
import requests
import logging

logger = logging.getLogger("transcription-service")

app = FastAPI(title="Transcription Service")

# Carga el modelo una sola vez al arrancar.
# Opciones de modelo: "tiny", "base", "small", "medium", "large-v3"
# Para CPU sin GPU: usar "base" o "small" es suficiente y rápido
MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")  # "cuda" si tienes GPU
COMPUTE_TYPE = "int8" if DEVICE == "cpu" else "float16"

print(f"Cargando modelo Whisper '{MODEL_SIZE}' en {DEVICE}...")
model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
print("Modelo listo.")


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_SIZE, "device": DEVICE}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Valida que sea un archivo de audio
    allowed_types = {
        "audio/mpeg", "audio/mp4", "audio/wav", "audio/webm",
        "audio/ogg", "audio/x-m4a", "audio/m4a", "audio/flac",
        "video/webm",  # grabaciones del navegador suelen venir así
    }
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Tipo de archivo no soportado: {file.content_type}"
        )

    # Guarda el archivo en un temporal
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            beam_size=5,
            language=None,  # detección automática de idioma
            vad_filter=True,  # filtra silencios
        )
        transcript = " ".join(seg.text.strip() for seg in segments)
        return {
            "transcript": transcript,
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration": round(info.duration, 2),
        }
    finally:
        os.unlink(tmp_path)


# ─────────────────────────────────────────────────────────────────
# Video URL transcription — multiple strategies for title + transcript
# ─────────────────────────────────────────────────────────────────

class VideoTranscribeRequest(BaseModel):
    url: str


class VideoTitleRequest(BaseModel):
    url: str


def _extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r'(?:youtu\.be/|youtube\.com/watch\?v=|youtube\.com/embed/|youtube\.com/v/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/shorts/)([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    return None


def _is_youtube_url(url: str) -> bool:
    """Check if URL is a YouTube video."""
    return _extract_video_id(url) is not None


def _get_title_via_oembed(url: str) -> str | None:
    """Get video title using YouTube oEmbed API (no auth required)."""
    video_id = _extract_video_id(url)
    if not video_id:
        return None
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        resp = requests.get(oembed_url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            title = data.get("title", "").strip()
            if title:
                logger.info(f"oEmbed title: {title}")
                return title
    except Exception as e:
        logger.warning(f"oEmbed title fetch failed: {e}")
    return None


def _get_transcript_via_api(url: str) -> dict | None:
    """
    Get transcript using youtube_transcript_api (fetches captions directly,
    no download needed). Tries Spanish first, then English, then any available.
    """
    video_id = _extract_video_id(url)
    if not video_id:
        return None
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        ytt_api = YouTubeTranscriptApi()

        # Try fetching in preferred language order
        for langs in [['es'], ['en'], None]:
            try:
                if langs:
                    transcript = ytt_api.fetch(video_id, languages=langs)
                else:
                    # Fetch whatever is available
                    transcript_list = ytt_api.list(video_id)
                    if transcript_list:
                        transcript = transcript_list[0].fetch()
                    else:
                        continue

                text = " ".join(snippet.text for snippet in transcript.snippets)
                if text.strip():
                    logger.info(f"Got transcript via API ({len(text)} chars, lang={langs})")
                    return {
                        "transcript": text.strip(),
                        "language": langs[0] if langs else "unknown",
                    }
            except Exception:
                continue
    except ImportError:
        logger.warning("youtube_transcript_api not installed")
    except Exception as e:
        logger.warning(f"youtube_transcript_api failed: {e}")
    return None


def _get_transcript_via_ytdlp(url: str) -> dict | None:
    """
    Download audio with yt-dlp and transcribe with Whisper.
    Fallback when caption API fails.
    """
    tmp_dir = tempfile.mkdtemp()
    output_template = os.path.join(tmp_dir, "audio.%(ext)s")
    try:
        download_cmd = [
            "yt-dlp",
            "--js-runtimes", "node",
            "--extract-audio",
            "--audio-format", "mp3",
            "--audio-quality", "5",
            "--no-playlist",
            "--max-filesize", "100M",
            "-o", output_template,
            url,
        ]
        result = subprocess.run(
            download_cmd, capture_output=True, text=True, timeout=300,
        )
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown yt-dlp error"
            logger.warning(f"yt-dlp download failed: {error_msg[:300]}")
            return None

        actual_audio = _find_audio_file(tmp_dir)
        if not actual_audio:
            logger.warning("Audio file not found after yt-dlp download")
            return None

        segments, info = model.transcribe(
            actual_audio, beam_size=5, language=None, vad_filter=True,
        )
        transcript = " ".join(seg.text.strip() for seg in segments)
        return {
            "transcript": transcript,
            "language": info.language,
            "duration": round(info.duration, 2),
        }
    except Exception as e:
        logger.warning(f"yt-dlp transcription failed: {e}")
        return None
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def _get_title_via_ytdlp(url: str) -> str | None:
    """Extract video title using yt-dlp metadata (fallback for non-YouTube)."""
    try:
        result = subprocess.run(
            ["yt-dlp", "--js-runtimes", "node", "--no-playlist", "--print", "title", url],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except Exception:
        pass
    return None


@app.post("/transcribe-video")
async def transcribe_video(request: VideoTranscribeRequest):
    """
    Downloads/fetches transcript from a video URL.
    Strategy chain:
    1. Title: oEmbed API → yt-dlp metadata → URL
    2. Transcript: youtube_transcript_api (captions) → yt-dlp + Whisper
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    logger.info(f"Processing video: {url}")

    # ── Get title ──
    title = None
    if _is_youtube_url(url):
        title = _get_title_via_oembed(url)
    if not title:
        title = _get_title_via_ytdlp(url)
    if not title:
        title = url

    # ── Get transcript ──
    transcript_result = None

    # Strategy 1: YouTube captions API (fast, no download)
    if _is_youtube_url(url):
        transcript_result = _get_transcript_via_api(url)

    # Strategy 2: yt-dlp download + Whisper transcription
    if not transcript_result:
        transcript_result = _get_transcript_via_ytdlp(url)

    if transcript_result:
        return {
            "title": title,
            "transcript": transcript_result["transcript"],
            "language": transcript_result.get("language", "unknown"),
            "duration": transcript_result.get("duration", 0),
        }
    else:
        # Return title but empty transcript — Java side will handle fallback
        logger.warning(f"Could not get transcript for {url}, returning title only")
        return {
            "title": title,
            "transcript": "",
            "language": "unknown",
            "duration": 0,
        }


@app.post("/video-title")
async def get_video_title(request: VideoTitleRequest):
    """
    Quick endpoint to get just the video title (used at capture time).
    Uses oEmbed for YouTube, yt-dlp for other platforms.
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    title = None
    if _is_youtube_url(url):
        title = _get_title_via_oembed(url)
    if not title:
        title = _get_title_via_ytdlp(url)

    return {"title": title or url, "source": "oembed" if title else "url"}


def _find_audio_file(directory: str) -> str | None:
    """Find the downloaded audio file in the temp directory."""
    audio_extensions = {".mp3", ".m4a", ".wav", ".opus", ".webm", ".ogg"}
    for f in os.listdir(directory):
        if os.path.splitext(f)[1].lower() in audio_extensions:
            return os.path.join(directory, f)
    return None