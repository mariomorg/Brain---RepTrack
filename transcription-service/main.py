from fastapi import FastAPI, UploadFile, File, HTTPException
from faster_whisper import WhisperModel
import tempfile
import os
import shutil

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
        "audio/mpeg", "audio/mp3", "audio/mp4",
        "audio/wav", "audio/x-wav", "audio/wave",  # wav: Windows / macOS / Linux
        "audio/webm", "audio/ogg", "audio/x-m4a", "audio/m4a",
        "audio/flac", "video/webm",
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