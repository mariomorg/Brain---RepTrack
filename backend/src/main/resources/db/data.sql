-- =========================================================
--  Datos Brain-RepTrack — Taxonomía jerárquica ampliada
--
--  L0 (raíces):  dev · ia · infra · soft · cocina · deporte · viajes · salud
--
--  L1/L2 por dominio:
--    dev        → frontend(react,ts,css) · backend(java,python,api) · database(pg,nosql,redis)
--    ia         → ml(deep-learning,tensorflow,sklearn) · nlp(transformers,gpt) · data(pandas,viz,feature)
--    infra      → devops(docker,k8s,ci-cd) · cloud(aws,terraform) · security(owasp,auth)
--    soft       → arquitectura(patrones,microservicios,hexagonal) · testing(tdd,e2e) · productividad(pomodoro,adr)
--    cocina     → tecnicas(cuchillo,coccion,emplatado) · reposteria(masas,decoracion) · mundial(asiatica,italiana,mexicana)
--    deporte    → entrenamiento(fuerza,cardio,movilidad) · nutricion(proteinas,suplementos) · mindset(motivacion,recovery)
--    viajes     → planificacion(presupuesto,rutas,alojamiento) · mochilero(equipaje,hostels) · fotos(composicion,edicion)
--    salud      → mental(meditacion,ansiedad,habitos) · fisica(sueno,ejercicio) · nutricion(dieta,ayuno)
-- =========================================================

-- =========================================================
--  Limpieza previa (evita duplicados en re-arranques)
-- =========================================================
DELETE FROM relations;
DELETE FROM note_tags;
DELETE FROM notes;
DELETE FROM inbox_items;

