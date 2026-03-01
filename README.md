# 🧠 Brain-RepTrack

> **Tu cerebro digital** — Sistema de gestión de conocimiento personal con IA que captura, clasifica, organiza y conecta cualquier tipo de contenido automáticamente.

Brain-RepTrack es una plataforma que actúa como un **segundo cerebro**: captura ideas, enlaces, notas de voz, archivos, fragmentos de código y vídeos desde múltiples puntos de entrada (webapp, extensión de navegador, PWA). La IA integrada (Ollama/Llama3) clasifica automáticamente el contenido, genera resúmenes enriquecidos y lo organiza en un grafo de conocimiento jerárquico visualizable en un mapa interactivo.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Características Principales](#-características-principales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Ejecución](#-ejecución)
- [API REST](#-api-rest)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelo de Datos](#-modelo-de-datos)
- [Pipeline de IA](#-pipeline-de-ia)
- [Extensión de Navegador](#-extensión-de-navegador)
- [PWA](#-pwa)
- [Variables de Entorno](#-variables-de-entorno)

---

## 🏗 Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend PWA  │    │ Browser Extension│    │   Share Target  │
│  React + Vite   │    │   Chrome MV3     │    │     (PWA)       │
│   :5173         │    │                  │    │                 │
└────────┬────────┘    └────────┬─────────┘    └────────┬────────┘
         │                      │                       │
         └──────────────┬───────┴───────────────────────┘
                        │ HTTP/REST
                        ▼
              ┌─────────────────────┐
              │   Backend (API)     │
              │  Spring Boot 3.2.3  │
              │      :8080          │
              └──┬──────┬───────┬───┘
                 │      │       │
         ┌───────┘      │       └────────┐
         ▼              ▼                ▼
┌──────────────┐ ┌────────────┐ ┌──────────────────┐
│  PostgreSQL  │ │   Ollama   │ │  Transcription   │
│    :5432     │ │ (Llama3)   │ │  Service (Python) │
│              │ │   :11434   │ │  Whisper  :8081   │
└──────────────┘ └────────────┘ └──────────────────┘
```

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | React 18, Vite 5 |
| **PWA** | vite-plugin-pwa + Workbox | — |
| **Backend** | Spring Boot + JPA/Hibernate | 3.2.3, Java 17 |
| **Base de Datos** | PostgreSQL | 12+ |
| **IA / LLM** | Ollama (Llama3:8b) | — |
| **Transcripción** | FastAPI + faster-whisper | Python 3.10+ |
| **Autenticación** | JWT (jjwt) + BCrypt | — |
| **Ext. Navegador** | Chrome Manifest V3 | — |
| **Extracción PDF** | Apache PDFBox | 3.0.1 |
| **Web Scraping** | Jsoup (DuckDuckGo) | 1.17.2 |
| **Descarga Vídeo** | yt-dlp + youtube_transcript_api | — |

---

## ✨ Características Principales

### 📥 Inbox Unificado
- Captura **multi-modo**: texto libre, grabación de audio, subida de archivos (PDF, imágenes), enlaces, URLs de vídeo
- Detección automática del tipo de contenido (texto, link, idea, nota de voz, código, referencia de vídeo, artículo, archivo)
- Pipeline de procesamiento con IA: clasificación → resumen → generación de Markdown
- Chips de sugerencias inteligentes (resumir, reformular, transcribir, extraer relaciones, etc.)

### 🧠 Cerebro Digital
- Búsqueda avanzada con autocompletado de `#tags`
- Filtrado por etiquetas y ordenación (reciente, antiguo, alfabético)
- Vista en rejilla y vista por carpetas
- Resúmenes automáticos de carpetas generados por IA
- Paginación

### 🗺️ Mapa Interactivo de Conocimiento
- Visualización en **Canvas HTML5** con zoom y pan
- Jerarquía de tags: **Planetas (L0)** → **Lunas (L1)** → **Satélites (L2)**
- Pins de ideas conectados a sus nodos
- Panel lateral con detalles
- Navegación click-to-explore

### 🎙️ Transcripción de Audio y Vídeo
- Grabación de audio directa desde el navegador
- Transcripción automática con **Whisper** (detección de idioma)
- Soporte para vídeos de YouTube (captions API + fallback a descarga + Whisper)
- Extracción de títulos vía oEmbed

### 🔐 Autenticación
- Registro e inicio de sesión con JWT
- Tokens con expiración de 24h
- Hash de contraseñas con BCrypt
- Rutas protegidas en frontend

### 🌐 Extensión de Navegador (Chrome)
- Popup rápido con `Ctrl+Shift+I`
- Menús contextuales: enviar selección, página, enlace o imagen
- Captura rápida de página con `Ctrl+Shift+S`
- Badge de estado con feedback visual

### 📱 PWA (Progressive Web App)
- Instalable en móvil y escritorio
- Web Share Target: recibe contenido desde la función "Compartir" del SO
- Caché offline con Workbox (NetworkFirst para API)
- Service Worker con auto-update

### 📊 Panel de Configuración y Perfil
- Dashboard de salud de servicios (Ollama, Whisper, PostgreSQL)
- Toggle de tema claro/oscuro
- Estadísticas del usuario: notas por tipo, tags, relaciones, items en inbox
- Perfil editable

---

## 📦 Requisitos Previos

- **Java 17** (JDK)
- **Maven 3.8+**
- **Node.js 18+** y **npm**
- **PostgreSQL 12+**
- **Python 3.10+** y **pip**
- **Ollama** con el modelo `llama3:8b`
- **FFmpeg** (requerido por yt-dlp para transcripciones de vídeo)
- **Google Chrome** (para la extensión, opcional)

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/<usuario>/Brain---RepTrack.git
cd Brain---RepTrack
```

### 2. Base de datos (PostgreSQL)

```sql
CREATE DATABASE brainreptrackdb;
```

El esquema y los datos iniciales se crean automáticamente al iniciar el backend (vía `schema.sql` y `data.sql`).

### 3. Backend (Spring Boot)

```bash
cd backend

# Configurar credenciales de BD en src/main/resources/application.properties
# spring.datasource.username=postgres
# spring.datasource.password=sa

mvn clean install
```

### 4. Frontend (React + Vite)

```bash
cd frontend
npm install
```

### 5. Servicio de Transcripción (Python)

```bash
cd transcription-service
pip install -r requirements.txt
```

### 6. Ollama (IA)

```bash
# Instalar Ollama: https://ollama.ai
ollama pull llama3:8b
```

### 7. Extensión de Navegador (opcional)

1. Abre `chrome://extensions/`
2. Activa **Modo desarrollador**
3. Haz clic en **Cargar descomprimida**
4. Selecciona la carpeta `browser_extension/`

---

## ▶️ Ejecución

Inicia cada servicio en una terminal separada:

```bash
# 1. PostgreSQL (debe estar corriendo)

# 2. Ollama
ollama serve

# 3. Backend (puerto 8080)
cd backend
mvn spring-boot:run

# 4. Frontend (puerto 5173)
cd frontend
npm run dev

# 5. Transcripción (puerto 8081)
cd transcription-service
uvicorn main:app --host 0.0.0.0 --port 8081
```

Accede a la aplicación en: **http://localhost:5173**

---

## 📡 API REST

### Autenticación — `/api/auth`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/register` | Registro de usuario (devuelve JWT) |
| `POST` | `/login` | Login (devuelve JWT) |
| `GET` | `/me` | Perfil del usuario autenticado |
| `PUT` | `/profile` | Actualizar perfil |

### Inbox — `/api/inbox`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/capture` | Captura unificada (texto, links, ideas, código, vídeos) |
| `POST` | `/capture/audio` | Captura de nota de voz (audio → Whisper → pipeline) |
| `POST` | `/capture/file` | Captura de archivo (PDF/TXT → extracción → pipeline) |
| `GET` | `/` | Listar todos los items |
| `GET` | `/{id}` | Obtener item por ID |
| `GET` | `/status/{status}` | Filtrar por estado |
| `GET` | `/count/pending` | Contar items pendientes |
| `PUT` | `/{id}` | Actualizar item |
| `DELETE` | `/{id}` | Eliminar item |
| `POST` | `/{id}/process` | Reprocesar con IA |
| `POST` | `/{id}/procesar` | Procesamiento completo (Nota + Markdown + sugerencias) |
| `POST` | `/{id}/create-markdown` | Generar documento Markdown |

### Notas — `/api/notes`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crear nota |
| `GET` | `/` | Listar todas las notas |
| `GET` | `/{id}` | Obtener nota por ID |
| `GET` | `/type/{type}` | Filtrar por tipo |
| `GET` | `/search?q=` | Búsqueda full-text |
| `PUT` | `/{id}` | Actualizar nota |
| `DELETE` | `/{id}` | Eliminar nota |
| `GET` | `/tags` | Todos los tags distintos |
| `GET` | `/tag/{tagName}` | Notas por tag |
| `GET` | `/{id}/similares` | Notas similares |
| `POST` | `/folder-summary` | Resumen de carpeta con IA |
| `GET` | `/{id}/file` | Servir archivo original |

### Relaciones — `/api/relations`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crear relación |
| `GET` | `/` | Listar todas |
| `GET` | `/{id}` | Obtener por ID |
| `GET` | `/note/{noteId}/as-source` | Relaciones como origen |
| `GET` | `/note/{noteId}/as-target` | Relaciones como destino |
| `PATCH` | `/{id}/validate` | Validar relación |
| `DELETE` | `/{id}` | Eliminar relación |

### Otros

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/profile/stats` | Estadísticas del dashboard |
| `GET` | `/api/health/services` | Salud de servicios (Ollama, Whisper, PostgreSQL) |

> **Nota:** Todas las peticiones autenticadas requieren el header `Authorization: Bearer <JWT>`.

---

## 📁 Estructura del Proyecto

```
Brain---RepTrack/
├── backend/                          # API REST (Spring Boot)
│   ├── pom.xml                       # Dependencias Maven
│   ├── markdown-notes/               # Documentos Markdown generados por IA
│   └── src/
│       ├── main/
│       │   ├── java/com/brainreptrack/
│       │   │   ├── config/           # CORS, JWT, seguridad
│       │   │   ├── controller/       # Controladores REST
│       │   │   ├── model/            # Entidades JPA
│       │   │   ├── repository/       # Repositorios Spring Data
│       │   │   └── service/          # Lógica de negocio y AI
│       │   └── resources/
│       │       ├── application.properties
│       │       └── db/               # schema.sql + data.sql
│       └── test/                     # Tests unitarios
│
├── frontend/                         # SPA (React + TypeScript)
│   ├── package.json
│   ├── vite.config.ts                # Config Vite + PWA
│   ├── public/icons/                 # Iconos PWA
│   └── src/
│       ├── features/                 # Módulos por funcionalidad
│       │   ├── auth/                 # Autenticación (AuthContext, JWT)
│       │   ├── cerebro/              # Cerebro digital (búsqueda, tags)
│       │   ├── inbox/                # Inbox (captura, procesamiento)
│       │   ├── map/                  # Mapa interactivo de conocimiento
│       │   ├── session/              # Sesiones de repaso
│       │   ├── topic/                # Gestión de temas
│       │   └── user/                 # Perfil de usuario
│       ├── pages/                    # Páginas/vistas principales
│       ├── routes/                   # Configuración de rutas
│       ├── shared/                   # Componentes y utilidades compartidas
│       │   ├── api/                  # Cliente HTTP (Axios)
│       │   ├── components/           # Componentes reutilizables
│       │   └── types/                # Tipos TypeScript compartidos
│       └── lib/                      # Utilidades (cámara, LOD, hit-test)
│
├── transcription-service/            # Microservicio de transcripción
│   ├── main.py                       # FastAPI app (Whisper + yt-dlp)
│   ├── requirements.txt
│   └── start.sh
│
├── browser_extension/                # Extensión Chrome MV3
│   ├── manifest.json
│   ├── popup.html / popup.js / popup.css
│   └── background.js                # Service worker + context menus
│
└── package.json                      # Dependencias raíz
```

---

## 🗄 Modelo de Datos

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  inbox_items │       │    notes     │       │     tags     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (UUID) PK │       │ id (UUID) PK │       │ name (PK)    │
│ raw_text     │──────>│ title        │<──┐   │ parent_name  │──┐
│ detected_type│       │ path         │   │   │ (self-FK)    │  │
│ status       │       │ type         │   │   └──────────────┘  │
│ proposals_json│      │ summary      │   │          ▲          │
│ final_json   │       │ confidence   │   │          │          │
│ source_url   │       │ created_at   │   │   ┌──────┴───────┐  │
│ file_path    │       └──────────────┘   │   │  note_tags   │  │
│ ai_summary   │              │           │   ├──────────────┤  │
│ created_at   │              │           │   │ note_id (FK) │  │
│ processed_at │              │           └───│ tag_name (FK)│──┘
└──────────────┘              │               │ confidence   │
                              │               └──────────────┘
                              │
                       ┌──────┴───────┐     ┌──────────────┐
                       │  relations   │     │    users     │
                       ├──────────────┤     ├──────────────┤
                       │ id (UUID) PK │     │ id (UUID) PK │
                       │ note_a (FK)  │     │ username     │
                       │ note_b (FK)  │     │ email        │
                       │ score        │     │ password_hash│
                       │ validated    │     │ display_name │
                       └──────────────┘     │ created_at   │
                                            └──────────────┘
```

### Flujo de estados de InboxItem

```
PENDING → PROCESSING → AWAITING_APPROVAL → PROCESSED
                                         → REJECTED
                                         → ARCHIVED
```

### Taxonomía jerárquica de tags (datos semilla)

8 dominios raíz con subniveles:

| L0 (Raíz) | Ejemplos L1 | Ejemplos L2 |
|------------|-------------|-------------|
| `dev` | `dev/frontend`, `dev/backend` | `dev/frontend/react`, `dev/backend/spring` |
| `ia` | `ia/ml`, `ia/nlp` | `ia/ml/supervised`, `ia/nlp/transformers` |
| `infra` | `infra/cloud`, `infra/devops` | `infra/cloud/aws`, `infra/devops/docker` |
| `soft` | `soft/patterns`, `soft/architecture` | — |
| `cocina` | `cocina/recetas`, `cocina/técnicas` | — |
| `deporte` | `deporte/running`, `deporte/gym` | — |
| `viajes` | `viajes/europa`, `viajes/asia` | — |
| `salud` | `salud/nutrición`, `salud/mental` | — |

---

## 🤖 Pipeline de IA

El procesamiento de contenido sigue un pipeline multi-paso:

```
Captura → Detección de Tipo → Clasificación IA → Resumen IA → Nota + Markdown
```

1. **Detección de tipo** — Heurísticas automáticas: patrones de URL (YouTube, artículos), sintaxis de código, longitud de texto, detección de enlaces
2. **Clasificación** — Ollama analiza el contenido contra el árbol de tags existente y propone categorización (con fallback a creación de nuevos tags)
3. **Resumen enriquecido** — Pipeline multi-paso:
   - Evalúa si el contenido es auto-suficiente
   - Búsqueda web opcional (DuckDuckGo vía Jsoup) para enriquecer contexto
   - Genera resumen extenso con la IA
4. **Generación de Markdown** — Documento `.md` guardado en `./markdown-notes/`
5. **Análisis de sugerencias** — Sugerencias basadas en reglas: resumir, reformular, transcribir, OCR, extraer URLs, relaciones, formatear código, extraer vídeo

---

## 🌐 Extensión de Navegador

La extensión de Chrome permite capturar contenido rápidamente desde cualquier página:

| Acción | Atajo | Descripción |
|--------|-------|-------------|
| Abrir popup de captura | `Ctrl+Shift+I` | Textarea pre-rellenado con texto seleccionado |
| Captura rápida de página | `Ctrl+Shift+S` | Envía título + URL como LINK |
| Menú contextual | Click derecho | Enviar selección, página, enlace o imagen |

Configuración: apuntar al backend en `http://localhost:8080`.

---

## 📱 PWA

Brain-RepTrack es una **Progressive Web App** instalable:

- **Instalable** en móvil y escritorio desde el navegador
- **Web Share Target** — recibe contenido compartido desde otras apps del SO (botón "Compartir con…")
- **Offline** — caché de assets con Workbox + estrategia NetworkFirst para API
- **Service Worker** con auto-actualización

---

## ⚙️ Variables de Entorno

### Backend (`application.properties`)

| Propiedad | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| `server.port` | `8080` | Puerto del backend |
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/brainreptrackdb` | URL de PostgreSQL |
| `spring.datasource.username` | `postgres` | Usuario de BD |
| `spring.datasource.password` | `sa` | Contraseña de BD |
| `ollama.url` | `http://localhost:11434` | URL de Ollama |
| `ollama.model` | `llama3:8b` | Modelo de IA |
| `transcription.service.url` | `http://localhost:8081` | URL del servicio Whisper |
| `jwt.secret` | (configurado) | Clave secreta JWT (cambiar en producción) |
| `jwt.expiration-ms` | `86400000` | Expiración JWT (24h) |
| `markdown.output-dir` | `./markdown-notes` | Directorio de salida Markdown |
| `spring.servlet.multipart.max-file-size` | `50MB` | Tamaño máximo de archivo |

### Servicio de Transcripción (variables de entorno)

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `WHISPER_MODEL` | `base` | Modelo Whisper (`tiny`, `base`, `small`, `medium`, `large-v3`) |
| `WHISPER_DEVICE` | `cpu` | Dispositivo (`cpu` o `cuda` para GPU) |

---

## 🧪 Tests

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm run lint
```

---

## 📄 Licencia

Este proyecto es de uso académico / personal.

---

<p align="center">
  Desarrollado con ❤️ y mucha ☕
</p>
