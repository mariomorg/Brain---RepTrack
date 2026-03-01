# 🤝 Guía de Contribución — Brain-RepTrack

¡Gracias por tu interés en contribuir a **Brain-RepTrack**! Esta guía describe las convenciones, flujo de trabajo y buenas prácticas que seguimos en el proyecto.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [¿Cómo puedo contribuir?](#-cómo-puedo-contribuir)
- [Configuración del entorno de desarrollo](#-configuración-del-entorno-de-desarrollo)
- [Flujo de trabajo con Git](#-flujo-de-trabajo-con-git)
- [Convenciones de ramas](#-convenciones-de-ramas)
- [Convenciones de commits](#-convenciones-de-commits)
- [Pull Requests](#-pull-requests)
- [Estilo de código](#-estilo-de-código)
- [Estructura de módulos (Frontend)](#-estructura-de-módulos-frontend)
- [Estructura de capas (Backend)](#-estructura-de-capas-backend)
- [Tests](#-tests)
- [Reporte de bugs](#-reporte-de-bugs)
- [Solicitud de funcionalidades](#-solicitud-de-funcionalidades)

---

## 📜 Código de Conducta

- Trata a todos los colaboradores con respeto y profesionalismo.
- Se aceptan críticas constructivas; no se toleran ataques personales.
- Comunica de forma clara y concisa en issues y PRs.

---

## 🛠 ¿Cómo puedo contribuir?

- 🐛 **Reportar bugs** — Abre un issue describiendo el problema.
- 💡 **Proponer funcionalidades** — Abre un issue con la etiqueta `enhancement`.
- 🔧 **Corregir bugs** — Busca issues etiquetados con `bug` y envía un PR.
- ✨ **Implementar features** — Consulta los issues abiertos o propón uno nuevo.
- 📝 **Mejorar documentación** — READMEs, comentarios en código, guías.
- 🧪 **Escribir tests** — Ampliar la cobertura de tests unitarios e integración.

---

## ⚙️ Configuración del entorno de desarrollo

Consulta la sección de [Instalación y Configuración](README.md#-instalación-y-configuración) del README para preparar tu entorno. En resumen:

| Servicio | Requisito |
|----------|-----------|
| Backend | Java 17, Maven 3.8+ |
| Frontend | Node.js 18+, npm |
| Base de Datos | PostgreSQL 12+ |
| Transcripción | Python 3.10+, pip |
| IA | Ollama con `llama3:8b` |

### Pasos rápidos

```bash
# 1. Fork y clonar
git clone git@github.com:<tu-usuario>/Brain---RepTrack.git
cd Brain---RepTrack

# 2. Añadir upstream
git remote add upstream git@github.com:mariomorg/Brain---RepTrack.git

# 3. Instalar dependencias
cd backend && mvn clean install && cd ..
cd frontend && npm install && cd ..
cd transcription-service && pip install -r requirements.txt && cd ..

# 4. Crear base de datos
psql -U postgres -c "CREATE DATABASE brainreptrackdb;"

# 5. Arrancar servicios (ver README)
```

---

## 🌿 Flujo de trabajo con Git

El proyecto utiliza una estrategia **Git Flow simplificada** con dos ramas principales:

```
main ─────────────────────────────────────────────── (producción estable)
  │
  └── develop ──────────────────────────────────── (integración continua)
        │
        ├── feature/inbox ──── PR → develop
        ├── feature/pwa ────── PR → develop
        ├── feature/audio ──── PR → develop
        └── ...
```

| Rama | Propósito |
|------|-----------|
| `main` | Versión estable de producción. Solo se actualiza desde `develop` mediante merge. |
| `develop` | Rama de integración. Todas las features se fusionan aquí. |
| `feature/*` | Ramas de funcionalidades individuales. |

### Flujo paso a paso

```bash
# 1. Sincronizar develop
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/mi-nueva-funcionalidad

# 3. Desarrollar (commits frecuentes)
git add .
git commit -m "[REP-XX] feat: descripción breve"

# 4. Mantener sincronizado con develop
git fetch origin
git rebase origin/develop

# 5. Push y crear PR
git push origin feature/mi-nueva-funcionalidad
# → Crear Pull Request en GitHub: feature/... → develop
```

---

## 🏷 Convenciones de ramas

Las ramas siguen el patrón:

```
<tipo>/<nombre-descriptivo>
```

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feature/` | Nueva funcionalidad | `feature/inbox`, `feature/pwa` |
| `fix/` | Corrección de bug | `fix/map-zoom-reset` |
| `refactor/` | Refactorización sin cambio funcional | `refactor/inbox-service` |
| `docs/` | Cambios en documentación | `docs/api-endpoints` |
| `hotfix/` | Corrección urgente en producción | `hotfix/jwt-expiry` |

**Ejemplos reales del proyecto:**
- `feature/interactive-map`
- `feature/browser-plugin`
- `feature/resource-identification`
- `feature/config-and-users`
- `feature/cerebro-details`
- `feature/directory-view`

---

## 💬 Convenciones de commits

Los mensajes de commit siguen el formato:

```
[REP-XX] <tipo>: <descripción breve>
```

### Tipos de commit

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `[REP-31] feat: added pwa` |
| `fix` | Corrección de bug | `[REP-5] fix: home page css` |
| `refactor` | Refactorización de código | `[REP-12] refactor: inbox service cleanup` |
| `docs` | Documentación | `[REP-1] docs: updated README` |
| `style` | Formato, sin cambio de lógica | `[REP-8] style: fixed indentation` |
| `test` | Tests | `[REP-15] test: added inbox unit tests` |
| `chore` | Mantenimiento, dependencias | `[REP-2] chore: updated dependencies` |

### Reglas

- `[REP-XX]` — Referencia al issue/tarea del proyecto (cuando aplique).
- Usar **inglés** en el mensaje de commit.
- Descripción en **imperativo** y breve (máx. ~72 caracteres).
- Si el commit necesita contexto extra, añadir un cuerpo después de una línea en blanco.

```bash
# Ejemplo con cuerpo
git commit -m "[REP-27] feat: browser extension added

- Context menus for selection, page, link, image
- Popup with Ctrl+Shift+I shortcut
- Badge feedback on capture status"
```

---

## 🔀 Pull Requests

### Antes de crear un PR

- [ ] El código compila sin errores (`mvn clean install` / `npm run build`)
- [ ] Lint pasa sin warnings (`npm run lint`)
- [ ] Los tests existentes pasan (`mvn test`)
- [ ] Has probado manualmente la funcionalidad
- [ ] Tu rama está actualizada con `develop` (`git rebase origin/develop`)

### Formato del PR

**Título:**
```
[REP-XX] <tipo>: Descripción breve de la funcionalidad
```

**Descripción (template):**
```markdown
## Descripción
Breve explicación de los cambios realizados.

## Tipo de cambio
- [ ] Nueva funcionalidad (feature)
- [ ] Corrección de bug (fix)
- [ ] Refactorización (refactor)
- [ ] Documentación (docs)
- [ ] Otro: ___

## ¿Cómo se ha probado?
Describe los pasos para probar los cambios.

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He revisado mi propio código
- [ ] He comentado el código donde es necesario
- [ ] He actualizado la documentación si aplica
- [ ] Mis cambios no generan nuevos warnings
- [ ] Los tests pasan correctamente

## Capturas de pantalla (si aplica)
```

### Proceso de revisión

1. El PR se dirige siempre a `develop` (nunca directamente a `main`).
2. Al menos **1 revisión aprobada** antes de merge.
3. Resolver todos los comentarios de revisión antes del merge.
4. Usar **Squash and Merge** o **Merge Commit** según la complejidad.

---

## 🎨 Estilo de código

### Frontend (TypeScript / React)

- **Linter**: ESLint con reglas de React Hooks y React Refresh.
- **Formato**: Indentación con tabs/spaces consistente (seguir configuración existente).
- **Componentes**: Functional components con hooks.
- **Nombrado**:
  - Componentes: `PascalCase` → `InboxPage.tsx`
  - Hooks: `camelCase` con prefijo `use` → `useInboxItems.ts`
  - Servicios: `camelCase` → `inboxService.ts`
  - Tipos: `PascalCase` → `InboxItem.ts`
- **Imports**: Usar alias configurados (`@features/`, `@shared/`).

```typescript
// ✅ Correcto
import { useInboxItems } from '@features/inbox/hooks/useInboxItems';
import { Button } from '@shared/components/Button';

// ❌ Evitar
import { useInboxItems } from '../../../features/inbox/hooks/useInboxItems';
```

### Backend (Java / Spring Boot)

- **Java 17** — Usar features modernas (records, pattern matching, text blocks donde aplique).
- **Lombok** — Usar `@Data`, `@Builder`, `@AllArgsConstructor` para reducir boilerplate.
- **Nombrado**:
  - Clases: `PascalCase` → `InboxItemController`
  - Métodos: `camelCase` → `findByStatus()`
  - Paquetes: `lowercase` → `com.brainreptrack.service`
- **Capas**: Respetar la arquitectura de capas (Controller → Service → Repository).
- **DTOs**: No exponer entidades JPA directamente en controllers cuando sea posible.

### Python (Servicio de Transcripción)

- **PEP 8** — Seguir las convenciones estándar de Python.
- **Type hints** — Usar anotaciones de tipo.
- **Docstrings** — Documentar funciones públicas.

---

## 📂 Estructura de módulos (Frontend)

Cada feature sigue una estructura modular consistente:

```
features/
└── <nombre-feature>/
    ├── components/       # Componentes React de la feature
    │   └── FeaturePage.tsx
    ├── hooks/            # Custom hooks
    │   └── useFeatureData.ts
    ├── services/         # Llamadas API (Axios)
    │   └── featureService.ts
    └── types/            # Interfaces TypeScript
        └── featureTypes.ts
```

Al crear una nueva feature:
1. Crear la carpeta bajo `frontend/src/features/`.
2. Seguir la estructura `components/`, `hooks/`, `services/`, `types/`.
3. Registrar la nueva ruta en `frontend/src/routes/`.
4. Añadir la página correspondiente en `frontend/src/pages/` si es necesario.

---

## 🏛 Estructura de capas (Backend)

```
com.brainreptrack/
├── config/          # Configuración (CORS, JWT, Security, Async)
├── controller/      # Controladores REST (@RestController)
├── model/           # Entidades JPA (@Entity) y enums
├── repository/      # Interfaces Spring Data JPA (@Repository)
└── service/         # Lógica de negocio (@Service)
    └── impl/        # Implementaciones de interfaces
```

Al añadir una nueva entidad o endpoint:
1. Crear la entidad en `model/`.
2. Crear el repository en `repository/`.
3. Crear la interfaz del servicio en `service/` y su implementación en `service/impl/`.
4. Crear el controller en `controller/`.
5. Actualizar `schema.sql` si hay cambios en BD.

---

## 🧪 Tests

### Backend (JUnit + Spring Boot Test)

```bash
cd backend
mvn test
```

- Los tests se ubican en `backend/src/test/java/com/brainreptrack/`.
- Usar `@SpringBootTest` para tests de integración.
- Usar `@WebMvcTest` para tests de controllers.
- Nombrar los tests: `<Clase>Test.java` o `<Clase>Tests.java`.

### Frontend (ESLint)

```bash
cd frontend
npm run lint
```

### Antes de hacer push

```bash
# Backend
cd backend && mvn clean test

# Frontend
cd frontend && npm run lint && npm run build
```

---

## 🐛 Reporte de bugs

Abre un **issue** en GitHub con la siguiente información:

```markdown
## Descripción del bug
Descripción clara y concisa del problema.

## Pasos para reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Escribir '...'
4. Ver el error

## Comportamiento esperado
¿Qué debería pasar?

## Comportamiento actual
¿Qué pasa realmente?

## Capturas de pantalla
Si aplica, añade capturas.

## Entorno
- SO: [Windows/macOS/Linux]
- Navegador: [Chrome/Firefox/Edge]
- Versión de Node: [v18.x]
- Versión de Java: [17]
```

---

## 💡 Solicitud de funcionalidades

Abre un **issue** con la etiqueta `enhancement`:

```markdown
## Descripción de la funcionalidad
¿Qué quieres que haga la aplicación?

## Motivación
¿Por qué sería útil esta funcionalidad?

## Propuesta de implementación (opcional)
Si tienes una idea de cómo implementarlo, descríbela aquí.

## Alternativas consideradas
¿Has pensado en otras soluciones?
```

---

## 📌 Resumen rápido

| Aspecto | Convención |
|---------|-----------|
| Rama base | `develop` |
| Rama de producción | `main` |
| Nombre de rama | `feature/nombre-descriptivo` |
| Mensaje de commit | `[REP-XX] tipo: descripción` |
| PR destino | Siempre a `develop` |
| Idioma del código | Inglés (variables, funciones, commits) |
| Idioma de docs/UI | Español |

---

<p align="center">
  ¡Toda contribución, por pequeña que sea, es bienvenida! 🚀
</p>
