-- =========================================================
--  Datos de prueba adicionales para Brain-RepTrack
-- =========================================================

-- Limpiar datos previos (opcional, comentar si no quieres borrar)
-- DELETE FROM relations;
-- DELETE FROM note_tags;
-- DELETE FROM notes;
-- DELETE FROM inbox_items;

-- =========================================================
--  Inbox Items (más variedad)
-- =========================================================
INSERT INTO inbox_items (id, raw_text, detected_type, status, created_at)
VALUES
    -- IA y Machine Learning
    ('00000000-0000-0000-0000-000000000010', 'Tutorial completo de TensorFlow', 'LINK', 'PROCESSED', now() - interval '10 days'),
    ('00000000-0000-0000-0000-000000000011', '¿Cómo funcionan los transformers en NLP?', 'QUESTION', 'PROCESSED', now() - interval '8 days'),
    ('00000000-0000-0000-0000-000000000012', 'Conferencia sobre GPT-4 y modelos de lenguaje', 'AUDIO', 'PROCESSED', now() - interval '5 days'),
    
    -- Desarrollo Web
    ('00000000-0000-0000-0000-000000000020', 'Mejores prácticas en React 18', 'TEXT', 'PROCESSED', now() - interval '15 days'),
    ('00000000-0000-0000-0000-000000000021', 'Tutorial de Spring Boot con PostgreSQL', 'LINK', 'PROCESSED', now() - interval '12 days'),
    ('00000000-0000-0000-0000-000000000022', '¿Qué es REST vs GraphQL?', 'QUESTION', 'PROCESSED', now() - interval '9 days'),
    
    -- Bases de datos
    ('00000000-0000-0000-0000-000000000030', 'Optimización de queries en PostgreSQL', 'TEXT', 'PROCESSED', now() - interval '7 days'),
    ('00000000-0000-0000-0000-000000000031', 'Índices y performance en bases de datos', 'LINK', 'PROCESSED', now() - interval '6 days'),
    
    -- Arquitectura de Software
    ('00000000-0000-0000-0000-000000000040', 'Microservicios vs Monolitos', 'TEXT', 'PROCESSED', now() - interval '20 days'),
    ('00000000-0000-0000-0000-000000000041', 'Patrones de diseño: Factory, Singleton, Observer', 'TEXT', 'PROCESSED', now() - interval '18 days'),
    ('00000000-0000-0000-0000-000000000042', 'Event-driven architecture explicada', 'AUDIO', 'PROCESSED', now() - interval '14 days'),
    
    -- DevOps y Cloud
    ('00000000-0000-0000-0000-000000000050', 'Introducción a Docker y contenedores', 'LINK', 'PROCESSED', now() - interval '11 days'),
    ('00000000-0000-0000-0000-000000000051', 'CI/CD con GitHub Actions', 'TEXT', 'PROCESSED', now() - interval '4 days'),
    ('00000000-0000-0000-0000-000000000052', 'Kubernetes para principiantes', 'LINK', 'PROCESSED', now() - interval '3 days'),
    
    -- Seguridad
    ('00000000-0000-0000-0000-000000000060', 'OWASP Top 10 vulnerabilidades', 'TEXT', 'PROCESSED', now() - interval '16 days'),
    ('00000000-0000-0000-0000-000000000061', 'JWT vs Session-based authentication', 'QUESTION', 'PROCESSED', now() - interval '2 days'),
    
    -- Productividad
    ('00000000-0000-0000-0000-000000000070', 'Técnica Pomodoro para programadores', 'TEXT', 'PROCESSED', now() - interval '13 days'),
    ('00000000-0000-0000-0000-000000000071', 'Cómo hacer code review efectivos', 'TEXT', 'PROCESSED', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- =========================================================
--  Notas (contenido técnico variado)
-- =========================================================
INSERT INTO notes (id, title, path, type, summary, created_at, inbox_item_id)
VALUES
    -- IA y Machine Learning
    ('10000000-0000-0000-0000-000000000010', 'Guía Completa de TensorFlow', '/notas/ml/tensorflow', 'LINK', 'Framework de Google para deep learning. Incluye ejemplos de redes neuronales convolucionales y recurrentes.', now() - interval '10 days', '00000000-0000-0000-0000-000000000010'),
    ('10000000-0000-0000-0000-000000000011', 'Arquitectura Transformer', '/notas/ml/transformers', 'TEXT', 'Explicación detallada de la arquitectura transformer: self-attention, multi-head attention, positional encoding. Base de modelos como GPT y BERT.', now() - interval '8 days', '00000000-0000-0000-0000-000000000011'),
    ('10000000-0000-0000-0000-000000000012', 'GPT-4 y Modelos de Lenguaje', '/notas/ml/gpt4', 'AUDIO', 'Conferencia sobre el funcionamiento interno de GPT-4, fine-tuning y aplicaciones prácticas en producción.', now() - interval '5 days', '00000000-0000-0000-0000-000000000012'),
    
    -- Desarrollo Web
    ('10000000-0000-0000-0000-000000000020', 'React 18 Best Practices', '/notas/web/react18', 'TEXT', 'Hooks modernos, Concurrent Rendering, Suspense, Server Components. Patrones recomendados para apps escalables.', now() - interval '15 days', '00000000-0000-0000-0000-000000000020'),
    ('10000000-0000-0000-0000-000000000021', 'Spring Boot + PostgreSQL', '/notas/web/springboot-pg', 'LINK', 'Tutorial paso a paso: configuración de JPA, repositorios, servicios, controladores REST. Manejo de transacciones.', now() - interval '12 days', '00000000-0000-0000-0000-000000000021'),
    ('10000000-0000-0000-0000-000000000022', 'REST vs GraphQL', '/notas/web/rest-graphql', 'TEXT', 'Comparación de arquitecturas API: REST (recursos, HTTP verbs) vs GraphQL (queries, mutations, subscriptions). Pros y contras.', now() - interval '9 days', '00000000-0000-0000-0000-000000000022'),
    
    -- Bases de datos
    ('10000000-0000-0000-0000-000000000030', 'Optimización PostgreSQL', '/notas/db/pg-optimization', 'TEXT', 'EXPLAIN ANALYZE, índices B-tree vs Hash, vacuum, estadísticas. Queries N+1 y cómo evitarlas.', now() - interval '7 days', '00000000-0000-0000-0000-000000000030'),
    ('10000000-0000-0000-0000-000000000031', 'Índices en Bases de Datos', '/notas/db/indexes', 'LINK', 'Tipos de índices: B-tree, Hash, GiST, GIN. Cuándo usar cada uno. Trade-offs de performance vs espacio.', now() - interval '6 days', '00000000-0000-0000-0000-000000000031'),
    
    -- Arquitectura
    ('10000000-0000-0000-0000-000000000040', 'Microservicios vs Monolitos', '/notas/arch/microservices', 'TEXT', 'Comparación de arquitecturas. Microservicios: ventajas (escalabilidad, independencia) y desventajas (complejidad, consistencia). Cuándo usar cada uno.', now() - interval '20 days', '00000000-0000-0000-0000-000000000040'),
    ('10000000-0000-0000-0000-000000000041', 'Patrones de Diseño GoF', '/notas/arch/design-patterns', 'TEXT', 'Gang of Four: Creacionales (Factory, Singleton, Builder), Estructurales (Adapter, Decorator), Comportamiento (Observer, Strategy).', now() - interval '18 days', '00000000-0000-0000-0000-000000000041'),
    ('10000000-0000-0000-0000-000000000042', 'Event-Driven Architecture', '/notas/arch/event-driven', 'AUDIO', 'Arquitectura basada en eventos: Event Sourcing, CQRS, Message Brokers (Kafka, RabbitMQ). Ventajas para sistemas distribuidos.', now() - interval '14 days', '00000000-0000-0000-0000-000000000042'),
    
    -- DevOps
    ('10000000-0000-0000-0000-000000000050', 'Docker para Desarrolladores', '/notas/devops/docker', 'LINK', 'Contenedores, imágenes, Dockerfile, docker-compose. Mejores prácticas para multi-stage builds y optimización de capas.', now() - interval '11 days', '00000000-0000-0000-0000-000000000050'),
    ('10000000-0000-0000-0000-000000000051', 'CI/CD con GitHub Actions', '/notas/devops/github-actions', 'TEXT', 'Pipelines de integración continua: build, test, deploy. Workflows, secrets, artifacts. Deploy automático a producción.', now() - interval '4 days', '00000000-0000-0000-0000-000000000051'),
    ('10000000-0000-0000-0000-000000000052', 'Kubernetes Básico', '/notas/devops/k8s', 'LINK', 'Pods, Services, Deployments, ConfigMaps, Secrets. Orquestación de contenedores a escala. kubectl esencial.', now() - interval '3 days', '00000000-0000-0000-0000-000000000052'),
    
    -- Seguridad
    ('10000000-0000-0000-0000-000000000060', 'OWASP Top 10', '/notas/security/owasp', 'TEXT', 'Las 10 vulnerabilidades más críticas: SQL Injection, XSS, CSRF, Auth Broken, Sensitive Data Exposure. Cómo prevenirlas.', now() - interval '16 days', '00000000-0000-0000-0000-000000000060'),
    ('10000000-0000-0000-0000-000000000061', 'JWT vs Sessions', '/notas/security/auth', 'TEXT', 'Autenticación stateless (JWT) vs stateful (sessions). Tokens de acceso, refresh tokens, seguridad y trade-offs.', now() - interval '2 days', '00000000-0000-0000-0000-000000000061'),
    
    -- Productividad
    ('10000000-0000-0000-0000-000000000070', 'Pomodoro para Devs', '/notas/productivity/pomodoro', 'TEXT', 'Técnica de gestión del tiempo: 25min trabajo + 5min descanso. Ideal para mantener foco y prevenir burnout.', now() - interval '13 days', '00000000-0000-0000-0000-000000000070'),
    ('10000000-0000-0000-0000-000000000071', 'Code Review Efectivo', '/notas/productivity/code-review', 'TEXT', 'Mejores prácticas: qué buscar, cómo dar feedback constructivo, automatización con linters. Cultura de equipo.', now() - interval '1 day', '00000000-0000-0000-0000-000000000071'),
    
    -- Notas adicionales sin inbox_item
    ('10000000-0000-0000-0000-000000000080', 'Git Flow y Estrategias de Branching', '/notas/git/gitflow', 'TEXT', 'Estrategias de branching: Git Flow, GitHub Flow, Trunk-Based Development. Feature branches, hotfixes, releases.', now() - interval '17 days', null),
    ('10000000-0000-0000-0000-000000000081', 'Testing Pyramid', '/notas/testing/pyramid', 'TEXT', 'Pirámide de testing: unit tests (base), integration tests (medio), e2e tests (cima). Cobertura vs velocidad.', now() - interval '19 days', null),
    ('10000000-0000-0000-0000-000000000082', 'Clean Code Principles', '/notas/programming/clean-code', 'TEXT', 'Principios de código limpio: nombres significativos, funciones pequeñas, comentarios útiles, DRY, SOLID.', now() - interval '22 days', null),
    ('10000000-0000-0000-0000-000000000083', 'TypeScript vs JavaScript', '/notas/web/typescript', 'TEXT', 'Ventajas de TypeScript: type safety, autocompletado, refactoring seguro. Configuración y buenas prácticas.', now() - interval '25 days', null),
    ('10000000-0000-0000-0000-000000000084', 'Redis como Cache', '/notas/db/redis', 'TEXT', 'Uso de Redis para caching: strings, hashes, lists, sets. TTL, eviction policies. Patrones comunes: cache-aside, write-through.', now() - interval '21 days', null)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
--  Tags (taxonomía rica)
-- =========================================================
INSERT INTO note_tags (note_id, tag_name) VALUES
    -- TensorFlow
    ('10000000-0000-0000-0000-000000000010', 'machine-learning'),
    ('10000000-0000-0000-0000-000000000010', 'deep-learning'),
    ('10000000-0000-0000-0000-000000000010', 'tensorflow'),
    ('10000000-0000-0000-0000-000000000010', 'python'),
    
    -- Transformers
    ('10000000-0000-0000-0000-000000000011', 'machine-learning'),
    ('10000000-0000-0000-0000-000000000011', 'nlp'),
    ('10000000-0000-0000-0000-000000000011', 'transformers'),
    ('10000000-0000-0000-0000-000000000011', 'arquitectura'),
    
    -- GPT-4
    ('10000000-0000-0000-0000-000000000012', 'machine-learning'),
    ('10000000-0000-0000-0000-000000000012', 'nlp'),
    ('10000000-0000-0000-0000-000000000012', 'gpt'),
    ('10000000-0000-0000-0000-000000000012', 'openai'),
    
    -- React 18
    ('10000000-0000-0000-0000-000000000020', 'frontend'),
    ('10000000-0000-0000-0000-000000000020', 'react'),
    ('10000000-0000-0000-0000-000000000020', 'javascript'),
    ('10000000-0000-0000-0000-000000000020', 'web-development'),
    
    -- Spring Boot
    ('10000000-0000-0000-0000-000000000021', 'backend'),
    ('10000000-0000-0000-0000-000000000021', 'java'),
    ('10000000-0000-0000-0000-000000000021', 'spring-boot'),
    ('10000000-0000-0000-0000-000000000021', 'postgresql'),
    ('10000000-0000-0000-0000-000000000021', 'database'),
    
    -- REST vs GraphQL
    ('10000000-0000-0000-0000-000000000022', 'backend'),
    ('10000000-0000-0000-0000-000000000022', 'api'),
    ('10000000-0000-0000-0000-000000000022', 'rest'),
    ('10000000-0000-0000-0000-000000000022', 'graphql'),
    
    -- PostgreSQL Optimization
    ('10000000-0000-0000-0000-000000000030', 'database'),
    ('10000000-0000-0000-0000-000000000030', 'postgresql'),
    ('10000000-0000-0000-0000-000000000030', 'performance'),
    ('10000000-0000-0000-0000-000000000030', 'optimization'),
    
    -- Indexes
    ('10000000-0000-0000-0000-000000000031', 'database'),
    ('10000000-0000-0000-0000-000000000031', 'postgresql'),
    ('10000000-0000-0000-0000-000000000031', 'indexes'),
    ('10000000-0000-0000-0000-000000000031', 'performance'),
    
    -- Microservices
    ('10000000-0000-0000-0000-000000000040', 'arquitectura'),
    ('10000000-0000-0000-0000-000000000040', 'microservices'),
    ('10000000-0000-0000-0000-000000000040', 'distributed-systems'),
    ('10000000-0000-0000-0000-000000000040', 'backend'),
    
    -- Design Patterns
    ('10000000-0000-0000-0000-000000000041', 'arquitectura'),
    ('10000000-0000-0000-0000-000000000041', 'design-patterns'),
    ('10000000-0000-0000-0000-000000000041', 'oop'),
    ('10000000-0000-0000-0000-000000000041', 'best-practices'),
    
    -- Event-Driven
    ('10000000-0000-0000-0000-000000000042', 'arquitectura'),
    ('10000000-0000-0000-0000-000000000042', 'event-driven'),
    ('10000000-0000-0000-0000-000000000042', 'distributed-systems'),
    ('10000000-0000-0000-0000-000000000042', 'kafka'),
    
    -- Docker
    ('10000000-0000-0000-0000-000000000050', 'devops'),
    ('10000000-0000-0000-0000-000000000050', 'docker'),
    ('10000000-0000-0000-0000-000000000050', 'containers'),
    ('10000000-0000-0000-0000-000000000050', 'deployment'),
    
    -- GitHub Actions
    ('10000000-0000-0000-0000-000000000051', 'devops'),
    ('10000000-0000-0000-0000-000000000051', 'ci-cd'),
    ('10000000-0000-0000-0000-000000000051', 'github'),
    ('10000000-0000-0000-0000-000000000051', 'automation'),
    
    -- Kubernetes
    ('10000000-0000-0000-0000-000000000052', 'devops'),
    ('10000000-0000-0000-0000-000000000052', 'kubernetes'),
    ('10000000-0000-0000-0000-000000000052', 'containers'),
    ('10000000-0000-0000-0000-000000000052', 'orchestration'),
    
    -- OWASP
    ('10000000-0000-0000-0000-000000000060', 'security'),
    ('10000000-0000-0000-0000-000000000060', 'owasp'),
    ('10000000-0000-0000-0000-000000000060', 'vulnerabilities'),
    ('10000000-0000-0000-0000-000000000060', 'best-practices'),
    
    -- JWT vs Sessions
    ('10000000-0000-0000-0000-000000000061', 'security'),
    ('10000000-0000-0000-0000-000000000061', 'authentication'),
    ('10000000-0000-0000-0000-000000000061', 'jwt'),
    ('10000000-0000-0000-0000-000000000061', 'backend'),
    
    -- Pomodoro
    ('10000000-0000-0000-0000-000000000070', 'productivity'),
    ('10000000-0000-0000-0000-000000000070', 'time-management'),
    ('10000000-0000-0000-0000-000000000070', 'focus'),
    
    -- Code Review
    ('10000000-0000-0000-0000-000000000071', 'productivity'),
    ('10000000-0000-0000-0000-000000000071', 'code-review'),
    ('10000000-0000-0000-0000-000000000071', 'team'),
    ('10000000-0000-0000-0000-000000000071', 'best-practices'),
    
    -- Git Flow
    ('10000000-0000-0000-0000-000000000080', 'git'),
    ('10000000-0000-0000-0000-000000000080', 'version-control'),
    ('10000000-0000-0000-0000-000000000080', 'workflow'),
    ('10000000-0000-0000-0000-000000000080', 'team'),
    
    -- Testing Pyramid
    ('10000000-0000-0000-0000-000000000081', 'testing'),
    ('10000000-0000-0000-0000-000000000081', 'quality'),
    ('10000000-0000-0000-0000-000000000081', 'best-practices'),
    ('10000000-0000-0000-0000-000000000081', 'automation'),
    
    -- Clean Code
    ('10000000-0000-0000-0000-000000000082', 'best-practices'),
    ('10000000-0000-0000-0000-000000000082', 'clean-code'),
    ('10000000-0000-0000-0000-000000000082', 'quality'),
    ('10000000-0000-0000-0000-000000000082', 'programming'),
    
    -- TypeScript
    ('10000000-0000-0000-0000-000000000083', 'frontend'),
    ('10000000-0000-0000-0000-000000000083', 'typescript'),
    ('10000000-0000-0000-0000-000000000083', 'javascript'),
    ('10000000-0000-0000-0000-000000000083', 'web-development'),
    
    -- Redis
    ('10000000-0000-0000-0000-000000000084', 'database'),
    ('10000000-0000-0000-0000-000000000084', 'redis'),
    ('10000000-0000-0000-0000-000000000084', 'cache'),
    ('10000000-0000-0000-0000-000000000084', 'performance')
ON CONFLICT (note_id, tag_name) DO NOTHING;

-- =========================================================
--  Relations (conexiones entre notas)
-- =========================================================
INSERT INTO relations (id, note_a, note_b, score, validated)
VALUES
    -- ML relacionados
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000011', 0.85, true),
    ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012', 0.90, true),
    
    -- Web dev relacionados
    ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000083', 0.75, true),
    ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000030', 0.70, false),
    ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000061', 0.65, true),
    
    -- Database relacionados
    ('20000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000031', 0.95, true),
    ('20000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000084', 0.80, true),
    
    -- Architecture relacionados
    ('20000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000042', 0.78, false),
    ('20000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000082', 0.72, true),
    
    -- DevOps relacionados
    ('20000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000052', 0.88, true),
    ('20000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000081', 0.68, false),
    
    -- Security relacionados
    ('20000000-0000-0000-0000-000000000060', '10000000-0000-0000-0000-000000000060', '10000000-0000-0000-0000-000000000061', 0.82, true),
    
    -- Productivity relacionados
    ('20000000-0000-0000-0000-000000000070', '10000000-0000-0000-0000-000000000070', '10000000-0000-0000-0000-000000000071', 0.60, false),
    ('20000000-0000-0000-0000-000000000071', '10000000-0000-0000-0000-000000000071', '10000000-0000-0000-0000-000000000080', 0.55, false)
ON CONFLICT (id) DO NOTHING;
