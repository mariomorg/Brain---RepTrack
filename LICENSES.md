# 📄 Licencias de Terceros — Brain-RepTrack

Este documento detalla las dependencias de terceros utilizadas en el proyecto Brain-RepTrack, junto con sus respectivas licencias.

---

## 📋 Tabla de Contenidos

- [Backend (Java / Spring Boot)](#-backend-java--spring-boot)
- [Frontend (React / TypeScript)](#-frontend-react--typescript)
- [Servicio de Transcripción (Python)](#-servicio-de-transcripción-python)
- [Herramientas externas](#-herramientas-externas)
- [Resumen de licencias](#-resumen-de-licencias)

---

## ☕ Backend (Java / Spring Boot)

| Dependencia | Versión | Licencia | Enlace |
|-------------|---------|----------|--------|
| Spring Boot Starter Web | 3.2.3 | Apache 2.0 | [spring.io](https://spring.io/projects/spring-boot) |
| Spring Boot Starter WebFlux | 3.2.3 | Apache 2.0 | [spring.io](https://spring.io/projects/spring-boot) |
| Spring Boot Starter Data JPA | 3.2.3 | Apache 2.0 | [spring.io](https://spring.io/projects/spring-data-jpa) |
| Spring Boot Starter Validation | 3.2.3 | Apache 2.0 | [spring.io](https://spring.io/projects/spring-boot) |
| Spring Boot Starter Test | 3.2.3 | Apache 2.0 | [spring.io](https://spring.io/projects/spring-boot) |
| Spring Security Crypto | 6.2.x | Apache 2.0 | [spring.io](https://spring.io/projects/spring-security) |
| Hibernate ORM | 6.4.x | LGPL 2.1 | [hibernate.org](https://hibernate.org/orm/) |
| Lombok | latest | MIT | [projectlombok.org](https://projectlombok.org/) |
| JJWT (jjwt-api, jjwt-impl, jjwt-jackson) | 0.12.5 | Apache 2.0 | [github.com/jwtk/jjwt](https://github.com/jwtk/jjwt) |
| PostgreSQL JDBC Driver | latest | BSD-2-Clause | [jdbc.postgresql.org](https://jdbc.postgresql.org/) |
| Jsoup | 1.17.2 | MIT | [jsoup.org](https://jsoup.org/) |
| Apache PDFBox | 3.0.1 | Apache 2.0 | [pdfbox.apache.org](https://pdfbox.apache.org/) |
| Jackson (JSON) | 2.16.x | Apache 2.0 | [github.com/FasterXML/jackson](https://github.com/FasterXML/jackson) |

---

## ⚛️ Frontend (React / TypeScript)

### Dependencias de producción

| Dependencia | Versión | Licencia | Enlace |
|-------------|---------|----------|--------|
| React | ^18.2.0 | MIT | [react.dev](https://react.dev/) |
| React DOM | ^18.2.0 | MIT | [react.dev](https://react.dev/) |
| React Router DOM | ^6.22.3 | MIT | [reactrouter.com](https://reactrouter.com/) |
| React Markdown | ^10.1.0 | MIT | [github.com/remarkjs/react-markdown](https://github.com/remarkjs/react-markdown) |
| Axios | ^1.6.7 | MIT | [axios-http.com](https://axios-http.com/) |

### Dependencias de desarrollo

| Dependencia | Versión | Licencia | Enlace |
|-------------|---------|----------|--------|
| Vite | ^5.1.6 | MIT | [vitejs.dev](https://vitejs.dev/) |
| TypeScript | ^5.2.2 | Apache 2.0 | [typescriptlang.org](https://www.typescriptlang.org/) |
| @vitejs/plugin-react | ^4.2.1 | MIT | [github.com/vitejs/vite-plugin-react](https://github.com/vitejs/vite-plugin-react) |
| vite-plugin-pwa | ^1.2.0 | MIT | [github.com/vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) |
| Workbox Window | ^7.4.0 | MIT | [developer.chrome.com/docs/workbox](https://developer.chrome.com/docs/workbox) |
| ESLint | ^8.57.0 | MIT | [eslint.org](https://eslint.org/) |
| @typescript-eslint/eslint-plugin | ^7.1.1 | MIT | [typescript-eslint.io](https://typescript-eslint.io/) |
| @typescript-eslint/parser | ^7.1.1 | BSD-2-Clause | [typescript-eslint.io](https://typescript-eslint.io/) |
| eslint-plugin-react-hooks | ^4.6.0 | MIT | [react.dev](https://react.dev/) |
| eslint-plugin-react-refresh | ^0.4.5 | MIT | [github.com/ArnaudBarre/eslint-plugin-react-refresh](https://github.com/ArnaudBarre/eslint-plugin-react-refresh) |
| Sharp | ^0.34.5 | Apache 2.0 | [sharp.pixelplumbing.com](https://sharp.pixelplumbing.com/) |
| @types/react | ^18.2.64 | MIT | [npmjs.com](https://www.npmjs.com/package/@types/react) |
| @types/react-dom | ^18.2.21 | MIT | [npmjs.com](https://www.npmjs.com/package/@types/react-dom) |

---

## 🐍 Servicio de Transcripción (Python)

| Dependencia | Versión | Licencia | Enlace |
|-------------|---------|----------|--------|
| FastAPI | 0.115.6 | MIT | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) |
| Uvicorn | 0.34.0 | BSD-3-Clause | [uvicorn.org](https://www.uvicorn.org/) |
| faster-whisper | 1.1.1 | MIT | [github.com/SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) |
| python-multipart | 0.0.20 | Apache 2.0 | [github.com/Kludex/python-multipart](https://github.com/Kludex/python-multipart) |
| yt-dlp | ≥2024.1.0 | Unlicense | [github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) |
| youtube_transcript_api | ≥1.0.0 | MIT | [github.com/jdepoix/youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) |
| Requests | ≥2.28.0 | Apache 2.0 | [docs.python-requests.org](https://docs.python-requests.org/) |

---

## 🔧 Herramientas externas

Estas herramientas no son dependencias empaquetadas, pero son necesarias para ejecutar el proyecto:

| Herramienta | Licencia | Uso en el proyecto | Enlace |
|-------------|----------|-------------------|--------|
| PostgreSQL | PostgreSQL License (permisiva, tipo MIT/BSD) | Base de datos relacional | [postgresql.org](https://www.postgresql.org/) |
| Ollama | MIT | Servidor local de modelos LLM | [ollama.ai](https://ollama.ai/) |
| Llama 3 (Meta) | Meta Llama 3 Community License | Modelo de IA para clasificación y resúmenes | [llama.meta.com](https://llama.meta.com/) |
| OpenAI Whisper (modelo base) | MIT | Modelo de transcripción de audio | [github.com/openai/whisper](https://github.com/openai/whisper) |
| FFmpeg | LGPL 2.1 / GPL 2.0 (según build) | Procesamiento de audio/vídeo (requerido por yt-dlp) | [ffmpeg.org](https://ffmpeg.org/) |
| Node.js | MIT | Runtime JavaScript para el frontend | [nodejs.org](https://nodejs.org/) |
| Java JDK 17 | GPL 2.0 + Classpath Exception | Runtime del backend | [openjdk.org](https://openjdk.org/) |
| Maven | Apache 2.0 | Build system del backend | [maven.apache.org](https://maven.apache.org/) |
| Google Chrome | Propietaria (extensión Chrome MV3) | Navegador para la extensión | [chrome.google.com](https://www.google.com/chrome/) |

---

## 📊 Resumen de licencias

| Licencia | Tipo | Dependencias |
|----------|------|--------------|
| **MIT** | Permisiva | React, React DOM, React Router, React Markdown, Axios, Vite, ESLint, Lombok, Jsoup, FastAPI, faster-whisper, youtube_transcript_api, Ollama, Whisper, Workbox, vite-plugin-pwa |
| **Apache 2.0** | Permisiva | Spring Boot, Spring Security, Spring Data JPA, JJWT, Apache PDFBox, TypeScript, Sharp, Jackson, Maven, python-multipart, Requests |
| **BSD-2-Clause** | Permisiva | PostgreSQL JDBC Driver, @typescript-eslint/parser |
| **BSD-3-Clause** | Permisiva | Uvicorn |
| **LGPL 2.1** | Copyleft débil | Hibernate ORM, FFmpeg (según build) |
| **PostgreSQL License** | Permisiva (tipo BSD) | PostgreSQL |
| **GPL 2.0 + CPE** | Copyleft (con excepción) | OpenJDK 17 |
| **Unlicense** | Dominio público | yt-dlp |
| **Meta Llama 3 Community** | Condicional (uso comunitario) | Llama 3 |
| **Propietaria** | Propietaria | Google Chrome |

---

## ⚠️ Notas importantes

1. **Hibernate ORM** usa LGPL 2.1 — permite el uso en aplicaciones propietarias mientras no se modifique Hibernate en sí. Su uso como dependencia (tal cual) es compatible con proyectos cerrados.

2. **Meta Llama 3** tiene una licencia comunitaria específica que permite uso gratuito para organizaciones con menos de 700 millones de usuarios activos mensuales. Consultar los [términos completos](https://llama.meta.com/llama3/license/).

3. **FFmpeg** puede compilarse bajo LGPL 2.1 o GPL 2.0 según las opciones de build. La versión estándar distribuida suele ser LGPL.

4. **OpenJDK 17** usa GPL 2.0 con Classpath Exception, lo que permite su uso para ejecutar aplicaciones sin que la GPL se aplique al código de la aplicación.

5. Todas las licencias permisivas (MIT, Apache 2.0, BSD) permiten uso comercial, modificación y redistribución con atribución.

---

<p align="center">
  Última actualización: Marzo 2026
</p>