-- =========================================================
--  Inbox Items
-- =========================================================
INSERT INTO inbox_items (id, raw_text, detected_type, status, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tutorial React 18 con hooks modernos',          'LINK',     'PROCESSED', now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000002', 'TypeScript avanzado: generics y utility types', 'TEXT',     'PROCESSED', now() - interval '28 days'),
  ('00000000-0000-0000-0000-000000000003', 'Tailwind CSS componentes',                      'LINK',     'PROCESSED', now() - interval '25 days'),
  ('00000000-0000-0000-0000-000000000004', 'Spring Boot con JPA y REST',                    'LINK',     'PROCESSED', now() - interval '27 days'),
  ('00000000-0000-0000-0000-000000000005', 'FastAPI en producción',                         'TEXT',     'PROCESSED', now() - interval '22 days'),
  ('00000000-0000-0000-0000-000000000006', 'gRPC vs REST comparativa',                      'QUESTION', 'PROCESSED', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000007', 'PostgreSQL: índices y EXPLAIN ANALYZE',         'TEXT',     'PROCESSED', now() - interval '26 days'),
  ('00000000-0000-0000-0000-000000000008', 'MongoDB aggregation pipeline',                  'LINK',     'PROCESSED', now() - interval '21 days'),
  ('00000000-0000-0000-0000-000000000009', 'Redis para caché y pub/sub',                    'TEXT',     'PROCESSED', now() - interval '18 days'),
  ('00000000-0000-0000-0000-000000000010', 'Redes neuronales convolucionales',               'LINK',     'PROCESSED', now() - interval '35 days'),
  ('00000000-0000-0000-0000-000000000011', 'Transformer architecture explicada',             'TEXT',     'PROCESSED', now() - interval '33 days'),
  ('00000000-0000-0000-0000-000000000012', 'Pandas y visualización de datos',               'LINK',     'PROCESSED', now() - interval '29 days'),
  ('00000000-0000-0000-0000-000000000013', 'Docker multi-stage builds',                     'TEXT',     'PROCESSED', now() - interval '24 days'),
  ('00000000-0000-0000-0000-000000000014', 'Kubernetes pods y deployments',                 'LINK',     'PROCESSED', now() - interval '19 days'),
  ('00000000-0000-0000-0000-000000000015', 'OWASP Top 10 vulnerabilidades',                 'TEXT',     'PROCESSED', now() - interval '32 days'),
  ('00000000-0000-0000-0000-000000000016', 'Patrones de diseño GoF',                        'TEXT',     'PROCESSED', now() - interval '40 days'),
  ('00000000-0000-0000-0000-000000000017', 'TDD con JUnit 5 y Mockito',                     'LINK',     'PROCESSED', now() - interval '23 days'),
  ('00000000-0000-0000-0000-000000000018', 'Técnica Pomodoro para devs',                    'TEXT',     'PROCESSED', now() - interval '15 days'),
  ('00000000-0000-0000-0000-000000000019', 'Técnica del cuchillo japonés',                  'LINK',     'PROCESSED', now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000020', 'Masa madre para principiantes',                 'TEXT',     'PROCESSED', now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000021', 'Entrenamiento de fuerza 5x5',                   'LINK',     'PROCESSED', now() - interval '12 days'),
  ('00000000-0000-0000-0000-000000000022', 'Viaje a Japón: guía completa',                  'LINK',     'PROCESSED', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000023', 'Meditación mindfulness diaria',                 'TEXT',     'PROCESSED', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- =========================================================
--  Notas
-- =========================================================
INSERT INTO notes (id, title, path, type, summary, created_at, inbox_item_id) VALUES

  -- ── dev/frontend ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000001', 'React 18: Concurrent Rendering',         '/dev/frontend/react',      'LINK', 'Suspense, useTransition, startTransition. Server Components.',          now() - interval '30 days', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'TypeScript: Generics y Utility Types',   '/dev/frontend/typescript', 'TEXT', 'Conditional types, infer, mapped types. Partial, Pick, Omit.',          now() - interval '28 days', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003', 'Next.js 14: App Router',                 '/dev/frontend/react',      'TEXT', 'Server Components, Streaming SSR, Server Actions.',                      now() - interval '25 days', null),
  ('10000000-0000-0000-0000-000000000004', 'Tailwind CSS: sistema de diseño',        '/dev/frontend/css',        'LINK', 'JIT compiler, configuración de tema, responsive, dark mode.',           now() - interval '25 days', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000005', 'Zustand: estado global ligero',          '/dev/frontend/react',      'TEXT', 'Stores, slices, persistencia con middleware.',                           now() - interval '22 days', null),
  ('10000000-0000-0000-0000-000000000006', 'CSS Grid y Flexbox avanzado',            '/dev/frontend/css',        'TEXT', 'Grid areas, auto-placement, subgrid. Animaciones CSS.',                 now() - interval '20 days', null),

  -- ── dev/backend ───────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000011', 'Spring Boot: JPA y REST',               '/dev/backend/java',        'LINK', 'Repositorios, servicios, controladores REST. Transacciones.',           now() - interval '27 days', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000012', 'Spring Security con OAuth2',             '/dev/backend/java',        'TEXT', 'Authorization server, JWT, roles. Integración con Keycloak.',           now() - interval '24 days', null),
  ('10000000-0000-0000-0000-000000000013', 'FastAPI: APIs modernas en Python',       '/dev/backend/python',      'TEXT', 'Pydantic, async/await, dependency injection. OpenAPI automático.',      now() - interval '22 days', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000014', 'Python async/await y asyncio',           '/dev/backend/python',      'TEXT', 'Event loop, coroutines, tasks. Comparación con threads.',               now() - interval '19 days', null),
  ('10000000-0000-0000-0000-000000000015', 'REST vs gRPC vs GraphQL',                '/dev/backend/api',         'QUESTION', 'REST (HTTP/JSON), gRPC (Protobuf), GraphQL (query language).',       now() - interval '20 days', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000016', 'Apache Kafka: mensajería distribuida',   '/dev/backend/api',         'LINK', 'Topics, particiones, producers, consumers. Event-driven.',              now() - interval '17 days', null),

  -- ── dev/database ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000021', 'PostgreSQL: optimización de queries',    '/dev/database/postgresql', 'TEXT', 'EXPLAIN ANALYZE, índices B-tree/GIN. Vacuum, estadísticas.',           now() - interval '26 days', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000022', 'PostgreSQL: transacciones y ACID',       '/dev/database/postgresql', 'TEXT', 'Niveles de aislamiento, deadlocks, MVCC. WAL.',                         now() - interval '23 days', null),
  ('10000000-0000-0000-0000-000000000023', 'MongoDB: documentos y aggregations',     '/dev/database/nosql',      'LINK', 'Aggregation pipeline, $lookup. Diseño de esquemas flexibles.',          now() - interval '21 days', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000024', 'Elasticsearch: búsqueda full-text',      '/dev/database/nosql',      'LINK', 'Índices invertidos, mapping, queries DSL. Aggregations.',               now() - interval '18 days', null),
  ('10000000-0000-0000-0000-000000000025', 'Redis: caché y pub/sub',                 '/dev/database/redis',      'TEXT', 'Strings, hashes, TTL, eviction policies. Pub/Sub y Streams.',          now() - interval '18 days', '00000000-0000-0000-0000-000000000009'),

  -- ── ia/ml ─────────────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000031', 'CNNs: visión por computador',            '/ia/ml/deep-learning',     'LINK', 'Convoluciones, pooling. Arquitecturas: ResNet, EfficientNet.',          now() - interval '35 days', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000032', 'Reinforcement Learning: Q-Learning',     '/ia/ml/deep-learning',     'TEXT', 'Q-Learning, DQN. OpenAI Gym. Aplicaciones en juegos.',                  now() - interval '31 days', null),
  ('10000000-0000-0000-0000-000000000033', 'TensorFlow: redes neuronales',           '/ia/ml/tensorflow',        'TEXT', 'Keras API, compilación, entrenamiento. TensorBoard.',                   now() - interval '29 days', null),
  ('10000000-0000-0000-0000-000000000034', 'MLOps: modelos en producción',           '/ia/ml/tensorflow',        'LINK', 'MLflow, DVC. Pipeline de entrenamiento y despliegue.',                  now() - interval '26 days', null),
  ('10000000-0000-0000-0000-000000000035', 'Scikit-learn: ML clásico',               '/ia/ml/sklearn',           'TEXT', 'Pipelines, cross-validation. Árboles, SVM, clustering.',                now() - interval '24 days', null),

  -- ── ia/nlp ────────────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000041', 'Arquitectura Transformer',               '/ia/nlp/transformers',     'TEXT', 'Self-attention, multi-head. Base de BERT, GPT, T5.',                    now() - interval '33 days', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000042', 'BERT y fine-tuning',                     '/ia/nlp/transformers',     'TEXT', 'Pre-training, fine-tuning para NER. HuggingFace Transformers.',         now() - interval '30 days', null),
  ('10000000-0000-0000-0000-000000000043', 'GPT-4 y LLMs en producción',             '/ia/nlp/gpt',              'AUDIO','Prompt engineering, RAG, function calling.',                            now() - interval '27 days', null),
  ('10000000-0000-0000-0000-000000000044', 'LangChain y agentes',                    '/ia/nlp/gpt',              'TEXT', 'Chains, agents, tools, memory. Integración con vectorstores.',          now() - interval '24 days', null),

  -- ── ia/data ───────────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000051', 'Pandas: análisis de datos',              '/ia/data/pandas',          'LINK', 'DataFrames, groupby, merge. Manejo de NaN.',                            now() - interval '29 days', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000052', 'Matplotlib y Seaborn',                   '/ia/data/visualizacion',   'TEXT', 'Gráficos estadísticos, heatmaps. Plotly para interactividad.',          now() - interval '26 days', null),
  ('10000000-0000-0000-0000-000000000053', 'Feature Engineering',                    '/ia/data/feature-eng',     'TEXT', 'Normalización, encoding. PCA, t-SNE, UMAP.',                           now() - interval '23 days', null),

  -- ── infra/devops ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000061', 'Docker: contenedores y compose',         '/infra/devops/docker',     'TEXT', 'Multi-stage builds, docker-compose. Best practices.',                   now() - interval '24 days', '00000000-0000-0000-0000-000000000013'),
  ('10000000-0000-0000-0000-000000000062', 'Kubernetes: pods y deployments',         '/infra/devops/kubernetes', 'LINK', 'Pods, Services, HPA. kubectl esencial.',                                now() - interval '19 days', '00000000-0000-0000-0000-000000000014'),
  ('10000000-0000-0000-0000-000000000063', 'CI/CD con GitHub Actions',               '/infra/devops/ci-cd',      'TEXT', 'Workflows, jobs. Build, test, deploy. Matrix strategy.',                now() - interval '16 days', null),
  ('10000000-0000-0000-0000-000000000064', 'Prometheus y Grafana',                   '/infra/devops/ci-cd',      'TEXT', 'Métricas y alertas. PromQL, dashboards. SLIs, SLOs.',                  now() - interval '14 days', null),

  -- ── infra/cloud ───────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000071', 'AWS: servicios esenciales',              '/infra/cloud/aws',         'LINK', 'EC2, S3, RDS, Lambda, ECS. IAM roles. VPC.',                           now() - interval '22 days', null),
  ('10000000-0000-0000-0000-000000000072', 'Terraform: infraestructura como código', '/infra/cloud/terraform',   'TEXT', 'Providers, modules, state. Plan/Apply/Destroy.',                        now() - interval '20 days', null),

  -- ── infra/security ────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000081', 'OWASP Top 10',                           '/infra/security/owasp',    'TEXT', 'SQL Injection, XSS, CSRF. Cómo detectar y prevenir.',                  now() - interval '32 days', '00000000-0000-0000-0000-000000000015'),
  ('10000000-0000-0000-0000-000000000082', 'JWT y autenticación segura',             '/infra/security/auth',     'TEXT', 'JWT vs sessions. Access tokens, PKCE, OAuth2.',                         now() - interval '28 days', null),
  ('10000000-0000-0000-0000-000000000083', 'Criptografía para desarrolladores',      '/infra/security/auth',     'TEXT', 'AES, RSA, Hashing: bcrypt, Argon2. TLS/SSL.',                          now() - interval '25 days', null),

  -- ── soft/arquitectura ─────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000091', 'Patrones de diseño GoF',                 '/soft/arquitectura/patrones',      'TEXT', 'Factory, Builder, Adapter, Observer, Strategy.',                now() - interval '40 days', '00000000-0000-0000-0000-000000000016'),
  ('10000000-0000-0000-0000-000000000092', 'Microservicios vs Monolitos',            '/soft/arquitectura/microservicios', 'TEXT', 'Cuándo usar cada uno. API gateway. Sagas.',                    now() - interval '36 days', null),
  ('10000000-0000-0000-0000-000000000093', 'Arquitectura Hexagonal',                 '/soft/arquitectura/hexagonal',     'TEXT', 'Puertos y adaptadores. Inversión de dependencias.',             now() - interval '32 days', null),
  ('10000000-0000-0000-0000-000000000094', 'Event-Driven Architecture',              '/soft/arquitectura/microservicios', 'AUDIO','Event Sourcing, CQRS. Saga pattern.',                          now() - interval '28 days', null),

  -- ── soft/testing ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000101', 'TDD: ciclo Red-Green-Refactor',          '/soft/testing/tdd',        'LINK', 'JUnit 5, Mockito, AssertJ. Diseño guiado por tests.',                   now() - interval '23 days', '00000000-0000-0000-0000-000000000017'),
  ('10000000-0000-0000-0000-000000000102', 'Testing pyramid: unit, integration, e2e','/soft/testing/tdd',        'TEXT', 'Mocks vs stubs. Contract testing. E2E con Playwright.',                now() - interval '20 days', null),
  ('10000000-0000-0000-0000-000000000103', 'Playwright: tests E2E',                  '/soft/testing/e2e',        'TEXT', 'Selectors, page object model. Parallel execution.',                    now() - interval '17 days', null),

  -- ── soft/productividad ────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000111', 'Técnica Pomodoro para programadores',    '/soft/productividad/pomodoro', 'TEXT', '25min trabajo + 5min descanso. Deep work.',                        now() - interval '15 days', '00000000-0000-0000-0000-000000000018'),
  ('10000000-0000-0000-0000-000000000112', 'Architecture Decision Records (ADR)',    '/soft/productividad/adr',      'TEXT', 'Documentar decisiones: contexto, decisión, consecuencias.',         now() - interval '12 days', null),
  ('10000000-0000-0000-0000-000000000113', 'Code Review efectivo',                   '/soft/productividad/pomodoro', 'TEXT', 'Cómo dar feedback constructivo. Linters. Cultura.',                now() - interval '10 days', null),

  -- ── cocina/tecnicas ───────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000201', 'Técnica del cuchillo: cortes básicos',   '/cocina/tecnicas/cuchillo', 'LINK', 'Brunoise, juliana, chiffonade. Mantenimiento del filo.',              now() - interval '10 days', '00000000-0000-0000-0000-000000000019'),
  ('10000000-0000-0000-0000-000000000202', 'Métodos de cocción: seco vs húmedo',     '/cocina/tecnicas/coccion',  'TEXT', 'Asado, salteado, vapor, estofado. Cómo afecta la textura.',           now() - interval '9 days',  null),
  ('10000000-0000-0000-0000-000000000203', 'El arte del emplatado',                  '/cocina/tecnicas/emplatado','TEXT', 'Composición visual, salsa como pintura, alturas. Fine dining.',      now() - interval '7 days',  null),
  ('10000000-0000-0000-0000-000000000204', 'Fermentación: kimchi y kombucha',        '/cocina/tecnicas/coccion',  'TEXT', 'Bacterias lácticas, pH, temperatura. Recetas básicas.',              now() - interval '6 days',  null),

  -- ── cocina/reposteria ─────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000211', 'Masa madre: cultivo y mantenimiento',    '/cocina/reposteria/masas',       'TEXT', 'Hidratación, alimentación diaria, temperatura.',                now() - interval '8 days',  '00000000-0000-0000-0000-000000000020'),
  ('10000000-0000-0000-0000-000000000212', 'Croissants: laminado de mantequilla',    '/cocina/reposteria/masas',       'TEXT', 'Pliegos, temperatura, descansos en frío.',                      now() - interval '5 days',  null),
  ('10000000-0000-0000-0000-000000000213', 'Decoración con fondant',                 '/cocina/reposteria/decoracion',  'TEXT', 'Colorantes, modelado, cobertura lisa. Tartas temáticas.',        now() - interval '4 days',  null),

  -- ── cocina/mundial ────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000221', 'Cocina japonesa: dashi y umami',         '/cocina/mundial/asiatica',  'LINK', 'Kombu, katsuobushi. Miso, ramen, dashi desde cero.',                 now() - interval '11 days', null),
  ('10000000-0000-0000-0000-000000000222', 'Pasta fresca italiana',                  '/cocina/mundial/italiana',  'TEXT', 'Fettuccine, pappardelle. Rellenas: ravioli, tortellini.',            now() - interval '9 days',  null),
  ('10000000-0000-0000-0000-000000000223', 'Tacos y salsas mexicanas',               '/cocina/mundial/mexicana',  'TEXT', 'Tortilla de maíz, carnitas, salsa verde y roja.',                   now() - interval '7 days',  null),

  -- ── deporte/entrenamiento ─────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000301', 'Fuerza: programa 5x5',                   '/deporte/entrenamiento/fuerza',    'LINK', 'Sentadilla, press banca, peso muerto. Progresión lineal.',   now() - interval '12 days', '00000000-0000-0000-0000-000000000021'),
  ('10000000-0000-0000-0000-000000000302', 'Cardio HIIT: intervalos',                '/deporte/entrenamiento/cardio',    'TEXT', '20 seg esfuerzo / 10 seg descanso. Variaciones Tabata.',     now() - interval '10 days', null),
  ('10000000-0000-0000-0000-000000000303', 'Movilidad y flexibilidad',               '/deporte/entrenamiento/movilidad', 'TEXT', 'Caderas, hombros, tobillo. Foam roller. Rutina matutina.',   now() - interval '8 days',  null),
  ('10000000-0000-0000-0000-000000000304', 'Calistenia: dominadas y fondos',         '/deporte/entrenamiento/fuerza',    'TEXT', 'Progresiones. Muscle-up, planche. Equipamiento mínimo.',     now() - interval '6 days',  null),

  -- ── deporte/nutricion ─────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000311', 'Proteínas: cantidad y fuentes',          '/deporte/nutricion/proteinas',   'TEXT', '1.6-2.2g/kg. Suero, caseína, fuentes vegetales.',             now() - interval '11 days', null),
  ('10000000-0000-0000-0000-000000000312', 'Creatina y evidencia científica',        '/deporte/nutricion/suplementos', 'TEXT', 'Carga vs mantenimiento. Monohidrato. Beneficios reales.',     now() - interval '9 days',  null),

  -- ── deporte/mindset ───────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000321', 'Motivación intrínseca en el deporte',    '/deporte/mindset/motivacion', 'TEXT', 'Metas proceso vs resultado. Dopamina. Hábitos.',                  now() - interval '7 days',  null),
  ('10000000-0000-0000-0000-000000000322', 'Recovery: sueño y sobreentrenamiento',   '/deporte/mindset/recovery',   'TEXT', 'HRV, deload weeks. Signos de fatiga central.',                    now() - interval '5 days',  null),

  -- ── viajes/planificacion ──────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000401', 'Cómo presupuestar un viaje largo',       '/viajes/planificacion/presupuesto', 'LINK', 'Fondos de emergencia, vuelos baratos, Skyscanner.',        now() - interval '20 days', '00000000-0000-0000-0000-000000000022'),
  ('10000000-0000-0000-0000-000000000402', 'Planificación de rutas: Google Maps',    '/viajes/planificacion/rutas',       'TEXT', 'Marcadores, listas, offline maps. Ruta óptima.',           now() - interval '18 days', null),
  ('10000000-0000-0000-0000-000000000403', 'Cómo elegir alojamiento',               '/viajes/planificacion/alojamiento', 'TEXT', 'Airbnb vs hotel vs hostel. Ubicación, reseñas.',           now() - interval '15 days', null),

  -- ── viajes/mochilero ──────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000411', 'Equipaje minimalista: solo carry-on',    '/viajes/mochilero/equipaje', 'TEXT', 'Regla de los 3. Telas técnicas. Cubo organizador.',              now() - interval '14 days', null),
  ('10000000-0000-0000-0000-000000000412', 'Hostels: cómo elegir y sobrevivir',      '/viajes/mochilero/hostels',  'TEXT', 'Booking vs Hostelworld. Litera top/bottom. Casillero.',          now() - interval '12 days', null),

  -- ── viajes/fotos ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000421', 'Composición fotográfica en viajes',      '/viajes/fotos/composicion',  'TEXT', 'Regla de tercios, líneas guía, foreground. Hora dorada.',        now() - interval '10 days', null),
  ('10000000-0000-0000-0000-000000000422', 'Edición con Lightroom mobile',           '/viajes/fotos/edicion',      'TEXT', 'Exposición, contraste, HSL. Presets. Exportar para redes.',      now() - interval '8 days',  null),

  -- ── salud/mental ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000501', 'Meditación mindfulness: guía inicial',   '/salud/mental/meditacion',  'TEXT', '5-10 min diarios. Body scan. Headspace vs Waking Up.',             now() - interval '5 days',  '00000000-0000-0000-0000-000000000023'),
  ('10000000-0000-0000-0000-000000000502', 'Gestión de la ansiedad',                 '/salud/mental/ansiedad',    'TEXT', 'Técnica 4-7-8, exposición gradual, journaling.',                   now() - interval '7 days',  null),
  ('10000000-0000-0000-0000-000000000503', 'Construcción de hábitos: Atomic Habits', '/salud/mental/habitos',     'TEXT', 'Cue-routine-reward. Habit stacking. 1% mejor cada día.',          now() - interval '9 days',  null),

  -- ── salud/fisica ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000511', 'Higiene del sueño',                      '/salud/fisica/sueno',     'TEXT', 'Ritmo circadiano, luz azul, temperatura habitación.',               now() - interval '6 days',  null),
  ('10000000-0000-0000-0000-000000000512', 'Ejercicio aeróbico y longevidad',        '/salud/fisica/ejercicio', 'TEXT', 'Zona 2, VO2max. Estudios de longevidad. 150min/semana.',            now() - interval '8 days',  null),

  -- ── salud/nutricion ───────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000521', 'Dieta mediterránea: evidencia',          '/salud/nutricion/dieta',  'TEXT', 'Aceite oliva, pescado azul, legumbres. Microbiota.',                now() - interval '10 days', null),
  ('10000000-0000-0000-0000-000000000522', 'Ayuno intermitente 16:8',               '/salud/nutricion/ayuno',  'TEXT', 'Ventana alimentaria, autofagia. Evidencia científica.',             now() - interval '7 days',  null)

