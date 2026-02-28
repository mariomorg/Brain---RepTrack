#!/bin/bash
# Ejecuta el servicio de transcripción localmente
# Instala dependencias si no existen

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Crea entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate

# Instala dependencias
pip install -r requirements.txt --quiet

# Configura variables de entorno opcionales
# WHISPER_MODEL=base   (tiny | base | small | medium | large-v3)
# WHISPER_DEVICE=cpu   (cpu | cuda)
export WHISPER_MODEL=${WHISPER_MODEL:-base}
export WHISPER_DEVICE=${WHISPER_DEVICE:-cpu}

echo "Iniciando servicio en http://localhost:8081"
uvicorn main:app --host 0.0.0.0 --port 8081 --reload