ON CONFLICT (id) DO NOTHING;

-- =========================================================
--  Tags — registro jerárquico (L0 → L1 → L2, respeta FK parent)
-- =========================================================
INSERT INTO tags (name, parent_name) VALUES
  -- L0
  ('dev',    NULL), ('ia',     NULL), ('infra',  NULL), ('soft',   NULL),
  ('cocina', NULL), ('deporte',NULL), ('viajes', NULL), ('salud',  NULL)
ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name, parent_name) VALUES
  -- L1 dev
  ('dev/frontend', 'dev'), ('dev/backend', 'dev'), ('dev/database', 'dev'),
  -- L1 ia
  ('ia/ml', 'ia'), ('ia/nlp', 'ia'), ('ia/data', 'ia'),
  -- L1 infra
  ('infra/devops', 'infra'), ('infra/cloud', 'infra'), ('infra/security', 'infra'),
  -- L1 soft
  ('soft/arquitectura', 'soft'), ('soft/testing', 'soft'), ('soft/productividad', 'soft'),
  -- L1 cocina
  ('cocina/tecnicas', 'cocina'), ('cocina/reposteria', 'cocina'), ('cocina/mundial', 'cocina'),
  -- L1 deporte
  ('deporte/entrenamiento', 'deporte'), ('deporte/nutricion', 'deporte'), ('deporte/mindset', 'deporte'),
  -- L1 viajes
  ('viajes/planificacion', 'viajes'), ('viajes/mochilero', 'viajes'), ('viajes/fotos', 'viajes'),
  -- L1 salud
  ('salud/mental', 'salud'), ('salud/fisica', 'salud'), ('salud/nutricion', 'salud')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name, parent_name) VALUES
  -- L2 dev/frontend
  ('dev/frontend/react',      'dev/frontend'),
  ('dev/frontend/typescript', 'dev/frontend'),
  ('dev/frontend/css',        'dev/frontend'),
  -- L2 dev/backend
  ('dev/backend/java',        'dev/backend'),
  ('dev/backend/python',      'dev/backend'),
  ('dev/backend/api',         'dev/backend'),
  -- L2 dev/database
  ('dev/database/postgresql', 'dev/database'),
  ('dev/database/nosql',      'dev/database'),
  ('dev/database/redis',      'dev/database'),
  -- L2 ia/ml
  ('ia/ml/deep-learning',     'ia/ml'),
  ('ia/ml/tensorflow',        'ia/ml'),
  ('ia/ml/sklearn',           'ia/ml'),
  -- L2 ia/nlp
  ('ia/nlp/transformers',     'ia/nlp'),
  ('ia/nlp/gpt',              'ia/nlp'),
  -- L2 ia/data
  ('ia/data/pandas',          'ia/data'),
  ('ia/data/visualizacion',   'ia/data'),
  ('ia/data/feature-eng',     'ia/data'),
  -- L2 infra/devops
  ('infra/devops/docker',     'infra/devops'),
  ('infra/devops/kubernetes', 'infra/devops'),
  ('infra/devops/ci-cd',      'infra/devops'),
  -- L2 infra/cloud
  ('infra/cloud/aws',         'infra/cloud'),
  ('infra/cloud/terraform',   'infra/cloud'),
  -- L2 infra/security
  ('infra/security/owasp',    'infra/security'),
  ('infra/security/auth',     'infra/security'),
  -- L2 soft/arquitectura
  ('soft/arquitectura/patrones',       'soft/arquitectura'),
  ('soft/arquitectura/microservicios', 'soft/arquitectura'),
  ('soft/arquitectura/hexagonal',      'soft/arquitectura'),
  -- L2 soft/testing
  ('soft/testing/tdd',        'soft/testing'),
  ('soft/testing/e2e',        'soft/testing'),
  -- L2 soft/productividad
  ('soft/productividad/pomodoro', 'soft/productividad'),
  ('soft/productividad/adr',      'soft/productividad'),
  -- L2 cocina/tecnicas
  ('cocina/tecnicas/cuchillo',  'cocina/tecnicas'),
  ('cocina/tecnicas/coccion',   'cocina/tecnicas'),
  ('cocina/tecnicas/emplatado', 'cocina/tecnicas'),
  -- L2 cocina/reposteria
  ('cocina/reposteria/masas',      'cocina/reposteria'),
  ('cocina/reposteria/decoracion', 'cocina/reposteria'),
  -- L2 cocina/mundial
  ('cocina/mundial/asiatica', 'cocina/mundial'),
  ('cocina/mundial/italiana', 'cocina/mundial'),
  ('cocina/mundial/mexicana', 'cocina/mundial'),
  -- L2 deporte/entrenamiento
  ('deporte/entrenamiento/fuerza',    'deporte/entrenamiento'),
  ('deporte/entrenamiento/cardio',    'deporte/entrenamiento'),
  ('deporte/entrenamiento/movilidad', 'deporte/entrenamiento'),
  -- L2 deporte/nutricion
  ('deporte/nutricion/proteinas',   'deporte/nutricion'),
  ('deporte/nutricion/suplementos', 'deporte/nutricion'),
  -- L2 deporte/mindset
  ('deporte/mindset/motivacion', 'deporte/mindset'),
  ('deporte/mindset/recovery',   'deporte/mindset'),
  -- L2 viajes/planificacion
  ('viajes/planificacion/presupuesto', 'viajes/planificacion'),
  ('viajes/planificacion/rutas',       'viajes/planificacion'),
  ('viajes/planificacion/alojamiento', 'viajes/planificacion'),
  -- L2 viajes/mochilero
  ('viajes/mochilero/equipaje', 'viajes/mochilero'),
  ('viajes/mochilero/hostels',  'viajes/mochilero'),
  -- L2 viajes/fotos
  ('viajes/fotos/composicion', 'viajes/fotos'),
  ('viajes/fotos/edicion',     'viajes/fotos'),
  -- L2 salud/mental
  ('salud/mental/meditacion', 'salud/mental'),
  ('salud/mental/ansiedad',   'salud/mental'),
  ('salud/mental/habitos',    'salud/mental'),
  -- L2 salud/fisica
  ('salud/fisica/sueno',     'salud/fisica'),
  ('salud/fisica/ejercicio', 'salud/fisica'),
  -- L2 salud/nutricion
  ('salud/nutricion/dieta', 'salud/nutricion'),
  ('salud/nutricion/ayuno', 'salud/nutricion')
ON CONFLICT (name) DO NOTHING;

-- =========================================================
--  Tags — paths jerárquicos (note_tags)
-- =========================================================
INSERT INTO note_tags (note_id, tag_name) VALUES
  -- dev/frontend
  ('10000000-0000-0000-0000-000000000001', 'dev/frontend/react'),      ('10000000-0000-0000-0000-000000000001', 'dev/frontend'),
  ('10000000-0000-0000-0000-000000000003', 'dev/frontend/react'),      ('10000000-0000-0000-0000-000000000003', 'dev/frontend'),
  ('10000000-0000-0000-0000-000000000005', 'dev/frontend/react'),      ('10000000-0000-0000-0000-000000000005', 'dev/frontend'),
  ('10000000-0000-0000-0000-000000000002', 'dev/frontend/typescript'), ('10000000-0000-0000-0000-000000000002', 'dev/frontend'),
  ('10000000-0000-0000-0000-000000000004', 'dev/frontend/css'),        ('10000000-0000-0000-0000-000000000004', 'dev/frontend'),
  ('10000000-0000-0000-0000-000000000006', 'dev/frontend/css'),        ('10000000-0000-0000-0000-000000000006', 'dev/frontend'),
  -- dev/backend
  ('10000000-0000-0000-0000-000000000011', 'dev/backend/java'),        ('10000000-0000-0000-0000-000000000011', 'dev/backend'),
  ('10000000-0000-0000-0000-000000000012', 'dev/backend/java'),        ('10000000-0000-0000-0000-000000000012', 'dev/backend'),
  ('10000000-0000-0000-0000-000000000013', 'dev/backend/python'),      ('10000000-0000-0000-0000-000000000013', 'dev/backend'),
  ('10000000-0000-0000-0000-000000000014', 'dev/backend/python'),      ('10000000-0000-0000-0000-000000000014', 'dev/backend'),
  ('10000000-0000-0000-0000-000000000015', 'dev/backend/api'),         ('10000000-0000-0000-0000-000000000015', 'dev/backend'),
  ('10000000-0000-0000-0000-000000000016', 'dev/backend/api'),         ('10000000-0000-0000-0000-000000000016', 'dev/backend'),
  -- dev/database
  ('10000000-0000-0000-0000-000000000021', 'dev/database/postgresql'), ('10000000-0000-0000-0000-000000000021', 'dev/database'),
  ('10000000-0000-0000-0000-000000000022', 'dev/database/postgresql'), ('10000000-0000-0000-0000-000000000022', 'dev/database'),
  ('10000000-0000-0000-0000-000000000023', 'dev/database/nosql'),      ('10000000-0000-0000-0000-000000000023', 'dev/database'),
  ('10000000-0000-0000-0000-000000000024', 'dev/database/nosql'),      ('10000000-0000-0000-0000-000000000024', 'dev/database'),
  ('10000000-0000-0000-0000-000000000025', 'dev/database/redis'),      ('10000000-0000-0000-0000-000000000025', 'dev/database'),
  -- ia/ml
  ('10000000-0000-0000-0000-000000000031', 'ia/ml/deep-learning'),     ('10000000-0000-0000-0000-000000000031', 'ia/ml'),
  ('10000000-0000-0000-0000-000000000032', 'ia/ml/deep-learning'),     ('10000000-0000-0000-0000-000000000032', 'ia/ml'),
  ('10000000-0000-0000-0000-000000000033', 'ia/ml/tensorflow'),        ('10000000-0000-0000-0000-000000000033', 'ia/ml'),
  ('10000000-0000-0000-0000-000000000034', 'ia/ml/tensorflow'),        ('10000000-0000-0000-0000-000000000034', 'ia/ml'),
  ('10000000-0000-0000-0000-000000000035', 'ia/ml/sklearn'),           ('10000000-0000-0000-0000-000000000035', 'ia/ml'),
  -- ia/nlp
  ('10000000-0000-0000-0000-000000000041', 'ia/nlp/transformers'),     ('10000000-0000-0000-0000-000000000041', 'ia/nlp'),
  ('10000000-0000-0000-0000-000000000042', 'ia/nlp/transformers'),     ('10000000-0000-0000-0000-000000000042', 'ia/nlp'),
  ('10000000-0000-0000-0000-000000000043', 'ia/nlp/gpt'),              ('10000000-0000-0000-0000-000000000043', 'ia/nlp'),
  ('10000000-0000-0000-0000-000000000044', 'ia/nlp/gpt'),              ('10000000-0000-0000-0000-000000000044', 'ia/nlp'),
  -- ia/data
  ('10000000-0000-0000-0000-000000000051', 'ia/data/pandas'),          ('10000000-0000-0000-0000-000000000051', 'ia/data'),
  ('10000000-0000-0000-0000-000000000052', 'ia/data/visualizacion'),   ('10000000-0000-0000-0000-000000000052', 'ia/data'),
  ('10000000-0000-0000-0000-000000000053', 'ia/data/feature-eng'),     ('10000000-0000-0000-0000-000000000053', 'ia/data'),
  -- infra/devops
  ('10000000-0000-0000-0000-000000000061', 'infra/devops/docker'),     ('10000000-0000-0000-0000-000000000061', 'infra/devops'),
  ('10000000-0000-0000-0000-000000000062', 'infra/devops/kubernetes'), ('10000000-0000-0000-0000-000000000062', 'infra/devops'),
  ('10000000-0000-0000-0000-000000000063', 'infra/devops/ci-cd'),      ('10000000-0000-0000-0000-000000000063', 'infra/devops'),
  ('10000000-0000-0000-0000-000000000064', 'infra/devops/ci-cd'),      ('10000000-0000-0000-0000-000000000064', 'infra/devops'),
  -- infra/cloud
  ('10000000-0000-0000-0000-000000000071', 'infra/cloud/aws'),         ('10000000-0000-0000-0000-000000000071', 'infra/cloud'),
  ('10000000-0000-0000-0000-000000000072', 'infra/cloud/terraform'),   ('10000000-0000-0000-0000-000000000072', 'infra/cloud'),
  -- infra/security
  ('10000000-0000-0000-0000-000000000081', 'infra/security/owasp'),    ('10000000-0000-0000-0000-000000000081', 'infra/security'),
  ('10000000-0000-0000-0000-000000000082', 'infra/security/auth'),     ('10000000-0000-0000-0000-000000000082', 'infra/security'),
  ('10000000-0000-0000-0000-000000000083', 'infra/security/auth'),     ('10000000-0000-0000-0000-000000000083', 'infra/security'),
  -- soft/arquitectura
  ('10000000-0000-0000-0000-000000000091', 'soft/arquitectura/patrones'),      ('10000000-0000-0000-0000-000000000091', 'soft/arquitectura'),
  ('10000000-0000-0000-0000-000000000092', 'soft/arquitectura/microservicios'),('10000000-0000-0000-0000-000000000092', 'soft/arquitectura'),
  ('10000000-0000-0000-0000-000000000093', 'soft/arquitectura/hexagonal'),     ('10000000-0000-0000-0000-000000000093', 'soft/arquitectura'),
  ('10000000-0000-0000-0000-000000000094', 'soft/arquitectura/microservicios'),('10000000-0000-0000-0000-000000000094', 'soft/arquitectura'),
  -- soft/testing
  ('10000000-0000-0000-0000-000000000101', 'soft/testing/tdd'),        ('10000000-0000-0000-0000-000000000101', 'soft/testing'),
  ('10000000-0000-0000-0000-000000000102', 'soft/testing/tdd'),        ('10000000-0000-0000-0000-000000000102', 'soft/testing'),
  ('10000000-0000-0000-0000-000000000103', 'soft/testing/e2e'),        ('10000000-0000-0000-0000-000000000103', 'soft/testing'),
  -- soft/productividad
  ('10000000-0000-0000-0000-000000000111', 'soft/productividad/pomodoro'), ('10000000-0000-0000-0000-000000000111', 'soft/productividad'),
  ('10000000-0000-0000-0000-000000000112', 'soft/productividad/adr'),      ('10000000-0000-0000-0000-000000000112', 'soft/productividad'),
  ('10000000-0000-0000-0000-000000000113', 'soft/productividad/pomodoro'), ('10000000-0000-0000-0000-000000000113', 'soft/productividad'),
  -- cocina/tecnicas
  ('10000000-0000-0000-0000-000000000201', 'cocina/tecnicas/cuchillo'),  ('10000000-0000-0000-0000-000000000201', 'cocina/tecnicas'),
  ('10000000-0000-0000-0000-000000000202', 'cocina/tecnicas/coccion'),   ('10000000-0000-0000-0000-000000000202', 'cocina/tecnicas'),
  ('10000000-0000-0000-0000-000000000203', 'cocina/tecnicas/emplatado'), ('10000000-0000-0000-0000-000000000203', 'cocina/tecnicas'),
  ('10000000-0000-0000-0000-000000000204', 'cocina/tecnicas/coccion'),   ('10000000-0000-0000-0000-000000000204', 'cocina/tecnicas'),
  -- cocina/reposteria
  ('10000000-0000-0000-0000-000000000211', 'cocina/reposteria/masas'),       ('10000000-0000-0000-0000-000000000211', 'cocina/reposteria'),
  ('10000000-0000-0000-0000-000000000212', 'cocina/reposteria/masas'),       ('10000000-0000-0000-0000-000000000212', 'cocina/reposteria'),
  ('10000000-0000-0000-0000-000000000213', 'cocina/reposteria/decoracion'),  ('10000000-0000-0000-0000-000000000213', 'cocina/reposteria'),
  -- cocina/mundial
  ('10000000-0000-0000-0000-000000000221', 'cocina/mundial/asiatica'),   ('10000000-0000-0000-0000-000000000221', 'cocina/mundial'),
  ('10000000-0000-0000-0000-000000000222', 'cocina/mundial/italiana'),   ('10000000-0000-0000-0000-000000000222', 'cocina/mundial'),
  ('10000000-0000-0000-0000-000000000223', 'cocina/mundial/mexicana'),   ('10000000-0000-0000-0000-000000000223', 'cocina/mundial'),
  -- deporte/entrenamiento
  ('10000000-0000-0000-0000-000000000301', 'deporte/entrenamiento/fuerza'),    ('10000000-0000-0000-0000-000000000301', 'deporte/entrenamiento'),
  ('10000000-0000-0000-0000-000000000302', 'deporte/entrenamiento/cardio'),    ('10000000-0000-0000-0000-000000000302', 'deporte/entrenamiento'),
  ('10000000-0000-0000-0000-000000000303', 'deporte/entrenamiento/movilidad'), ('10000000-0000-0000-0000-000000000303', 'deporte/entrenamiento'),
  ('10000000-0000-0000-0000-000000000304', 'deporte/entrenamiento/fuerza'),    ('10000000-0000-0000-0000-000000000304', 'deporte/entrenamiento'),
  -- deporte/nutricion
  ('10000000-0000-0000-0000-000000000311', 'deporte/nutricion/proteinas'),   ('10000000-0000-0000-0000-000000000311', 'deporte/nutricion'),
  ('10000000-0000-0000-0000-000000000312', 'deporte/nutricion/suplementos'), ('10000000-0000-0000-0000-000000000312', 'deporte/nutricion'),
  -- deporte/mindset
  ('10000000-0000-0000-0000-000000000321', 'deporte/mindset/motivacion'), ('10000000-0000-0000-0000-000000000321', 'deporte/mindset'),
  ('10000000-0000-0000-0000-000000000322', 'deporte/mindset/recovery'),   ('10000000-0000-0000-0000-000000000322', 'deporte/mindset'),
  -- viajes/planificacion
  ('10000000-0000-0000-0000-000000000401', 'viajes/planificacion/presupuesto'), ('10000000-0000-0000-0000-000000000401', 'viajes/planificacion'),
  ('10000000-0000-0000-0000-000000000402', 'viajes/planificacion/rutas'),       ('10000000-0000-0000-0000-000000000402', 'viajes/planificacion'),
  ('10000000-0000-0000-0000-000000000403', 'viajes/planificacion/alojamiento'), ('10000000-0000-0000-0000-000000000403', 'viajes/planificacion'),
  -- viajes/mochilero
  ('10000000-0000-0000-0000-000000000411', 'viajes/mochilero/equipaje'), ('10000000-0000-0000-0000-000000000411', 'viajes/mochilero'),
  ('10000000-0000-0000-0000-000000000412', 'viajes/mochilero/hostels'),  ('10000000-0000-0000-0000-000000000412', 'viajes/mochilero'),
  -- viajes/fotos
  ('10000000-0000-0000-0000-000000000421', 'viajes/fotos/composicion'), ('10000000-0000-0000-0000-000000000421', 'viajes/fotos'),
  ('10000000-0000-0000-0000-000000000422', 'viajes/fotos/edicion'),     ('10000000-0000-0000-0000-000000000422', 'viajes/fotos'),
  -- salud/mental
  ('10000000-0000-0000-0000-000000000501', 'salud/mental/meditacion'), ('10000000-0000-0000-0000-000000000501', 'salud/mental'),
  ('10000000-0000-0000-0000-000000000502', 'salud/mental/ansiedad'),   ('10000000-0000-0000-0000-000000000502', 'salud/mental'),
  ('10000000-0000-0000-0000-000000000503', 'salud/mental/habitos'),    ('10000000-0000-0000-0000-000000000503', 'salud/mental'),
  -- salud/fisica
  ('10000000-0000-0000-0000-000000000511', 'salud/fisica/sueno'),     ('10000000-0000-0000-0000-000000000511', 'salud/fisica'),
  ('10000000-0000-0000-0000-000000000512', 'salud/fisica/ejercicio'), ('10000000-0000-0000-0000-000000000512', 'salud/fisica'),
  -- salud/nutricion
  ('10000000-0000-0000-0000-000000000521', 'salud/nutricion/dieta'), ('10000000-0000-0000-0000-000000000521', 'salud/nutricion'),
  ('10000000-0000-0000-0000-000000000522', 'salud/nutricion/ayuno'), ('10000000-0000-0000-0000-000000000522', 'salud/nutricion')
ON CONFLICT (note_id, tag_name) DO NOTHING;

-- =========================================================
--  Relations
-- =========================================================
INSERT INTO relations (id, note_a, note_b, score, validated) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 0.92, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 0.85, true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000021', 0.70, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000033', 0.88, true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000043', 0.90, true),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000061', '10000000-0000-0000-0000-000000000062', 0.88, true),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000202', 0.82, true),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000211', '10000000-0000-0000-0000-000000000212', 0.91, true),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000301', '10000000-0000-0000-0000-000000000311', 0.78, true),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000321', '10000000-0000-0000-0000-000000000322', 0.85, true),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000401', '10000000-0000-0000-0000-000000000402', 0.80, true),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000502', 0.88, true),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000511', 0.75, true),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000311', '10000000-0000-0000-0000-000000000521', 0.72, true),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000421', '10000000-0000-0000-0000-000000000422', 0.93, true)
ON CONFLICT (id) DO NOTHING;

--
--  L0 (raíces):  dev · ia · infra · soft
--
--  L1 (hijos):
--    dev/frontend         dev/backend         dev/database
--    ia/ml                ia/nlp              ia/data
--    infra/devops         infra/cloud         infra/security
--    soft/arquitectura    soft/testing        soft/productividad
--
--  L2 (nietos):
--    dev/frontend/react         dev/frontend/typescript    dev/frontend/css
--    dev/backend/java           dev/backend/python         dev/backend/api
--    dev/database/postgresql    dev/database/nosql         dev/database/redis
--    ia/ml/deep-learning        ia/ml/tensorflow           ia/ml/sklearn
--    ia/nlp/transformers        ia/nlp/gpt                 ia/nlp/spacy
--    ia/data/pandas             ia/data/visualizacion      ia/data/feature-eng
--    infra/devops/docker        infra/devops/kubernetes    infra/devops/ci-cd
--    infra/cloud/aws            infra/cloud/terraform
--    infra/security/owasp       infra/security/auth
--    soft/arquitectura/patrones soft/arquitectura/microservicios soft/arquitectura/hexagonal
--    soft/testing/tdd           soft/testing/e2e
--    soft/productividad/pomodoro soft/productividad/adr
-- =========================================================
