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
--  Inbox Items  (con proposals_json, ai_summary, output_path, processed_at)
-- =========================================================
INSERT INTO inbox_items (id, raw_text, detected_type, status, proposals_json, ai_summary, output_path, created_at, processed_at) VALUES

  ('00000000-0000-0000-0000-000000000001',
   'Tutorial React 18 con hooks modernos',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":97},{"nivel":2,"etiqueta":"dev/frontend","confianza":95},{"nivel":3,"etiqueta":"dev/frontend/react","confianza":93}],"clasificacion_final_valida":true,"motivo":"Enlace a tutorial sobre React 18, tecnología de frontend."}',
   'React 18 introduce el modo concurrente con Suspense, useTransition y startTransition para controlar qué actualizaciones de UI son urgentes y cuáles pueden diferirse. Los Server Components permiten renderizar en servidor sin enviar JS al cliente. El nuevo hook useDeferredValue evita bloqueos en inputs con cálculos pesados. La hidratación selectiva mejora el Time to Interactive. Recursos clave: react.dev, blog oficial de React.',
   './markdown-notes/Tutorial_React_18_con_hooks_modernos_20260129_120000.md',
   now() - interval '30 days', now() - interval '29 days' + interval '2 hours'),

  ('00000000-0000-0000-0000-000000000002',
   'TypeScript avanzado: generics y utility types',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":96},{"nivel":2,"etiqueta":"dev/frontend","confianza":90},{"nivel":3,"etiqueta":"dev/frontend/typescript","confianza":94}],"clasificacion_final_valida":true,"motivo":"Texto sobre TypeScript avanzado, subtema de frontend."}',
   'TypeScript permite tipos genéricos con constraints (<T extends object>), tipos condicionales (T extends U ? X : Y) e inferencia con infer. Los Utility Types más importantes: Partial<T>, Required<T>, Readonly<T>, Pick<T,K>, Omit<T,K>, Record<K,V>, ReturnType<F>, Parameters<F>. Los Mapped Types permiten transformar cada propiedad de un tipo. Template Literal Types habilitan concatenación de strings a nivel de tipos.',
   './markdown-notes/TypeScript_avanzado_generics_y_utility_types_20260131_090000.md',
   now() - interval '28 days', now() - interval '27 days' + interval '1 hour'),

  ('00000000-0000-0000-0000-000000000003',
   'Tailwind CSS componentes',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":95},{"nivel":2,"etiqueta":"dev/frontend","confianza":92},{"nivel":3,"etiqueta":"dev/frontend/css","confianza":91}],"clasificacion_final_valida":true,"motivo":"Enlace sobre componentes con Tailwind CSS."}',
   'Tailwind CSS usa un sistema JIT (Just-In-Time) que genera solo las clases usadas. La configuración del tema en tailwind.config.js permite extender colores, fuentes y espaciados. Los componentes reutilizables se crean con @apply en CSS o con variantes de componente en frameworks como shadcn/ui. El modo oscuro se activa con la clase dark: y responsive design con prefijos sm:, md:, lg:, xl:.',
   './markdown-notes/Tailwind_CSS_componentes_20260203_150000.md',
   now() - interval '25 days', now() - interval '24 days' + interval '3 hours'),

  ('00000000-0000-0000-0000-000000000004',
   'Spring Boot con JPA y REST',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":97},{"nivel":2,"etiqueta":"dev/backend","confianza":96},{"nivel":3,"etiqueta":"dev/backend/java","confianza":94}],"clasificacion_final_valida":true,"motivo":"Enlace sobre Spring Boot con JPA, tecnología de backend Java."}',
   'Spring Boot auto-configura DataSource, EntityManagerFactory y TransactionManager con solo incluir spring-boot-starter-data-jpa. Los repositorios JPA extienden JpaRepository<T,ID> y generan SQL automáticamente desde el nombre del método (findByEmailAndActive). Las transacciones se gestionan con @Transactional, con niveles de propagación REQUIRED, REQUIRES_NEW. Los controladores REST usan @RestController + @RequestMapping, con manejo centralizado de errores via @ControllerAdvice.',
   './markdown-notes/Spring_Boot_con_JPA_y_REST_20260201_110000.md',
   now() - interval '27 days', now() - interval '26 days' + interval '2 hours'),

  ('00000000-0000-0000-0000-000000000005',
   'FastAPI en producción',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":96},{"nivel":2,"etiqueta":"dev/backend","confianza":93},{"nivel":3,"etiqueta":"dev/backend/python","confianza":92}],"clasificacion_final_valida":true,"motivo":"Texto sobre FastAPI para producción, backend Python."}',
   'FastAPI valida automáticamente request/response con Pydantic v2. La inyección de dependencias (Depends) permite reutilizar lógica de autenticación y acceso a BD. Para producción: usar Gunicorn + Uvicorn workers, configurar CORS con CORSMiddleware, habilitar logging estructurado, añadir middleware de rate-limiting. Las migraciones de BD se gestionan con Alembic. El endpoint /docs genera Swagger UI automáticamente. Deployar con Docker + docker-compose o en Cloud Run/ECS.',
   './markdown-notes/FastAPI_en_produccion_20260206_080000.md',
   now() - interval '22 days', now() - interval '21 days' + interval '1 hour' + interval '30 minutes'),

  ('00000000-0000-0000-0000-000000000006',
   'gRPC vs REST comparativa',
   'QUESTION', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":94},{"nivel":2,"etiqueta":"dev/backend","confianza":91},{"nivel":3,"etiqueta":"dev/backend/api","confianza":90}],"clasificacion_final_valida":true,"motivo":"Pregunta comparativa sobre protocolos de API."}',
   'REST usa HTTP/1.1 con JSON, fácil de consumir desde cualquier cliente, sin contrato estricto. gRPC usa HTTP/2 con Protobuf binario: 5-10x más eficiente en serialización, contratos fuertes (.proto), streaming bidireccional. GraphQL permite al cliente elegir qué campos recibir, ideal para APIs con múltiples consumidores con distintas necesidades. Cuándo usar cada uno: REST para APIs públicas y simplicidad; gRPC para microservicios internos con alto throughput; GraphQL para BFF (Backend For Frontend) con múltiples clientes.',
   './markdown-notes/gRPC_vs_REST_comparativa_20260208_140000.md',
   now() - interval '20 days', now() - interval '19 days' + interval '45 minutes'),

  ('00000000-0000-0000-0000-000000000007',
   'PostgreSQL: índices y EXPLAIN ANALYZE',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":96},{"nivel":2,"etiqueta":"dev/database","confianza":94},{"nivel":3,"etiqueta":"dev/database/postgresql","confianza":95}],"clasificacion_final_valida":true,"motivo":"Texto sobre optimización de PostgreSQL."}',
   'EXPLAIN ANALYZE ejecuta la query y muestra el plan real con tiempos. Los índices B-tree son el tipo por defecto, ideales para igualdad y rangos. GIN para arrays y búsqueda full-text (tsvector). GiST para datos geométricos y rangos complejos. Crear índices parciales (WHERE activo = true) reduce tamaño. Los índices compuestos sirven si el orden de columnas coincide con las queries. VACUUM recobra espacio de filas muertas; AUTOVACUUM se ejecuta automáticamente. Estadísticas actualizadas con ANALYZE son clave para el query planner.',
   './markdown-notes/PostgreSQL_indices_y_EXPLAIN_ANALYZE_20260202_100000.md',
   now() - interval '26 days', now() - interval '25 days' + interval '2 hours'),

  ('00000000-0000-0000-0000-000000000008',
   'MongoDB aggregation pipeline',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":95},{"nivel":2,"etiqueta":"dev/database","confianza":93},{"nivel":3,"etiqueta":"dev/database/nosql","confianza":91}],"clasificacion_final_valida":true,"motivo":"Enlace sobre MongoDB aggregation, base de datos NoSQL."}',
   'El aggregation pipeline de MongoDB procesa documentos en etapas secuenciales: $match (filtrar), $group (agrupar), $project (proyectar campos), $sort, $limit, $skip, $lookup (JOIN entre colecciones), $unwind (expandir arrays). Ejemplo: calcular ventas por categoría en el último mes. Los índices se aprovechan en $match si están al inicio del pipeline. $facet permite múltiples sub-pipelines en paralelo. Para queries frecuentes, considerar materialized views con $merge o $out.',
   './markdown-notes/MongoDB_aggregation_pipeline_20260207_130000.md',
   now() - interval '21 days', now() - interval '20 days' + interval '1 hour' + interval '15 minutes'),

  ('00000000-0000-0000-0000-000000000009',
   'Redis para caché y pub/sub',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":95},{"nivel":2,"etiqueta":"dev/database","confianza":91},{"nivel":3,"etiqueta":"dev/database/redis","confianza":93}],"clasificacion_final_valida":true,"motivo":"Texto sobre Redis, usado como caché y mensajería."}',
   'Redis es una base de datos en memoria con persistencia opcional (RDB snapshots + AOF log). Estructuras de datos: strings, hashes, lists, sets, sorted sets, streams. Para caché: SET key value EX 3600 (TTL en segundos). Políticas de eviction: LRU, LFU, allkeys-random. Pub/Sub para mensajería en tiempo real: PUBLISH channel message / SUBSCRIBE channel. Redis Streams (XADD/XREAD) para event sourcing ligero. Redis Cluster para sharding horizontal. Usar Lettuce o Jedis en Java, redis-py en Python.',
   './markdown-notes/Redis_para_cache_y_pubsub_20260210_160000.md',
   now() - interval '18 days', now() - interval '17 days' + interval '50 minutes'),

  ('00000000-0000-0000-0000-000000000010',
   'Redes neuronales convolucionales',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"ia","confianza":97},{"nivel":2,"etiqueta":"ia/ml","confianza":96},{"nivel":3,"etiqueta":"ia/ml/deep-learning","confianza":95}],"clasificacion_final_valida":true,"motivo":"Enlace sobre CNNs, tema de deep learning."}',
   'Las CNNs aplican filtros convolucionales que detectan bordes, texturas y patrones jerárquicamente. Capa convolucional: kernel de NxN pixels, múltiples filtros generan feature maps. Pooling (max/avg) reduce dimensionalidad preservando características dominantes. Arquitecturas clave: LeNet-5 (1998), AlexNet (2012, ganó ImageNet), VGG-16 (uniformidad), ResNet (conexiones residuales evitan vanishing gradient), EfficientNet (escala balanceada). Transfer learning: usar ResNet/EfficientNet pre-entrenados en ImageNet y hacer fine-tuning con datos propios. Aplicaciones: clasificación de imágenes, detección de objetos (YOLO), segmentación semántica.',
   './markdown-notes/Redes_neuronales_convolucionales_20260124_090000.md',
   now() - interval '35 days', now() - interval '34 days' + interval '3 hours'),

  ('00000000-0000-0000-0000-000000000011',
   'Transformer architecture explicada',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"ia","confianza":97},{"nivel":2,"etiqueta":"ia/nlp","confianza":96},{"nivel":3,"etiqueta":"ia/nlp/transformers","confianza":95}],"clasificacion_final_valida":true,"motivo":"Texto sobre la arquitectura Transformer, base de NLP moderno."}',
   'El paper "Attention Is All You Need" (Vaswani et al., 2017) eliminó la recurrencia. El mecanismo de self-attention computa Query, Key, Value para cada token: Attention(Q,K,V) = softmax(QK^T/√d_k)V. Multi-head attention aprende múltiples representaciones en paralelo. El encoder procesa el input completo; el decoder genera tokens autoregressivamente con cross-attention al encoder. Positional encoding inyecta información de posición. Base de BERT (encoder-only), GPT (decoder-only) y T5 (encoder-decoder). La complejidad cuadrática O(n²) con la longitud de secuencia es el principal cuello de botella, abordado por Flash Attention y arquitecturas sparse.',
   './markdown-notes/Transformer_architecture_explicada_20260126_110000.md',
   now() - interval '33 days', now() - interval '32 days' + interval '2 hours'),

  ('00000000-0000-0000-0000-000000000012',
   'Pandas y visualización de datos',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"ia","confianza":94},{"nivel":2,"etiqueta":"ia/data","confianza":93},{"nivel":3,"etiqueta":"ia/data/pandas","confianza":92}],"clasificacion_final_valida":true,"motivo":"Enlace sobre Pandas y visualización, análisis de datos."}',
   'Pandas opera sobre DataFrames y Series. Operaciones esenciales: read_csv/read_parquet, loc/iloc para selección, groupby+agg para agregaciones, merge/join para combinar DataFrames, pivot_table para tablas dinámicas. Manejo de NaN: fillna, dropna, interpolate. Para visualización: matplotlib.pyplot para gráficos básicos, seaborn para estadísticos (heatmap, pairplot, violinplot), plotly para interactivos. Consejos de rendimiento: usar tipos de datos eficientes (categorías vs strings), vectorizar con apply/np.where en lugar de bucles, usar chunking para archivos grandes.',
   './markdown-notes/Pandas_y_visualizacion_de_datos_20260130_140000.md',
   now() - interval '29 days', now() - interval '28 days' + interval '1 hour' + interval '30 minutes'),

  ('00000000-0000-0000-0000-000000000013',
   'Docker multi-stage builds',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"infra","confianza":97},{"nivel":2,"etiqueta":"infra/devops","confianza":95},{"nivel":3,"etiqueta":"infra/devops/docker","confianza":96}],"clasificacion_final_valida":true,"motivo":"Texto sobre Docker multi-stage builds, DevOps."}',
   'Los multi-stage builds reducen el tamaño de imagen final copiando solo los artefactos necesarios. Ejemplo para Java: stage builder con maven:3.9-eclipse-temurin-21 compila el JAR; stage final con eclipse-temurin:21-jre-alpine solo contiene el JAR. Para Node.js: stage deps instala node_modules, stage build compila assets, stage final es nginx:alpine con solo los estáticos. Best practices: usar imágenes base mínimas (alpine, distroless), ejecutar como usuario no-root (USER nonroot), usar .dockerignore, fijar versiones de imagen con SHA256 digest para reproducibilidad. docker-compose orquesta múltiples servicios en desarrollo.',
   './markdown-notes/Docker_multi-stage_builds_20260204_120000.md',
   now() - interval '24 days', now() - interval '23 days' + interval '45 minutes'),

  ('00000000-0000-0000-0000-000000000014',
   'Kubernetes pods y deployments',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"infra","confianza":97},{"nivel":2,"etiqueta":"infra/devops","confianza":95},{"nivel":3,"etiqueta":"infra/devops/kubernetes","confianza":94}],"clasificacion_final_valida":true,"motivo":"Enlace sobre Kubernetes pods y deployments."}',
   'Un Pod es la unidad mínima de despliegue en K8s, contiene uno o más contenedores que comparten red y almacenamiento. Un Deployment gestiona ReplicaSets para garantizar N réplicas y permite rolling updates con estrategia RollingUpdate (maxSurge, maxUnavailable). Services exponen pods: ClusterIP (interno), NodePort (externo), LoadBalancer (cloud). HPA (Horizontal Pod Autoscaler) escala según CPU/memoria o métricas custom. ConfigMaps y Secrets para configuración. Namespaces para aislar entornos. kubectl esencial: get, describe, logs, exec, apply, rollout status/undo.',
   './markdown-notes/Kubernetes_pods_y_deployments_20260209_100000.md',
   now() - interval '19 days', now() - interval '18 days' + interval '2 hours'),

  ('00000000-0000-0000-0000-000000000015',
   'OWASP Top 10 vulnerabilidades',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"infra","confianza":96},{"nivel":2,"etiqueta":"infra/security","confianza":95},{"nivel":3,"etiqueta":"infra/security/owasp","confianza":94}],"clasificacion_final_valida":true,"motivo":"Texto sobre OWASP Top 10, seguridad web."}',
   'OWASP Top 10 2021: A01 Broken Access Control (el más común), A02 Cryptographic Failures (datos sensibles en claro), A03 Injection (SQL/NoSQL/OS), A04 Insecure Design (fallos de arquitectura), A05 Security Misconfiguration, A06 Vulnerable and Outdated Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures (SAST/DAST), A09 Security Logging and Monitoring Failures, A10 Server-Side Request Forgery. Prevención SQL injection: usar prepared statements/ORM. Prevención XSS: escapar output, Content-Security-Policy. CSRF: tokens sincronizados o SameSite cookies.',
   './markdown-notes/OWASP_Top_10_vulnerabilidades_20260127_080000.md',
   now() - interval '32 days', now() - interval '31 days' + interval '1 hour'),

  ('00000000-0000-0000-0000-000000000016',
   'Patrones de diseño GoF',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":97},{"nivel":2,"etiqueta":"soft/arquitectura","confianza":95},{"nivel":3,"etiqueta":"soft/arquitectura/patrones","confianza":94}],"clasificacion_final_valida":true,"motivo":"Texto sobre patrones de diseño del Gang of Four."}',
   'Los 23 patrones GoF se dividen en Creacionales, Estructurales y de Comportamiento. Creacionales: Factory Method (delega creación a subclases), Abstract Factory (familias de objetos), Builder (construcción paso a paso), Prototype (clonar), Singleton (instancia única). Estructurales: Adapter (interfaz compatible), Decorator (añadir responsabilidades), Facade (interfaz simplificada), Composite (árbol de objetos). Comportamiento: Observer (eventos), Strategy (algoritmos intercambiables), Command (encapsular acciones), Iterator, Template Method. En Java modernos: los lambdas simplifican Strategy y Command. Spring usa extensivamente Factory, Proxy, Template Method.',
   './markdown-notes/Patrones_de_diseno_GoF_20260119_090000.md',
   now() - interval '40 days', now() - interval '39 days' + interval '2 hours'),

  ('00000000-0000-0000-0000-000000000017',
   'TDD con JUnit 5 y Mockito',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":96},{"nivel":2,"etiqueta":"soft/testing","confianza":95},{"nivel":3,"etiqueta":"soft/testing/tdd","confianza":93}],"clasificacion_final_valida":true,"motivo":"Enlace sobre TDD con JUnit 5 y Mockito."}',
   'TDD sigue el ciclo Red-Green-Refactor: escribir test que falla, implementar mínimo para pasar, refactorizar. JUnit 5 (Jupiter): @Test, @BeforeEach, @AfterEach, @ParameterizedTest con @ValueSource/@CsvSource, @ExtendWith(MockitoExtension.class). AssertJ para assertions fluidas: assertThat(result).isEqualTo(expected).isNotNull(). Mockito: when(mock.method(arg)).thenReturn(value), verify(mock, times(1)).method(arg), @Captor para capturar argumentos. Spring Boot Test: @SpringBootTest para integration tests, @WebMvcTest para controllers, @DataJpaTest para repositorios con H2 en memoria.',
   './markdown-notes/TDD_con_JUnit5_y_Mockito_20260205_170000.md',
   now() - interval '23 days', now() - interval '22 days' + interval '1 hour' + interval '20 minutes'),

  ('00000000-0000-0000-0000-000000000018',
   'Técnica Pomodoro para devs',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":92},{"nivel":2,"etiqueta":"soft/productividad","confianza":91},{"nivel":3,"etiqueta":"soft/productividad/pomodoro","confianza":90}],"clasificacion_final_valida":true,"motivo":"Texto sobre la técnica Pomodoro aplicada al desarrollo."}',
   'La técnica Pomodoro divide el trabajo en bloques de 25 minutos (pomodoros) separados por descansos de 5 minutos, con descanso largo de 15-30 min cada 4 pomodoros. Beneficios para devs: combate la procrastinación, mejora el foco en tareas complejas (debugging, diseño de arquitectura), cuantifica el esfuerzo real. Variaciones: 52/17 para trabajo profundo (Deep Work de Cal Newport), timeboxing para estimaciones ágiles. Herramientas: Pomofocus.io, Forest app, simple timer del sistema. Combinar con técnica GTD: capturar tareas → procesar → organizar → revisar → ejecutar con Pomodoro.',
   './markdown-notes/Tecnica_Pomodoro_para_devs_20260214_180000.md',
   now() - interval '15 days', now() - interval '14 days' + interval '30 minutes'),

  ('00000000-0000-0000-0000-000000000019',
   'Técnica del cuchillo japonés',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"cocina","confianza":97},{"nivel":2,"etiqueta":"cocina/tecnicas","confianza":96},{"nivel":3,"etiqueta":"cocina/tecnicas/cuchillo","confianza":95}],"clasificacion_final_valida":true,"motivo":"Enlace sobre técnica de cuchillo japonés, cocina."}',
   'Los cuchillos japoneses tienen un ángulo de filo más agudo (10-15°) que los europeos (20-25°), dando mayor precisión pero también más fragilidad. Tipos principales: Gyuto (chef japonés, polivalente), Santoku (tres virtudes: carne, pescado, verdura), Nakiri (verduras, hoja rectangular), Yanagiba (sashimi, hoja larga y fina), Deba (pescado entero). Cortes básicos: brunoise (dado fino 2-3mm), juliana (bastones finos), chiffonade (tiras finas de hojas), mirepoix (dado grueso). Mantenimiento: afilar con piedra de agua (whetstone) en grano progresivo 400→1000→3000→6000, secar inmediatamente, no lavar en lavavajillas.',
   './markdown-notes/Tecnica_del_cuchillo_japones_20260219_160000.md',
   now() - interval '10 days', now() - interval '9 days' + interval '1 hour'),

  ('00000000-0000-0000-0000-000000000020',
   'Masa madre para principiantes',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"cocina","confianza":97},{"nivel":2,"etiqueta":"cocina/reposteria","confianza":93},{"nivel":3,"etiqueta":"cocina/reposteria/masas","confianza":95}],"clasificacion_final_valida":true,"motivo":"Texto sobre masa madre, repostería y panadería."}',
   'La masa madre es una cultura viva de levaduras y bacterias lácticas. Para crearla: mezclar 50g harina integral + 50g agua a 25°C, alimentar cada 24h con la misma proporción durante 7-10 días hasta que doble en 4-6h con burbujas activas. Hidratación: 100% (igual peso harina y agua) para principiantes. La temperatura óptima de fermentación es 24-26°C. Señal de punto: pasa la prueba del flotador (una cucharadita flota en agua). Para pan de masa madre: autólisis 30min, incorporar levain al 20% del peso de harina, pliegues cada 30min × 4, fermentación en bulk 4-6h, formado, retardo en nevera 12-14h, hornear con vapor a 250°C en cocotte.',
   './markdown-notes/Masa_madre_para_principiantes_20260221_190000.md',
   now() - interval '8 days', now() - interval '7 days' + interval '45 minutes'),

  ('00000000-0000-0000-0000-000000000021',
   'Entrenamiento de fuerza 5x5',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"deporte","confianza":97},{"nivel":2,"etiqueta":"deporte/entrenamiento","confianza":96},{"nivel":3,"etiqueta":"deporte/entrenamiento/fuerza","confianza":95}],"clasificacion_final_valida":true,"motivo":"Enlace sobre entrenamiento de fuerza con programa 5x5."}',
   'El programa StrongLifts 5x5 alterna dos días: A (Sentadilla, Press Banca, Remo con Barra) y B (Sentadilla, Press Militar, Peso Muerto). Se entrena 3 días/semana con días de descanso entre sesiones. Progresión lineal: +2.5kg por sesión en press y remo, +5kg en sentadilla y peso muerto. Cuando fallas 3 veces consecutivas en un peso (deload): reducir al 90% y retomar la progresión. El volumen en sentadilla (5x5 cada sesión) es la clave del programa. Periodización: después de 3-6 meses de progresión lineal, pasar a Texas Method (intermediate) o 5/3/1 de Wendler. Equipamiento básico: barra olímpica 20kg, discos, rack de sentadilla.',
   './markdown-notes/Entrenamiento_de_fuerza_5x5_20260217_080000.md',
   now() - interval '12 days', now() - interval '11 days' + interval '1 hour' + interval '10 minutes'),

  ('00000000-0000-0000-0000-000000000022',
   'Viaje a Japón: guía completa',
   'LINK', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":97},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":95},{"nivel":3,"etiqueta":"viajes/planificacion/presupuesto","confianza":92}],"clasificacion_final_valida":true,"motivo":"Enlace sobre guía de viaje a Japón, planificación y presupuesto."}',
   'Presupuesto medio: 150-200€/día incluyendo alojamiento (hostel/business hotel), transporte (JR Pass 7 días ~350€), comida (ramen ~8€, conveyor belt sushi ~15€, izakaya ~20-30€). El JR Pass cubre shinkansen y la mayoría de trenes JR. IC Card (Suica/Pasmo) para metro y buses locales. Épocas recomendadas: marzo-abril (sakura), noviembre (koyo/colores otoñales). Evitar Golden Week (principios de mayo) y Obon (agosto). Itinerario 14 días: Tokio 5 días (Shinjuku, Shibuya, Akihabara, Tsukiji, Nikko day trip), Kioto 4 días (Fushimi Inari, Arashiyama, Nishiki Market, Nijo), Osaka 2 días (Dotonbori, Takoyaki), Hiroshima/Miyajima 1 día, Hakone 2 días (Monte Fuji). Apps esenciales: Google Translate (foto), Hyperdia (trenes), Google Maps offline.',
   './markdown-notes/Viaje_a_Japon_guia_completa_20260208_200000.md',
   now() - interval '20 days', now() - interval '19 days' + interval '2 hours' + interval '30 minutes'),

  ('00000000-0000-0000-0000-000000000023',
   'Meditación mindfulness diaria',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"salud","confianza":97},{"nivel":2,"etiqueta":"salud/mental","confianza":96},{"nivel":3,"etiqueta":"salud/mental/meditacion","confianza":95}],"clasificacion_final_valida":true,"motivo":"Texto sobre meditación mindfulness para práctica diaria."}',
   'Mindfulness es la práctica de prestar atención al momento presente de forma intencional y sin juicio. Técnicas principales: meditación de respiración (observar la respiración 5-10 min), body scan (recorrer el cuerpo progresivamente), meditación caminando (atención a cada paso), loving-kindness (generar compasión). Beneficios respaldados científicamente: reducción de cortisol (estrés), mejora de la memoria de trabajo, aumento del grosor de la corteza prefrontal, reducción de síntomas de ansiedad y depresión. Empezar con 5 min diarios, mejor por la mañana. Apps: Headspace (guiada, estructurada), Waking Up (Sam Harris, más filosófica), Insight Timer (gratuita, comunidad). La consistencia diaria importa más que la duración de cada sesión.',
   './markdown-notes/Meditacion_mindfulness_diaria_20260224_070000.md',
   now() - interval '5 days', now() - interval '4 days' + interval '20 minutes'),

  -- ── Inbox items que reutilizan los mds reales generados por el sistema ──────

  -- Comunicación interpersonal (5 versiones del mismo texto, cada una con su md real)
  ('00000000-0000-0000-0000-000000000024',
   'Tengo que hacer un curso de cómo hablar con gente en persona',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":88},{"nivel":2,"etiqueta":"soft/productividad","confianza":85},{"nivel":3,"etiqueta":"soft/productividad/comunicacion","confianza":83}],"clasificacion_final_valida":true,"motivo":"Texto sobre mejorar habilidades de comunicación interpersonal."}',
   'Aprender a comunicarse mejor en persona implica entrenamiento en escucha activa, lenguaje corporal y gestión de la ansiedad social. Técnicas: mantener contacto visual sin fijar, usar el nombre del interlocutor, hacer preguntas abiertas, parafrasear para confirmar comprensión. Cursos útiles: Toastmasters para hablar en público, talleres de comunicación no violenta (CNV). La práctica deliberada en situaciones de baja presión acelera el aprendizaje.',
   './markdown-notes/tengo_que_hacer_un_curso_de_como_hablar_con_gente_en_persona_20260228_135355.md',
   '2026-02-28T13:30:00Z', '2026-02-28T13:53:20Z'),

  ('00000000-0000-0000-0000-000000000025',
   'Tengo que hacer un curso de cómo hablar con gente en persona',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":87},{"nivel":2,"etiqueta":"soft/productividad","confianza":84},{"nivel":3,"etiqueta":"soft/productividad/comunicacion","confianza":82}],"clasificacion_final_valida":true,"motivo":"Necesidad de mejorar comunicación cara a cara."}',
   'La comunicación en persona se diferencia de la digital por la presencia de señales no verbales (55% del mensaje). Claves: postura abierta, tono de voz modulado, escucha sin interrumpir. Para la timidez social: exposición gradual, técnica de las 3 preguntas para mantener conversación. Recursos: libro "El arte de caer bien" de Dale Carnegie, podcasts de oratoria.',
   './markdown-notes/tengo_que_hacer_un_curso_de_como_hablar_con_gente_en_persona_20260228_140038.md',
   '2026-02-28T13:55:00Z', '2026-02-28T14:00:38Z'),

  ('00000000-0000-0000-0000-000000000026',
   'Tengo que hacer un curso de cómo hablar con gente en persona',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":86},{"nivel":2,"etiqueta":"soft/productividad","confianza":83},{"nivel":3,"etiqueta":"soft/productividad/comunicacion","confianza":81}],"clasificacion_final_valida":true,"motivo":"Mejorar habilidades conversacionales presenciales."}',
   'Comunicación efectiva: claridad (mensaje simple y directo), empatía (ponerse en el lugar del otro), asertividad (expresar sin agredir ni ceder). Para desarrolladores: mejorar comunicación en stand-ups, code reviews y conversaciones técnicas con no-técnicos. Practicar el elevator pitch propio: explicar tu trabajo en 30 segundos.',
   './markdown-notes/tengo_que_hacer_un_curso_de_como_hablar_con_gente_en_persona_20260228_142036.md',
   '2026-02-28T14:05:00Z', '2026-02-28T14:21:00Z'),

  ('00000000-0000-0000-0000-000000000027',
   'Tengo que hacer un curso de cómo hablar con gente en persona',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":86},{"nivel":2,"etiqueta":"soft/productividad","confianza":83},{"nivel":3,"etiqueta":"soft/productividad/comunicacion","confianza":82}],"clasificacion_final_valida":true,"motivo":"Habilidades de entrevista y comunicación presencial."}',
   'Las entrevistas de trabajo requieren comunicación verbal y no verbal sólida. Técnica STAR (Situación, Tarea, Acción, Resultado) para responder preguntas conductuales. Practicar en voz alta antes de la entrevista. Networking: cómo iniciar conversaciones en eventos profesionales, seguimiento post-evento por LinkedIn.',
   './markdown-notes/tengo_que_hacer_un_curso_de_como_hablar_con_gente_en_persona_20260228_151450.md',
   '2026-02-28T15:10:00Z', '2026-02-28T15:14:50Z'),

  ('00000000-0000-0000-0000-000000000028',
   'Tengo que hacer un curso de cómo hablar con gente en persona',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":85},{"nivel":2,"etiqueta":"soft/productividad","confianza":82},{"nivel":3,"etiqueta":"soft/productividad/comunicacion","confianza":80}],"clasificacion_final_valida":true,"motivo":"Comunicación efectiva en persona, habilidad profesional."}',
   'Comunicación presencial efectiva: adaptar el mensaje al interlocutor, usar storytelling para ideas complejas, gestionar silencios cómodos. Para introvertidos: preparar temas de conversación de antemano, recargar energía antes de eventos sociales, aprovechar fortalezas (escucha profunda, reflexión). Curso recomendado: Comunicación No Violenta (Marshall Rosenberg).',
   './markdown-notes/tengo_que_hacer_un_curso_de_como_hablar_con_gente_en_persona_20260228_152511.md',
   '2026-02-28T15:20:00Z', '2026-02-28T15:25:11Z'),

  -- Mesa (cocina/técnicas)
  ('00000000-0000-0000-0000-000000000029',
   'Mesa de trabajo en la cocina',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"cocina","confianza":85},{"nivel":2,"etiqueta":"cocina/tecnicas","confianza":83},{"nivel":3,"etiqueta":"cocina/tecnicas/coccion","confianza":80}],"clasificacion_final_valida":true,"motivo":"Texto sobre el uso y organización de la mesa de trabajo en cocina."}',
   'La mesa de trabajo (plan de travail) es el espacio central de la cocina profesional y doméstica. Organización mise en place: tener todos los ingredientes preparados y a mano antes de comenzar. Limpieza continua: limpiar la tabla y la superficie entre cada preparación. Evitar la contaminación cruzada manteniendo zonas separadas para carnes, pescados y vegetales. Una buena iluminación sobre la mesa reduce errores de corte.',
   './markdown-notes/mesa_20260228_134113.md',
   '2026-02-28T13:35:00Z', '2026-02-28T13:41:00Z'),

  -- Silla / muebles (no encaja en ninguna categoría principal → soft/productividad)
  ('00000000-0000-0000-0000-000000000030',
   'Silla ergonómica para trabajar',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"salud","confianza":82},{"nivel":2,"etiqueta":"salud/fisica","confianza":80},{"nivel":3,"etiqueta":"salud/fisica/ergonomia","confianza":79}],"clasificacion_final_valida":true,"motivo":"Texto sobre ergonomía y tipos de silla para trabajo sedentario."}',
   'Una silla ergonómica reduce la fatiga y previene dolores de espalda en jornadas largas de trabajo. Características clave: soporte lumbar ajustable, altura regulable, apoyabrazos a la altura del escritorio, asiento con ángulo de 90-100°. Alternativas: silla de rodillas (activa la espalda), taburete de pie, pelota de ejercicios (con moderación). Recomendación: levantarse y caminar 5 minutos cada hora independientemente de la silla.',
   './markdown-notes/silla_20260228_150548.md',
   '2026-02-28T15:40:00Z', '2026-02-28T15:05:48Z'),

  -- Galleta / repostería
  ('00000000-0000-0000-0000-000000000031',
   'Galleta',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"cocina","confianza":88},{"nivel":2,"etiqueta":"cocina/reposteria","confianza":86},{"nivel":3,"etiqueta":"cocina/reposteria/masas","confianza":84}],"clasificacion_final_valida":true,"motivo":"Texto sobre galletas, repostería básica."}',
   'Las galletas (cookies) son uno de los productos de repostería más versátiles. Variables clave: ratio mantequilla/harina determina la textura (más mantequilla = más crujiente al enfriarse), el tipo de azúcar (blanco = más crujiente, moreno = más masticable por la melaza), temperatura del horno (180°C para dorado uniforme). Para galletas tipo cookie americana: usar mantequilla a temperatura ambiente, enfriar la masa 30 min antes de hornear para controlar el extendido.',
   './markdown-notes/galleta_20260228_152705.md',
   '2026-02-28T15:22:00Z', '2026-02-28T15:27:05Z'),

  -- Receta tarta lotus
  ('00000000-0000-0000-0000-000000000032',
   'Receta de tarta de galleta lotus',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"cocina","confianza":93},{"nivel":2,"etiqueta":"cocina/reposteria","confianza":91},{"nivel":3,"etiqueta":"cocina/reposteria/masas","confianza":89}],"clasificacion_final_valida":true,"motivo":"Receta específica de tarta con galletas Lotus Biscoff."}',
   'Tarta de galleta Lotus Biscoff: base de galletas trituradas con mantequilla derretida (200g galletas + 80g mantequilla), compactada y refrigerada 30 min. Relleno: 300g queso crema + 200ml nata para montar + 100g pasta Biscoff + 60g azúcar glas, montar hasta consistencia firme. Decorar con galletas enteras y un hilo de pasta Biscoff calentada. Sin horno, refrigerar mínimo 4 horas antes de servir.',
   './markdown-notes/receta_de_tarta_de_galleta_lotus_20260228_140426.md',
   '2026-02-28T14:00:00Z', '2026-02-28T14:04:26Z'),

  -- Ordenador portátil
  ('00000000-0000-0000-0000-000000000033',
   'Ordenador portátil para programación',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":82},{"nivel":2,"etiqueta":"dev/hardware","confianza":80},{"nivel":3,"etiqueta":"dev/hardware/laptop","confianza":78}],"clasificacion_final_valida":true,"motivo":"Texto sobre elección de ordenador portátil para desarrollo de software."}',
   'Para programación: mínimo 16GB RAM (32GB recomendado para VMs y Docker), SSD NVMe, CPU con buena single-thread performance. Opciones top: MacBook Pro M4 (excelente para desarrollo macOS/iOS, batería), ThinkPad X1 Carbon (Linux-compatible, teclado excelente), ASUS ZenBook (relación calidad-precio). Para ML/IA: GPU NVIDIA con CUDA; para desarrollo web: cualquier opción. El monitor externo es más impactante en productividad que el portátil en sí.',
   './markdown-notes/ordenador_portatil_20260228_140905.md',
   '2026-02-28T14:05:00Z', '2026-02-28T14:09:05Z'),

  -- Precios hotel Tenerife
  ('00000000-0000-0000-0000-000000000034',
   'Precios de hotel Tenerife',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":91},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":89},{"nivel":3,"etiqueta":"viajes/planificacion/presupuesto","confianza":87}],"clasificacion_final_valida":true,"motivo":"Consulta sobre precios de alojamiento en Tenerife."}',
   'Tenerife: precios de hotel varían según zona y temporada. Sur (Los Cristianos, Playa de las Américas): todo incluido desde 60-80€/noche por persona. Norte (Puerto de la Cruz): hoteles más auténticos, 50-90€/noche. Temporada alta: diciembre-enero y julio-agosto. Alternativas económicas: apartamentos en Airbnb desde 40€/noche. Vuelos desde península: 50-150€ ida y vuelta con Ryanair/Vueling con antelación.',
   './markdown-notes/precios_de_hotel_tenerife_20260228_142254.md',
   '2026-02-28T14:20:00Z', '2026-02-28T14:22:54Z'),

  -- Precio hotel Canarias (versión 1)
  ('00000000-0000-0000-0000-000000000035',
   'Precio hotel Canarias',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":90},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":88},{"nivel":3,"etiqueta":"viajes/planificacion/presupuesto","confianza":86}],"clasificacion_final_valida":true,"motivo":"Consulta sobre precios de hoteles en las Islas Canarias."}',
   'Islas Canarias: destino de sol garantizado todo el año (18-25°C). Canarias más económicas: Lanzarote y Fuerteventura (menos masa turística). Gran Canaria y Tenerife: más opciones pero más caras en temporada alta. Herramientas para comparar precios: Booking.com, Hotels.com, Google Hoteles. Consejo: reservar con 2-3 meses de antelación para mejores precios; última hora también funciona en baja temporada.',
   './markdown-notes/precio_hotel_canarias_20260228_152046.md',
   '2026-02-28T15:15:00Z', '2026-02-28T15:20:46Z'),

  -- Precio hotel Canarias (versión 2)
  ('00000000-0000-0000-0000-000000000036',
   'Precio hotel Canarias',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":89},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":87},{"nivel":3,"etiqueta":"viajes/planificacion/presupuesto","confianza":85}],"clasificacion_final_valida":true,"motivo":"Información sobre costes de alojamiento en Canarias."}',
   'Presupuesto viaje Canarias 7 días para dos personas: vuelos 150-300€ (ambos), hotel 3 estrellas 350-600€, comidas 300-500€, actividades 150-250€. Total estimado: 950-1650€ por pareja. Opciones para ahorrar: apartamentos con cocina, supermercados locales para desayunos y cenas, excursiones por libre vs. agencias. Las islas menores (La Palma, El Hierro, La Gomera) son más económicas y menos masificadas.',
   './markdown-notes/precio_hotel_canarias_20260228_152140.md',
   '2026-02-28T15:17:00Z', '2026-02-28T15:21:40Z'),

  -- Precio hotel Goain (precio hotel Gran Canaria)
  ('00000000-0000-0000-0000-000000000037',
   'Precio hotel Gran Canaria',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":88},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":86},{"nivel":3,"etiqueta":"viajes/planificacion/alojamiento","confianza":84}],"clasificacion_final_valida":true,"motivo":"Consulta sobre alojamiento en Gran Canaria."}',
   'Gran Canaria combina playa (sur: Maspalomas, Playa del Inglés) con montaña (Roque Nublo, Tejeda) y ciudad (Las Palmas, con playa urbana Las Canteras). Hoteles: todo incluido en el sur desde 70€/persona/noche; Las Palmas: hoteles urbanos 60-120€/noche. Actividades gratuitas: Dunas de Maspalomas, casco histórico de Las Palmas (Vegueta), mercado de Triana.',
   './markdown-notes/precio_hotel_goain_20260228_152236.md',
   '2026-02-28T15:18:00Z', '2026-02-28T15:22:36Z'),

  -- Precio hotel Canarias (versión 3 con tips)
  ('00000000-0000-0000-0000-000000000038',
   'Hotel Canarias: consejos de reserva',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":88},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":86},{"nivel":3,"etiqueta":"viajes/planificacion/alojamiento","confianza":85}],"clasificacion_final_valida":true,"motivo":"Consejos para reservar hotel en Canarias con mejor precio."}',
   'Tips para reservar hoteles en Canarias al mejor precio: usar modo incógnito al buscar (algunos sites elevan precios por cookies), comparar Booking vs. precio directo del hotel (a veces el hotel ofrece mejor precio con cancelación gratuita), buscar "early bird" (descuentos 20-30% reservando 60+ días antes), revisar ofertas de último momento en Lastminute.com. En temporada baja (mayo-junio, septiembre-octubre) los precios bajan un 30-40%.',
   './markdown-notes/precio_hotel_canarias_20260228_152411.md',
   '2026-02-28T15:19:00Z', '2026-02-28T15:24:11Z'),

  -- Precio hotel en las Maldivas
  ('00000000-0000-0000-0000-000000000039',
   'Precio de un hotel en las Maldivas',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":90},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":88},{"nivel":3,"etiqueta":"viajes/planificacion/presupuesto","confianza":86}],"clasificacion_final_valida":true,"motivo":"Consulta sobre costes de alojamiento en las Maldivas."}',
   'Maldivas: destino de lujo con precios altos pero opciones para todos los presupuestos. Resorts overwater (bungalows sobre el agua): 300-1500€/noche. Guesthouses en islas locales (Maafushi, Dhigurah): 50-120€/noche. Vuelos: Madrid-Malé ~600-1000€ ida y vuelta. Mejor época: noviembre-abril (temporada seca). Alternativas económicas: alojarse en isla local + excursiones en barco al arrecife, evitar resorts privados de isla.',
   './markdown-notes/precio_de_un_hotel_en_las_ladivas_20260228_151027.md',
   '2026-02-28T15:05:00Z', '2026-02-28T15:10:27Z'),

  -- Un león cazando en la sabana
  ('00000000-0000-0000-0000-000000000040',
   'Un león cazando en la sabana',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":80},{"nivel":2,"etiqueta":"viajes/fotos","confianza":78},{"nivel":3,"etiqueta":"viajes/fotos/composicion","confianza":76}],"clasificacion_final_valida":true,"motivo":"Descripción de escena de vida salvaje, relevante para fotografía de naturaleza y viajes."}',
   'Los leones cazan principalmente al amanecer y al anochecer, aprovechando la luz tenue. Para fotografiar caza de leones en safari: usar teleobjetivo 400-600mm, disparar en ráfaga, configurar velocidad de obturación mínima 1/1000s para congelar movimiento. Los mejores safaris para ver caza: Masai Mara (Kenya) en septiembre-octubre durante la migración, Serengeti (Tanzania), Luangwa (Zambia). Distancia de seguridad en vehículo: siempre mantener el motor encendido.',
   './markdown-notes/Un_león_cazando_en_la_sabana_20260228_152726.md',
   '2026-02-28T15:23:00Z', '2026-02-28T15:27:26Z'),

  -- Recursos humanos
  ('00000000-0000-0000-0000-000000000041',
   'Quiero estudiar algo de recursos humanos',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"soft","confianza":83},{"nivel":2,"etiqueta":"soft/productividad","confianza":80},{"nivel":3,"etiqueta":"soft/productividad/comunicacion","confianza":78}],"clasificacion_final_valida":true,"motivo":"Interés en formación en recursos humanos y gestión de personas."}',
   'Recursos Humanos cubre selección, formación, desarrollo, compensación y relaciones laborales. Para empezar: certificaciones SHRM (internacionales) o AEDIPE (España). Estudios formales: Grado en Relaciones Laborales, Máster en RRHH. Habilidades clave: entrevistas por competencias (técnica STAR), gestión del rendimiento (OKRs, evaluaciones 360°), legislación laboral básica (contrato, nómina, despido). Digital HR: HRIS como Workday, SAP SuccessFactors, BambooHR.',
   './markdown-notes/quiero_estudiar_algo_de_recursos_humanos_20260228_142407.md',
   '2026-02-28T14:20:00Z', '2026-02-28T14:24:07Z'),

  -- Deep learning aplicado
  ('00000000-0000-0000-0000-000000000042',
   'Cómo haces algo con deep learning',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"ia","confianza":91},{"nivel":2,"etiqueta":"ia/ml","confianza":89},{"nivel":3,"etiqueta":"ia/ml/deep-learning","confianza":88}],"clasificacion_final_valida":true,"motivo":"Pregunta práctica sobre cómo aplicar deep learning a un problema real."}',
   'Para aplicar deep learning: 1) Definir el problema (clasificación, regresión, generación). 2) Conseguir datos etiquetados (mínimo miles de ejemplos, millones para resultados SOTA). 3) Elegir arquitectura (CNN para imágenes, Transformer para texto, RNN/LSTM para series temporales). 4) Usar Transfer Learning si los datos son escasos (ResNet, BERT preentrenados). 5) Entrenar con GPU (Google Colab gratis, Kaggle notebooks). 6) Evaluar con métricas correctas (accuracy, F1, AUC). 7) Desplegar con FastAPI + Docker.',
   './markdown-notes/como_haces_algo_con_deep_learning_20260228_142513.md',
   '2026-02-28T14:22:00Z', '2026-02-28T14:25:13Z'),

  -- Fiebre / médico (versión 1)
  ('00000000-0000-0000-0000-000000000043',
   'Ayer fui al médico y me dijo que tenía fiebre',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"salud","confianza":89},{"nivel":2,"etiqueta":"salud/fisica","confianza":87},{"nivel":3,"etiqueta":"salud/fisica/sintomas","confianza":85}],"clasificacion_final_valida":true,"motivo":"Nota personal sobre consulta médica y diagnóstico de fiebre."}',
   'La fiebre (temperatura >37.5°C) es una respuesta inmune normal ante infecciones. Manejo: hidratación abundante (2-3L agua), reposo, paracetamol o ibuprofeno si >38.5°C o malestar intenso. Señales de alarma que requieren urgencias: fiebre >40°C, rigidez de nuca, dificultad respiratoria, confusión, fiebre persistente >3 días. Hacer seguimiento: anotar temperatura cada 6-8 horas para reportar al médico la evolución.',
   './markdown-notes/ayer_fui_ak_medico_y_me_dijo_que_tenia_fiebre_20260228_142133.md',
   '2026-02-28T14:15:00Z', '2026-02-28T14:21:33Z'),

  -- Fiebre / médico (versión 2)
  ('00000000-0000-0000-0000-000000000044',
   'Ayer el médico me dijo que tenía fiebre',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"salud","confianza":88},{"nivel":2,"etiqueta":"salud/fisica","confianza":86},{"nivel":3,"etiqueta":"salud/fisica/sintomas","confianza":84}],"clasificacion_final_valida":true,"motivo":"Nota sobre diagnóstico médico de fiebre y seguimiento."}',
   'Fiebre diagnosticada: protocolo de seguimiento en casa. Medicación: paracetamol 1g/8h o ibuprofeno 600mg/8h (no mezclar). Reposo relativo: actividad mínima, evitar ejercicio hasta 48h después de normalizarse la temperatura. Dieta: alimentos fáciles de digerir, caldos, frutas. Vuelta al trabajo: esperar al menos 24h sin fiebre sin medicación antipirética. Si la fiebre es recurrente, solicitar analítica completa.',
   './markdown-notes/ayer_el_medico_me_dijo_que_tenia_fiebre_20260228_150624.md',
   '2026-02-28T15:00:00Z', '2026-02-28T15:06:24Z'),

  -- Zanahoria / nutrición
  ('00000000-0000-0000-0000-000000000045',
   'Zanahoria',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"salud","confianza":86},{"nivel":2,"etiqueta":"salud/nutricion","confianza":84},{"nivel":3,"etiqueta":"salud/nutricion/alimentos","confianza":82}],"clasificacion_final_valida":true,"motivo":"Nota sobre propiedades nutricionales y usos de la zanahoria."}',
   'La zanahoria es una raíz rica en betacaroteno (precursor vitamina A), vitamina K, fibra y potasio. 100g aportan ~41 kcal. El betacaroteno se absorbe mejor cocinado y con grasa (aceite de oliva). Usos en cocina: cruda (snack, ensaladas), asada (concentra el dulzor), en caldos y sofrito (base aromática), en repostería (carrot cake). Conservación: hasta 3 semanas en nevera en bolsa perforada. Beneficios: salud ocular (vitamina A), piel, sistema inmune.',
   './markdown-notes/zanahoria_20260228_220503.md',
   '2026-02-28T21:55:00Z', '2026-02-28T22:05:03Z'),

  -- Transcripción / audio processing
  ('00000000-0000-0000-0000-000000000046',
   'Por qué de transcripción o gestía',
   'AUDIO', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":82},{"nivel":2,"etiqueta":"dev/backend","confianza":79},{"nivel":3,"etiqueta":"dev/backend/audio","confianza":77}],"clasificacion_final_valida":true,"motivo":"Nota de audio sobre servicios de transcripción y procesamiento de audio."}',
   'Transcripción automática de audio a texto: opciones principales. Whisper (OpenAI, open source): excelente precisión en múltiples idiomas, puede correr localmente. AssemblyAI y Deepgram: APIs cloud con diarización (identificar quién habla), palabras clave, sentimiento. Google Speech-to-Text: buena integración con GCP. Para este proyecto (Brain-RepTrack): el servicio de transcripción en Python usa Whisper para convertir audios a texto antes de procesarlos en el inbox pipeline.',
   './markdown-notes/Poré_de_transcripción_o_gestia_20260228_164722.md',
   '2026-02-28T16:35:00Z', '2026-02-28T16:47:22Z'),

  -- 91237812038012 (imagen / número de serie - contenido real de test)
  ('00000000-0000-0000-0000-000000000047',
   '91237812038012',
   'IMAGE', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":72},{"nivel":2,"etiqueta":"dev/backend","confianza":69},{"nivel":3,"etiqueta":"dev/backend/java","confianza":67}],"clasificacion_final_valida":true,"motivo":"Imagen con número de referencia, clasificada en dev por contexto del proyecto."}',
   'Elemento procesado por el pipeline de imágenes: número de referencia o código identificador extraído mediante OCR. El sistema de transcripción convierte imágenes con texto a items del inbox para su clasificación. Para texto puro en imágenes: Tesseract (OCR open source) o Vision API de Google. El pipeline actual usa el servicio Python de transcripción para procesar tanto audios como imágenes antes de enviarlos al motor de clasificación IA.',
   './markdown-notes/91237812038012_20260228_135221.md',
   '2026-02-28T13:48:00Z', '2026-02-28T13:52:21Z'),

  -- 11D7963D (imagen JPEG)
  ('00000000-0000-0000-0000-000000000048',
   '11D7963D-DA26-4A09-9F47-6899F5C0497D.jpeg',
   'IMAGE', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":70},{"nivel":2,"etiqueta":"dev/backend","confianza":67},{"nivel":3,"etiqueta":"dev/backend/java","confianza":65}],"clasificacion_final_valida":true,"motivo":"Imagen procesada por el pipeline, identificada por UUID como archivo del sistema."}',
   'Imagen procesada por el pipeline de visión del proyecto. El servicio de transcripción extrae texto e información visual de la imagen, que luego el motor de clasificación IA categoriza y almacena como nota. Las imágenes con UUID como nombre son generadas habitualmente por apps móviles (iOS Photos, Android Camera). El pipeline soporta JPEG, PNG y HEIC mediante conversión previa.',
   './markdown-notes/11D7963D-DA26-4A09-9F47-6899F5C0497Djpeg_20260228_213006.md',
   '2026-02-28T21:25:00Z', '2026-02-28T21:30:06Z'),

  -- pomxml (archivo pom.xml)
  ('00000000-0000-0000-0000-000000000049',
   'pom.xml',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":90},{"nivel":2,"etiqueta":"dev/backend","confianza":88},{"nivel":3,"etiqueta":"dev/backend/java","confianza":87}],"clasificacion_final_valida":true,"motivo":"Archivo de configuración Maven, clasificado en dev/backend/java."}',
   'El pom.xml (Project Object Model) es el archivo de configuración central de Maven. Define: groupId/artifactId/version del proyecto, dependencias con sus versiones, plugins de build (maven-compiler, spring-boot-maven-plugin), perfiles (dev/prod). Para Spring Boot: spring-boot-starter-parent como parent POM gestiona las versiones compatibles. Buenas prácticas: usar properties para centralizar versiones, BOM (Bill of Materials) para dependencias de frameworks complejos como Spring Cloud.',
   './markdown-notes/pomxml_20260228_212037.md',
   '2026-02-28T21:15:00Z', '2026-02-28T21:20:37Z'),

  -- Albacete capital (versión 1)
  ('00000000-0000-0000-0000-000000000050',
   'Albacete capital',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":83},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":81},{"nivel":3,"etiqueta":"viajes/planificacion/rutas","confianza":79}],"clasificacion_final_valida":true,"motivo":"Información sobre Albacete como capital provincial y destino de viaje."}',
   'Albacete es la capital de la provincia homónima en Castilla-La Mancha. Conocida por su Feria (del 7 al 17 de septiembre, una de las más grandes de España), la industria cuchillera (Museo de la Cuchillería), y el Parque de Abelardo Sánchez. Gastronomía: gazpacho manchego (no es la sopa fría sino un guiso con tortas de gazpacho), morteruelo, ajo arriero. Distancia desde Madrid: 250km por autovía A-31 (~2h).',
   './markdown-notes/Albacete_capital_20260301_001801.md',
   '2026-03-01T00:12:00Z', '2026-03-01T00:18:01Z'),

  -- Albacete capital (versión 2)
  ('00000000-0000-0000-0000-000000000051',
   'Albacete capital',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"viajes","confianza":82},{"nivel":2,"etiqueta":"viajes/planificacion","confianza":80},{"nivel":3,"etiqueta":"viajes/planificacion/rutas","confianza":78}],"clasificacion_final_valida":true,"motivo":"Segunda nota sobre Albacete capital, información complementaria."}',
   'Albacete: capital de provincia con 170.000 habitantes. Puntos de interés: Catedral de San Juan Bautista (siglos XVI-XVIII), Pasaje de Lodares (galería modernista de 1925), Museo Provincial de Albacete (arqueología íbera y romana). Para visitar en un día desde Madrid: tren AVE desde Madrid-Atocha ~1h, llegar a mediodía, visita al casco histórico + mercado artesanal de cuchillos, cena y regreso. Hotel recomendado: zona centro, fácil acceso a pié.',
   './markdown-notes/Albacete_capital_20260301_001827.md',
   '2026-03-01T00:13:00Z', '2026-03-01T00:18:27Z'),

  -- Informe 5 PDF
  ('00000000-0000-0000-0000-000000000052',
   'Informe5.pdf',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":75},{"nivel":2,"etiqueta":"dev/backend","confianza":72},{"nivel":3,"etiqueta":"dev/backend/java","confianza":70}],"clasificacion_final_valida":true,"motivo":"Documento PDF procesado por el pipeline, clasificado por contenido técnico."}',
   'Documento PDF procesado por el sistema de extracción de texto. El pipeline de Brain-RepTrack extrae el contenido de PDFs mediante Apache PDFBox (Java) o pdfplumber (Python), lo convierte a texto plano y lo envía al motor de clasificación IA. Para PDFs escaneados (imágenes): se requiere OCR previo. Los documentos técnicos como informes se clasifican automáticamente según su contenido, permitiendo crear notas estructuradas a partir de documentación existente.',
   './markdown-notes/Informe5pdf_20260228_205739.md',
   '2026-02-28T20:50:00Z', '2026-02-28T20:57:39Z'),

  -- Informe 6 PDF (múltiples versiones - solo la más completa)
  ('00000000-0000-0000-0000-000000000053',
   'Informe6.pdf',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":76},{"nivel":2,"etiqueta":"dev/backend","confianza":73},{"nivel":3,"etiqueta":"dev/backend/java","confianza":71}],"clasificacion_final_valida":true,"motivo":"Documento PDF Informe 6, procesado por el pipeline de extracción."}',
   'Segundo documento PDF del conjunto de informes procesados. El pipeline maneja múltiples versiones del mismo documento (re-procesado con mejoras iterativas del modelo de clasificación). Cada versión genera un md independiente con el timestamp de procesado. Esto permite comparar cómo evoluciona la clasificación IA con diferentes versiones del modelo. Los informes técnicos suelen clasificarse en dev o infra según su contenido (código, arquitectura, análisis de sistemas).',
   './markdown-notes/Informe6pdf_20260301_002452.md',
   '2026-03-01T00:18:00Z', '2026-03-01T00:24:52Z'),

  -- Informe 7 PDF
  ('00000000-0000-0000-0000-000000000054',
   'Informe7.pdf',
   'TEXT', 'PROCESSED',
   '{"clasificacion":[{"nivel":1,"etiqueta":"dev","confianza":77},{"nivel":2,"etiqueta":"dev/backend","confianza":74},{"nivel":3,"etiqueta":"dev/backend/java","confianza":72}],"clasificacion_final_valida":true,"motivo":"Séptimo informe PDF procesado por el pipeline."}',
   'Informe técnico procesado por el pipeline de documentos. El sistema de Brain-RepTrack está diseñado para ingerir documentación técnica existente (informes, especificaciones, documentos de arquitectura) y convertirla en notas estructuradas con clasificación automática. Esto facilita la construcción progresiva de una base de conocimiento personal a partir de documentación ya existente, sin necesidad de resumirla manualmente.',
   './markdown-notes/Informe7pdf_20260301_011125.md',
   '2026-03-01T01:05:00Z', '2026-03-01T01:11:25Z')

ON CONFLICT (id) DO NOTHING;

-- =========================================================
--  Notas  (con confidence_score)
-- =========================================================
INSERT INTO notes (id, title, path, type, summary, confidence_score, created_at, inbox_item_id) VALUES

  -- ── dev/frontend ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000001', 'React 18: Concurrent Rendering',         'dev/frontend/react',      'CONCEPT', 'Suspense, useTransition, startTransition. Server Components.',          0.93, now() - interval '30 days', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'TypeScript: Generics y Utility Types',   'dev/frontend/typescript', 'CONCEPT', 'Conditional types, infer, mapped types. Partial, Pick, Omit.',          0.94, now() - interval '28 days', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003', 'Next.js 14: App Router',                 'dev/frontend/react',      'CONCEPT', 'Server Components, Streaming SSR, Server Actions.',                      0.88, now() - interval '25 days', null),
  ('10000000-0000-0000-0000-000000000004', 'Tailwind CSS: sistema de diseño',        'dev/frontend/css',        'CONCEPT', 'JIT compiler, configuración de tema, responsive, dark mode.',           0.91, now() - interval '25 days', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000005', 'Zustand: estado global ligero',          'dev/frontend/react',      'CONCEPT', 'Stores, slices, persistencia con middleware.',                           0.85, now() - interval '22 days', null),
  ('10000000-0000-0000-0000-000000000006', 'CSS Grid y Flexbox avanzado',            'dev/frontend/css',        'CONCEPT', 'Grid areas, auto-placement, subgrid. Animaciones CSS.',                 0.87, now() - interval '20 days', null),

  -- ── dev/backend ───────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000011', 'Spring Boot: JPA y REST',               'dev/backend/java',        'CONCEPT', 'Repositorios, servicios, controladores REST. Transacciones.',           0.94, now() - interval '27 days', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000012', 'Spring Security con OAuth2',             'dev/backend/java',        'CONCEPT', 'Authorization server, JWT, roles. Integración con Keycloak.',           0.89, now() - interval '24 days', null),
  ('10000000-0000-0000-0000-000000000013', 'FastAPI: APIs modernas en Python',       'dev/backend/python',      'CONCEPT', 'Pydantic, async/await, dependency injection. OpenAPI automático.',      0.92, now() - interval '22 days', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000014', 'Python async/await y asyncio',           'dev/backend/python',      'CONCEPT', 'Event loop, coroutines, tasks. Comparación con threads.',               0.86, now() - interval '19 days', null),
  ('10000000-0000-0000-0000-000000000015', 'REST vs gRPC vs GraphQL',                'dev/backend/api',         'CONCEPT', 'REST (HTTP/JSON), gRPC (Protobuf), GraphQL (query language).',          0.90, now() - interval '20 days', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000016', 'Apache Kafka: mensajería distribuida',   'dev/backend/api',         'CONCEPT', 'Topics, particiones, producers, consumers. Event-driven.',              0.84, now() - interval '17 days', null),

  -- ── dev/database ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000021', 'PostgreSQL: optimización de queries',    'dev/database/postgresql', 'CONCEPT', 'EXPLAIN ANALYZE, índices B-tree/GIN. Vacuum, estadísticas.',           0.95, now() - interval '26 days', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000022', 'PostgreSQL: transacciones y ACID',       'dev/database/postgresql', 'CONCEPT', 'Niveles de aislamiento, deadlocks, MVCC. WAL.',                         0.88, now() - interval '23 days', null),
  ('10000000-0000-0000-0000-000000000023', 'MongoDB: documentos y aggregations',     'dev/database/nosql',      'CONCEPT', 'Aggregation pipeline, $lookup. Diseño de esquemas flexibles.',          0.91, now() - interval '21 days', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000024', 'Elasticsearch: búsqueda full-text',      'dev/database/nosql',      'CONCEPT', 'Índices invertidos, mapping, queries DSL. Aggregations.',               0.83, now() - interval '18 days', null),
  ('10000000-0000-0000-0000-000000000025', 'Redis: caché y pub/sub',                 'dev/database/redis',      'CONCEPT', 'Strings, hashes, TTL, eviction policies. Pub/Sub y Streams.',          0.93, now() - interval '18 days', '00000000-0000-0000-0000-000000000009'),

  -- ── ia/ml ─────────────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000031', 'CNNs: visión por computador',            'ia/ml/deep-learning',     'CONCEPT', 'Convoluciones, pooling. Arquitecturas: ResNet, EfficientNet.',          0.95, now() - interval '35 days', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000032', 'Reinforcement Learning: Q-Learning',     'ia/ml/deep-learning',     'CONCEPT', 'Q-Learning, DQN. OpenAI Gym. Aplicaciones en juegos.',                  0.82, now() - interval '31 days', null),
  ('10000000-0000-0000-0000-000000000033', 'TensorFlow: redes neuronales',           'ia/ml/tensorflow',        'CONCEPT', 'Keras API, compilación, entrenamiento. TensorBoard.',                   0.86, now() - interval '29 days', null),
  ('10000000-0000-0000-0000-000000000034', 'MLOps: modelos en producción',           'ia/ml/tensorflow',        'CONCEPT', 'MLflow, DVC. Pipeline de entrenamiento y despliegue.',                  0.81, now() - interval '26 days', null),
  ('10000000-0000-0000-0000-000000000035', 'Scikit-learn: ML clásico',               'ia/ml/sklearn',           'CONCEPT', 'Pipelines, cross-validation. Árboles, SVM, clustering.',                0.84, now() - interval '24 days', null),

  -- ── ia/nlp ────────────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000041', 'Arquitectura Transformer',               'ia/nlp/transformers',     'CONCEPT', 'Self-attention, multi-head. Base de BERT, GPT, T5.',                    0.95, now() - interval '33 days', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000042', 'BERT y fine-tuning',                     'ia/nlp/transformers',     'CONCEPT', 'Pre-training, fine-tuning para NER. HuggingFace Transformers.',         0.88, now() - interval '30 days', null),
  ('10000000-0000-0000-0000-000000000043', 'GPT-4 y LLMs en producción',             'ia/nlp/gpt',              'CONCEPT', 'Prompt engineering, RAG, function calling.',                            0.87, now() - interval '27 days', null),
  ('10000000-0000-0000-0000-000000000044', 'LangChain y agentes',                    'ia/nlp/gpt',              'CONCEPT', 'Chains, agents, tools, memory. Integración con vectorstores.',          0.85, now() - interval '24 days', null),

  -- ── ia/data ───────────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000051', 'Pandas: análisis de datos',              'ia/data/pandas',          'CONCEPT', 'DataFrames, groupby, merge. Manejo de NaN.',                            0.92, now() - interval '29 days', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000052', 'Matplotlib y Seaborn',                   'ia/data/visualizacion',   'CONCEPT', 'Gráficos estadísticos, heatmaps. Plotly para interactividad.',          0.83, now() - interval '26 days', null),
  ('10000000-0000-0000-0000-000000000053', 'Feature Engineering',                    'ia/data/feature-eng',     'CONCEPT', 'Normalización, encoding. PCA, t-SNE, UMAP.',                           0.80, now() - interval '23 days', null),

  -- ── infra/devops ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000061', 'Docker: contenedores y compose',         'infra/devops/docker',     'CONCEPT', 'Multi-stage builds, docker-compose. Best practices.',                   0.96, now() - interval '24 days', '00000000-0000-0000-0000-000000000013'),
  ('10000000-0000-0000-0000-000000000062', 'Kubernetes: pods y deployments',         'infra/devops/kubernetes', 'CONCEPT', 'Pods, Services, HPA. kubectl esencial.',                                0.94, now() - interval '19 days', '00000000-0000-0000-0000-000000000014'),
  ('10000000-0000-0000-0000-000000000063', 'CI/CD con GitHub Actions',               'infra/devops/ci-cd',      'CONCEPT', 'Workflows, jobs. Build, test, deploy. Matrix strategy.',                0.87, now() - interval '16 days', null),
  ('10000000-0000-0000-0000-000000000064', 'Prometheus y Grafana',                   'infra/devops/ci-cd',      'CONCEPT', 'Métricas y alertas. PromQL, dashboards. SLIs, SLOs.',                  0.83, now() - interval '14 days', null),

  -- ── infra/cloud ───────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000071', 'AWS: servicios esenciales',              'infra/cloud/aws',         'CONCEPT', 'EC2, S3, RDS, Lambda, ECS. IAM roles. VPC.',                           0.85, now() - interval '22 days', null),
  ('10000000-0000-0000-0000-000000000072', 'Terraform: infraestructura como código', 'infra/cloud/terraform',   'CONCEPT', 'Providers, modules, state. Plan/Apply/Destroy.',                        0.82, now() - interval '20 days', null),

  -- ── infra/security ────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000081', 'OWASP Top 10',                           'infra/security/owasp',    'CONCEPT', 'SQL Injection, XSS, CSRF. Cómo detectar y prevenir.',                  0.94, now() - interval '32 days', '00000000-0000-0000-0000-000000000015'),
  ('10000000-0000-0000-0000-000000000082', 'JWT y autenticación segura',             'infra/security/auth',     'CONCEPT', 'JWT vs sessions. Access tokens, PKCE, OAuth2.',                         0.88, now() - interval '28 days', null),
  ('10000000-0000-0000-0000-000000000083', 'Criptografía para desarrolladores',      'infra/security/auth',     'CONCEPT', 'AES, RSA, Hashing: bcrypt, Argon2. TLS/SSL.',                          0.83, now() - interval '25 days', null),

  -- ── soft/arquitectura ─────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000091', 'Patrones de diseño GoF',                 'soft/arquitectura/patrones',      'CONCEPT', 'Factory, Builder, Adapter, Observer, Strategy.',                0.94, now() - interval '40 days', '00000000-0000-0000-0000-000000000016'),
  ('10000000-0000-0000-0000-000000000092', 'Microservicios vs Monolitos',            'soft/arquitectura/microservicios', 'CONCEPT', 'Cuándo usar cada uno. API gateway. Sagas.',                    0.86, now() - interval '36 days', null),
  ('10000000-0000-0000-0000-000000000093', 'Arquitectura Hexagonal',                 'soft/arquitectura/hexagonal',     'CONCEPT', 'Puertos y adaptadores. Inversión de dependencias.',             0.85, now() - interval '32 days', null),
  ('10000000-0000-0000-0000-000000000094', 'Event-Driven Architecture',              'soft/arquitectura/microservicios', 'CONCEPT', 'Event Sourcing, CQRS. Saga pattern.',                          0.83, now() - interval '28 days', null),

  -- ── soft/testing ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000101', 'TDD: ciclo Red-Green-Refactor',          'soft/testing/tdd',        'CONCEPT', 'JUnit 5, Mockito, AssertJ. Diseño guiado por tests.',                   0.93, now() - interval '23 days', '00000000-0000-0000-0000-000000000017'),
  ('10000000-0000-0000-0000-000000000102', 'Testing pyramid: unit, integration, e2e','soft/testing/tdd',        'CONCEPT', 'Mocks vs stubs. Contract testing. E2E con Playwright.',                0.87, now() - interval '20 days', null),
  ('10000000-0000-0000-0000-000000000103', 'Playwright: tests E2E',                  'soft/testing/e2e',        'CONCEPT', 'Selectors, page object model. Parallel execution.',                    0.84, now() - interval '17 days', null),

  -- ── soft/productividad ────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000111', 'Técnica Pomodoro para programadores',    'soft/productividad/pomodoro', 'CONCEPT', '25min trabajo + 5min descanso. Deep work.',                        0.90, now() - interval '15 days', '00000000-0000-0000-0000-000000000018'),
  ('10000000-0000-0000-0000-000000000112', 'Architecture Decision Records (ADR)',    'soft/productividad/adr',      'CONCEPT', 'Documentar decisiones: contexto, decisión, consecuencias.',         0.86, now() - interval '12 days', null),
  ('10000000-0000-0000-0000-000000000113', 'Code Review efectivo',                   'soft/productividad/pomodoro', 'CONCEPT', 'Cómo dar feedback constructivo. Linters. Cultura.',                0.82, now() - interval '10 days', null),

  -- ── cocina/tecnicas ───────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000201', 'Técnica del cuchillo: cortes básicos',   'cocina/tecnicas/cuchillo', 'CONCEPT', 'Brunoise, juliana, chiffonade. Mantenimiento del filo.',              0.95, now() - interval '10 days', '00000000-0000-0000-0000-000000000019'),
  ('10000000-0000-0000-0000-000000000202', 'Métodos de cocción: seco vs húmedo',     'cocina/tecnicas/coccion',  'CONCEPT', 'Asado, salteado, vapor, estofado. Cómo afecta la textura.',           0.84, now() - interval '9 days',  null),
  ('10000000-0000-0000-0000-000000000203', 'El arte del emplatado',                  'cocina/tecnicas/emplatado','CONCEPT', 'Composición visual, salsa como pintura, alturas. Fine dining.',      0.81, now() - interval '7 days',  null),
  ('10000000-0000-0000-0000-000000000204', 'Fermentación: kimchi y kombucha',        'cocina/tecnicas/coccion',  'CONCEPT', 'Bacterias lácticas, pH, temperatura. Recetas básicas.',              0.83, now() - interval '6 days',  null),

  -- ── cocina/reposteria ─────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000211', 'Masa madre: cultivo y mantenimiento',    'cocina/reposteria/masas',       'CONCEPT', 'Hidratación, alimentación diaria, temperatura.',                0.95, now() - interval '8 days',  '00000000-0000-0000-0000-000000000020'),
  ('10000000-0000-0000-0000-000000000212', 'Croissants: laminado de mantequilla',    'cocina/reposteria/masas',       'CONCEPT', 'Pliegos, temperatura, descansos en frío.',                      0.88, now() - interval '5 days',  null),
  ('10000000-0000-0000-0000-000000000213', 'Decoración con fondant',                 'cocina/reposteria/decoracion',  'CONCEPT', 'Colorantes, modelado, cobertura lisa. Tartas temáticas.',        0.82, now() - interval '4 days',  null),

  -- ── cocina/mundial ────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000221', 'Cocina japonesa: dashi y umami',         'cocina/mundial/asiatica',  'CONCEPT', 'Kombu, katsuobushi. Miso, ramen, dashi desde cero.',                 0.87, now() - interval '11 days', null),
  ('10000000-0000-0000-0000-000000000222', 'Pasta fresca italiana',                  'cocina/mundial/italiana',  'CONCEPT', 'Fettuccine, pappardelle. Rellenas: ravioli, tortellini.',            0.85, now() - interval '9 days',  null),
  ('10000000-0000-0000-0000-000000000223', 'Tacos y salsas mexicanas',               'cocina/mundial/mexicana',  'CONCEPT', 'Tortilla de maíz, carnitas, salsa verde y roja.',                   0.83, now() - interval '7 days',  null),

  -- ── deporte/entrenamiento ─────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000301', 'Fuerza: programa 5x5',                   'deporte/entrenamiento/fuerza',    'CONCEPT', 'Sentadilla, press banca, peso muerto. Progresión lineal.',   0.95, now() - interval '12 days', '00000000-0000-0000-0000-000000000021'),
  ('10000000-0000-0000-0000-000000000302', 'Cardio HIIT: intervalos',                'deporte/entrenamiento/cardio',    'CONCEPT', '20 seg esfuerzo / 10 seg descanso. Variaciones Tabata.',     0.87, now() - interval '10 days', null),
  ('10000000-0000-0000-0000-000000000303', 'Movilidad y flexibilidad',               'deporte/entrenamiento/movilidad', 'CONCEPT', 'Caderas, hombros, tobillo. Foam roller. Rutina matutina.',   0.84, now() - interval '8 days',  null),
  ('10000000-0000-0000-0000-000000000304', 'Calistenia: dominadas y fondos',         'deporte/entrenamiento/fuerza',    'CONCEPT', 'Progresiones. Muscle-up, planche. Equipamiento mínimo.',     0.86, now() - interval '6 days',  null),

  -- ── deporte/nutricion ─────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000311', 'Proteínas: cantidad y fuentes',          'deporte/nutricion/proteinas',   'CONCEPT', '1.6-2.2g/kg. Suero, caseína, fuentes vegetales.',             0.88, now() - interval '11 days', null),
  ('10000000-0000-0000-0000-000000000312', 'Creatina y evidencia científica',        'deporte/nutricion/suplementos', 'CONCEPT', 'Carga vs mantenimiento. Monohidrato. Beneficios reales.',     0.85, now() - interval '9 days',  null),

  -- ── deporte/mindset ───────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000321', 'Motivación intrínseca en el deporte',    'deporte/mindset/motivacion', 'CONCEPT', 'Metas proceso vs resultado. Dopamina. Hábitos.',                  0.83, now() - interval '7 days',  null),
  ('10000000-0000-0000-0000-000000000322', 'Recovery: sueño y sobreentrenamiento',   'deporte/mindset/recovery',   'CONCEPT', 'HRV, deload weeks. Signos de fatiga central.',                    0.85, now() - interval '5 days',  null),

  -- ── viajes/planificacion ──────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000401', 'Cómo presupuestar un viaje largo',       'viajes/planificacion/presupuesto', 'CONCEPT', 'Fondos de emergencia, vuelos baratos, Skyscanner.',        0.92, now() - interval '20 days', '00000000-0000-0000-0000-000000000022'),
  ('10000000-0000-0000-0000-000000000402', 'Planificación de rutas: Google Maps',    'viajes/planificacion/rutas',       'CONCEPT', 'Marcadores, listas, offline maps. Ruta óptima.',           0.85, now() - interval '18 days', null),
  ('10000000-0000-0000-0000-000000000403', 'Cómo elegir alojamiento',               'viajes/planificacion/alojamiento', 'CONCEPT', 'Airbnb vs hotel vs hostel. Ubicación, reseñas.',           0.83, now() - interval '15 days', null),

  -- ── viajes/mochilero ──────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000411', 'Equipaje minimalista: solo carry-on',    'viajes/mochilero/equipaje', 'CONCEPT', 'Regla de los 3. Telas técnicas. Cubo organizador.',              0.84, now() - interval '14 days', null),
  ('10000000-0000-0000-0000-000000000412', 'Hostels: cómo elegir y sobrevivir',      'viajes/mochilero/hostels',  'CONCEPT', 'Booking vs Hostelworld. Litera top/bottom. Casillero.',          0.82, now() - interval '12 days', null),

  -- ── viajes/fotos ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000421', 'Composición fotográfica en viajes',      'viajes/fotos/composicion',  'CONCEPT', 'Regla de tercios, líneas guía, foreground. Hora dorada.',        0.86, now() - interval '10 days', null),
  ('10000000-0000-0000-0000-000000000422', 'Edición con Lightroom mobile',           'viajes/fotos/edicion',      'CONCEPT', 'Exposición, contraste, HSL. Presets. Exportar para redes.',      0.84, now() - interval '8 days',  null),

  -- ── salud/mental ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000501', 'Meditación mindfulness: guía inicial',   'salud/mental/meditacion',  'CONCEPT', '5-10 min diarios. Body scan. Headspace vs Waking Up.',             0.95, now() - interval '5 days',  '00000000-0000-0000-0000-000000000023'),
  ('10000000-0000-0000-0000-000000000502', 'Gestión de la ansiedad',                 'salud/mental/ansiedad',    'CONCEPT', 'Técnica 4-7-8, exposición gradual, journaling.',                   0.87, now() - interval '7 days',  null),
  ('10000000-0000-0000-0000-000000000503', 'Construcción de hábitos: Atomic Habits', 'salud/mental/habitos',     'CONCEPT', 'Cue-routine-reward. Habit stacking. 1% mejor cada día.',          0.88, now() - interval '9 days',  null),

  -- ── salud/fisica ──────────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000511', 'Higiene del sueño',                      'salud/fisica/sueno',     'CONCEPT', 'Ritmo circadiano, luz azul, temperatura habitación.',               0.86, now() - interval '6 days',  null),
  ('10000000-0000-0000-0000-000000000512', 'Ejercicio aeróbico y longevidad',        'salud/fisica/ejercicio', 'CONCEPT', 'Zona 2, VO2max. Estudios de longevidad. 150min/semana.',            0.85, now() - interval '8 days',  null),

  -- ── salud/nutricion ───────────────────────────────────────────────────────
  ('10000000-0000-0000-0000-000000000521', 'Dieta mediterránea: evidencia',          'salud/nutricion/dieta',  'CONCEPT', 'Aceite oliva, pescado azul, legumbres. Microbiota.',                0.84, now() - interval '10 days', null),
  ('10000000-0000-0000-0000-000000000522', 'Ayuno intermitente 16:8',               'salud/nutricion/ayuno',  'CONCEPT', 'Ventana alimentaria, autofagia. Evidencia científica.',             0.83, now() - interval '7 days',  null),

  -- ── Notas generadas por los inbox items de los md reales ─────────────────

  -- Comunicación interpersonal (5 inbox_items 0024-0028)
  ('10000000-0000-0000-0000-000000000601', 'Comunicación interpersonal: escucha activa',  'soft/productividad/comunicacion', 'CONCEPT', 'Contacto visual, parafrasear, preguntas abiertas. Técnica espejo.',  0.83, '2026-02-28T13:53:20Z', '00000000-0000-0000-0000-000000000024'),
  ('10000000-0000-0000-0000-000000000602', 'Comunicación no verbal',                      'soft/productividad/comunicacion', 'CONCEPT', '55% del mensaje es lenguaje corporal. Postura, gestos, expresión.',  0.82, '2026-02-28T14:00:38Z', '00000000-0000-0000-0000-000000000025'),
  ('10000000-0000-0000-0000-000000000603', 'Comunicación asertiva',                       'soft/productividad/comunicacion', 'CONCEPT', 'Expresar necesidades sin agredir ni ceder. CNV de Rosenberg.',       0.81, '2026-02-28T14:21:00Z', '00000000-0000-0000-0000-000000000026'),
  ('10000000-0000-0000-0000-000000000604', 'Entrevista técnica: comunicación STAR',       'soft/productividad/comunicacion', 'CONCEPT', 'Situación-Tarea-Acción-Resultado. Estructurar respuestas.',          0.82, '2026-02-28T15:14:50Z', '00000000-0000-0000-0000-000000000027'),
  ('10000000-0000-0000-0000-000000000605', 'Comunicación para introvertidos',             'soft/productividad/comunicacion', 'CONCEPT', 'Preparar temas, aprovechar escucha profunda, recargar energía.',     0.80, '2026-02-28T15:25:11Z', '00000000-0000-0000-0000-000000000028'),

  -- Mesa de cocina
  ('10000000-0000-0000-0000-000000000606', 'Mise en place: preparación del espacio',      'cocina/tecnicas/coccion',         'CONCEPT', 'Organizar ingredientes antes de cocinar. Limpieza continua.',        0.80, '2026-02-28T13:41:00Z', '00000000-0000-0000-0000-000000000029'),

  -- Silla ergonómica
  ('10000000-0000-0000-0000-000000000607', 'Ergonomía: silla de trabajo',                'salud/fisica/ejercicio',          'CONCEPT', 'Soporte lumbar, altura regulable, apoyabrazos. Levantarse cada hora.', 0.79, '2026-02-28T15:05:48Z', '00000000-0000-0000-0000-000000000030'),

  -- Galleta
  ('10000000-0000-0000-0000-000000000608', 'Galletas: variables de textura',             'cocina/reposteria/masas',          'CONCEPT', 'Ratio mantequilla/harina, azúcar blanco vs moreno, temperatura horno.', 0.84, '2026-02-28T15:27:05Z', '00000000-0000-0000-0000-000000000031'),

  -- Tarta lotus
  ('10000000-0000-0000-0000-000000000609', 'Tarta Lotus Biscoff: receta sin horno',      'cocina/reposteria/masas',          'CONCEPT', 'Base galleta + mantequilla, relleno queso crema + Biscoff. 4h nevera.', 0.89, '2026-02-28T14:04:26Z', '00000000-0000-0000-0000-000000000032'),

  -- Ordenador portátil
  ('10000000-0000-0000-0000-000000000610', 'Laptop para desarrollo: especificaciones',   'dev/hardware/laptop',              'CONCEPT', '16-32GB RAM, SSD NVMe, CPU single-thread. MacBook M4, ThinkPad X1.',  0.78, '2026-02-28T14:09:05Z', '00000000-0000-0000-0000-000000000033'),

  -- Hotel Tenerife
  ('10000000-0000-0000-0000-000000000611', 'Tenerife: precios y zonas de alojamiento',   'viajes/planificacion/presupuesto', 'CONCEPT', 'Sur: todo incluido 60-80€. Norte: 50-90€. Alta: dic-ene, jul-ago.',  0.87, '2026-02-28T14:22:54Z', '00000000-0000-0000-0000-000000000034'),

  -- Hotel Canarias versión 1
  ('10000000-0000-0000-0000-000000000612', 'Canarias: comparativa de islas y precios',   'viajes/planificacion/presupuesto', 'CONCEPT', 'Lanzarote y Fuerteventura más económicas. Reservar 2-3 meses antes.', 0.86, '2026-02-28T15:20:46Z', '00000000-0000-0000-0000-000000000035'),

  -- Hotel Canarias versión 2 (presupuesto total)
  ('10000000-0000-0000-0000-000000000613', 'Presupuesto viaje Canarias 7 días',          'viajes/planificacion/presupuesto', 'CONCEPT', 'Pareja: vuelos+hotel+comidas+actividades ~950-1650€. Apartamento ahorra.', 0.85, '2026-02-28T15:21:40Z', '00000000-0000-0000-0000-000000000036'),

  -- Hotel Gran Canaria
  ('10000000-0000-0000-0000-000000000614', 'Gran Canaria: zonas y actividades',          'viajes/planificacion/alojamiento', 'CONCEPT', 'Sur (Maspalomas), montaña (Roque Nublo), ciudad (Las Palmas).',       0.84, '2026-02-28T15:22:36Z', '00000000-0000-0000-0000-000000000037'),

  -- Hotel Canarias tips reserva
  ('10000000-0000-0000-0000-000000000615', 'Canarias: trucos para reservar más barato',  'viajes/planificacion/alojamiento', 'CONCEPT', 'Modo incógnito, precio directo hotel, early bird -30%. Baja temporada.', 0.85, '2026-02-28T15:24:11Z', '00000000-0000-0000-0000-000000000038'),

  -- Maldivas
  ('10000000-0000-0000-0000-000000000616', 'Maldivas: opciones para cada presupuesto',   'viajes/planificacion/presupuesto', 'CONCEPT', 'Overwater 300-1500€. Guesthouses islas locales 50-120€. Nov-abril.',  0.86, '2026-02-28T15:10:27Z', '00000000-0000-0000-0000-000000000039'),

  -- León sabana
  ('10000000-0000-0000-0000-000000000617', 'Safari fotográfico: fotografiar caza de leones', 'viajes/fotos/composicion',     'CONCEPT', 'Teleobjetivo 400-600mm, 1/1000s mínimo. Masai Mara septiembre-oct.',  0.76, '2026-02-28T15:27:26Z', '00000000-0000-0000-0000-000000000040'),

  -- Recursos Humanos
  ('10000000-0000-0000-0000-000000000618', 'Recursos Humanos: primeros pasos formativos', 'soft/productividad/comunicacion', 'CONCEPT', 'SHRM/AEDIPE, entrevista STAR, OKRs, legislación laboral básica.',     0.78, '2026-02-28T14:24:07Z', '00000000-0000-0000-0000-000000000041'),

  -- Deep learning
  ('10000000-0000-0000-0000-000000000619', 'Deep learning: flujo completo de proyecto',  'ia/ml/deep-learning',             'CONCEPT', 'Problema→datos→arquitectura→transfer learning→GPU→métricas→deploy.', 0.88, '2026-02-28T14:25:13Z', '00000000-0000-0000-0000-000000000042'),

  -- Fiebre/médico v1
  ('10000000-0000-0000-0000-000000000620', 'Fiebre: manejo y señales de alarma',         'salud/fisica/sintomas',           'CONCEPT', '>38.5°C paracetamol/ibuprofeno. Alarma: >40°C, rigidez nuca, >3 días.', 0.85, '2026-02-28T14:21:33Z', '00000000-0000-0000-0000-000000000043'),

  -- Fiebre/médico v2
  ('10000000-0000-0000-0000-000000000621', 'Fiebre: protocolo de seguimiento en casa',   'salud/fisica/sintomas',           'CONCEPT', 'Paracetamol 1g/8h. 24h sin fiebre antes de volver al trabajo.',      0.84, '2026-02-28T15:06:24Z', '00000000-0000-0000-0000-000000000044'),

  -- Zanahoria
  ('10000000-0000-0000-0000-000000000622', 'Zanahoria: propiedades y usos culinarios',   'salud/nutricion/alimentos',       'CONCEPT', 'Betacaroteno, vit K, 41kcal/100g. Mejor cocinada con grasa.',        0.82, '2026-02-28T22:05:03Z', '00000000-0000-0000-0000-000000000045'),

  -- Transcripción audio
  ('10000000-0000-0000-0000-000000000623', 'Transcripción automática: Whisper y APIs',   'dev/backend/audio',               'CONCEPT', 'Whisper local (preciso), AssemblyAI/Deepgram (diarización cloud).',   0.77, '2026-02-28T16:47:22Z', '00000000-0000-0000-0000-000000000046'),

  -- 91237812038012 (imagen/OCR)
  ('10000000-0000-0000-0000-000000000624', 'OCR: extracción de texto en imágenes',       'dev/backend/java',                'CONCEPT', 'Tesseract open source, Vision API Google. Pipeline texto→inbox.',     0.67, '2026-02-28T13:52:21Z', '00000000-0000-0000-0000-000000000047'),

  -- JPEG imagen
  ('10000000-0000-0000-0000-000000000625', 'JPEG: formato para fotografía de viajes',    'viajes/fotos/edicion',            'CONCEPT', 'Compresión con pérdida, EXIF GPS, calidad 80-95%. RAW para edición.', 0.65, '2026-02-28T21:30:06Z', '00000000-0000-0000-0000-000000000048'),

  -- pom.xml
  ('10000000-0000-0000-0000-000000000626', 'Maven pom.xml: estructura y buenas prácticas', 'dev/backend/java',              'CONCEPT', 'GAV, dependencyManagement, BOM, spring-boot-parent. Properties para versiones.', 0.87, '2026-02-28T21:20:37Z', '00000000-0000-0000-0000-000000000049'),

  -- Albacete v1
  ('10000000-0000-0000-0000-000000000627', 'Albacete: turismo y gastronomía',            'viajes/planificacion/rutas',      'CONCEPT', 'Feria septiembre, cuchillería, Parque Abelardo Sánchez. 2h de Madrid.', 0.79, '2026-03-01T00:18:01Z', '00000000-0000-0000-0000-000000000050'),

  -- Albacete v2
  ('10000000-0000-0000-0000-000000000628', 'Albacete: itinerario de un día desde Madrid', 'viajes/planificacion/rutas',     'CONCEPT', 'AVE 1h, Catedral + Pasaje Lodares + mercado cuchillos. Cena y regreso.', 0.78, '2026-03-01T00:18:27Z', '00000000-0000-0000-0000-000000000051'),

  -- Informe 5
  ('10000000-0000-0000-0000-000000000629', 'Procesamiento de PDFs en el pipeline',       'dev/backend/java',                'CONCEPT', 'PDFBox/pdfplumber extrae texto. PDFs escaneados requieren OCR previo.', 0.70, '2026-02-28T20:57:39Z', '00000000-0000-0000-0000-000000000052'),

  -- Informe 6
  ('10000000-0000-0000-0000-000000000630', 'Re-procesado iterativo de documentos',       'dev/backend/java',                'CONCEPT', 'Múltiples versiones del mismo doc permiten comparar mejoras del modelo.', 0.71, '2026-03-01T00:24:52Z', '00000000-0000-0000-0000-000000000053'),

  -- Informe 7
  ('10000000-0000-0000-0000-000000000631', 'Ingestión de documentación técnica existente', 'dev/backend/java',              'CONCEPT', 'Importar specs, informes y ADRs al knowledge base sin resumir manualmente.', 0.72, '2026-03-01T01:11:25Z', '00000000-0000-0000-0000-000000000054')

ON CONFLICT (id) DO NOTHING;

-- =========================================================
--  Actualizar inbox_item_id en notas seed que tienen temática
--  coincidente con los nuevos inbox_items de mds reales
-- =========================================================
UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000042'
  WHERE id IN ('10000000-0000-0000-0000-000000000032',   -- Reinforcement Learning: Q-Learning
               '10000000-0000-0000-0000-000000000033');  -- TensorFlow: redes neuronales

UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000044'
  WHERE id IN ('10000000-0000-0000-0000-000000000502',   -- Gestión de la ansiedad
               '10000000-0000-0000-0000-000000000511');  -- Higiene del sueño

UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000045'
  WHERE id IN ('10000000-0000-0000-0000-000000000521',   -- Dieta mediterránea: evidencia
               '10000000-0000-0000-0000-000000000522');  -- Ayuno intermitente 16:8

UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000035'
  WHERE id IN ('10000000-0000-0000-0000-000000000403',   -- Cómo elegir alojamiento en viajes
               '10000000-0000-0000-0000-000000000412');  -- Hostels: cómo elegir el mejor

UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000036'
  WHERE id = '10000000-0000-0000-0000-000000000402';     -- Planificación de rutas Google Maps

UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000024'
  WHERE id = '10000000-0000-0000-0000-000000000113';     -- Code Review efectivo → comunicación

UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000049'
  WHERE id = '10000000-0000-0000-0000-000000000012';     -- Spring Security → pom.xml/Java

UPDATE notes SET inbox_item_id = '00000000-0000-0000-0000-000000000048'
  WHERE id IN ('10000000-0000-0000-0000-000000000421',   -- Composición fotográfica básica
               '10000000-0000-0000-0000-000000000422');  -- Edición con Lightroom

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

-- Tags adicionales para los nuevos inbox_items (mds reales)
INSERT INTO tags (name, parent_name) VALUES
  -- L1 dev/hardware (nuevo)
  ('dev/hardware', 'dev')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name, parent_name) VALUES
  -- L2 soft/productividad
  ('soft/productividad/comunicacion', 'soft/productividad'),
  -- L2 dev/hardware
  ('dev/hardware/laptop',             'dev/hardware'),
  -- L2 dev/backend
  ('dev/backend/audio',               'dev/backend'),
  -- L2 salud/fisica
  ('salud/fisica/sintomas',           'salud/fisica'),
  -- L2 salud/nutricion
  ('salud/nutricion/alimentos',       'salud/nutricion')
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
  ('10000000-0000-0000-0000-000000000522', 'salud/nutricion/ayuno'), ('10000000-0000-0000-0000-000000000522', 'salud/nutricion'),

  -- ── note_tags de las nuevas notas (mds reales) ───────────────────────────

  -- Comunicación interpersonal (0601-0605)
  ('10000000-0000-0000-0000-000000000601', 'soft/productividad/comunicacion'), ('10000000-0000-0000-0000-000000000601', 'soft/productividad'), ('10000000-0000-0000-0000-000000000601', 'soft'),
  ('10000000-0000-0000-0000-000000000602', 'soft/productividad/comunicacion'), ('10000000-0000-0000-0000-000000000602', 'soft/productividad'), ('10000000-0000-0000-0000-000000000602', 'soft'),
  ('10000000-0000-0000-0000-000000000603', 'soft/productividad/comunicacion'), ('10000000-0000-0000-0000-000000000603', 'soft/productividad'), ('10000000-0000-0000-0000-000000000603', 'soft'),
  ('10000000-0000-0000-0000-000000000604', 'soft/productividad/comunicacion'), ('10000000-0000-0000-0000-000000000604', 'soft/productividad'), ('10000000-0000-0000-0000-000000000604', 'soft'),
  ('10000000-0000-0000-0000-000000000605', 'soft/productividad/comunicacion'), ('10000000-0000-0000-0000-000000000605', 'soft/productividad'), ('10000000-0000-0000-0000-000000000605', 'soft'),
  -- Mesa de cocina (0606)
  ('10000000-0000-0000-0000-000000000606', 'cocina/tecnicas/coccion'), ('10000000-0000-0000-0000-000000000606', 'cocina/tecnicas'), ('10000000-0000-0000-0000-000000000606', 'cocina'),
  -- Silla (0607)
  ('10000000-0000-0000-0000-000000000607', 'salud/fisica/ejercicio'), ('10000000-0000-0000-0000-000000000607', 'salud/fisica'), ('10000000-0000-0000-0000-000000000607', 'salud'),
  -- Galleta (0608)
  ('10000000-0000-0000-0000-000000000608', 'cocina/reposteria/masas'), ('10000000-0000-0000-0000-000000000608', 'cocina/reposteria'), ('10000000-0000-0000-0000-000000000608', 'cocina'),
  -- Tarta lotus (0609)
  ('10000000-0000-0000-0000-000000000609', 'cocina/reposteria/masas'), ('10000000-0000-0000-0000-000000000609', 'cocina/reposteria'), ('10000000-0000-0000-0000-000000000609', 'cocina'),
  -- Laptop (0610)
  ('10000000-0000-0000-0000-000000000610', 'dev/hardware/laptop'), ('10000000-0000-0000-0000-000000000610', 'dev/hardware'), ('10000000-0000-0000-0000-000000000610', 'dev'),
  -- Hotel Tenerife (0611)
  ('10000000-0000-0000-0000-000000000611', 'viajes/planificacion/presupuesto'), ('10000000-0000-0000-0000-000000000611', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000611', 'viajes'),
  -- Canarias comparativa (0612)
  ('10000000-0000-0000-0000-000000000612', 'viajes/planificacion/presupuesto'), ('10000000-0000-0000-0000-000000000612', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000612', 'viajes'),
  -- Presupuesto Canarias (0613)
  ('10000000-0000-0000-0000-000000000613', 'viajes/planificacion/presupuesto'), ('10000000-0000-0000-0000-000000000613', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000613', 'viajes'),
  -- Gran Canaria (0614)
  ('10000000-0000-0000-0000-000000000614', 'viajes/planificacion/alojamiento'), ('10000000-0000-0000-0000-000000000614', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000614', 'viajes'),
  -- Tips reserva (0615)
  ('10000000-0000-0000-0000-000000000615', 'viajes/planificacion/alojamiento'), ('10000000-0000-0000-0000-000000000615', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000615', 'viajes'),
  -- Maldivas (0616)
  ('10000000-0000-0000-0000-000000000616', 'viajes/planificacion/presupuesto'), ('10000000-0000-0000-0000-000000000616', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000616', 'viajes'),
  -- León safari (0617)
  ('10000000-0000-0000-0000-000000000617', 'viajes/fotos/composicion'), ('10000000-0000-0000-0000-000000000617', 'viajes/fotos'), ('10000000-0000-0000-0000-000000000617', 'viajes'),
  -- Recursos humanos (0618)
  ('10000000-0000-0000-0000-000000000618', 'soft/productividad/comunicacion'), ('10000000-0000-0000-0000-000000000618', 'soft/productividad'), ('10000000-0000-0000-0000-000000000618', 'soft'),
  -- Deep learning (0619)
  ('10000000-0000-0000-0000-000000000619', 'ia/ml/deep-learning'), ('10000000-0000-0000-0000-000000000619', 'ia/ml'), ('10000000-0000-0000-0000-000000000619', 'ia'),
  -- Fiebre v1 (0620)
  ('10000000-0000-0000-0000-000000000620', 'salud/fisica/sintomas'), ('10000000-0000-0000-0000-000000000620', 'salud/fisica'), ('10000000-0000-0000-0000-000000000620', 'salud'),
  -- Fiebre v2 (0621)
  ('10000000-0000-0000-0000-000000000621', 'salud/fisica/sintomas'), ('10000000-0000-0000-0000-000000000621', 'salud/fisica'), ('10000000-0000-0000-0000-000000000621', 'salud'),
  -- Zanahoria (0622)
  ('10000000-0000-0000-0000-000000000622', 'salud/nutricion/alimentos'), ('10000000-0000-0000-0000-000000000622', 'salud/nutricion'), ('10000000-0000-0000-0000-000000000622', 'salud'),
  -- Transcripción audio (0623)
  ('10000000-0000-0000-0000-000000000623', 'dev/backend/audio'), ('10000000-0000-0000-0000-000000000623', 'dev/backend'), ('10000000-0000-0000-0000-000000000623', 'dev'),
  -- OCR / imagen (0624)
  ('10000000-0000-0000-0000-000000000624', 'dev/backend/java'), ('10000000-0000-0000-0000-000000000624', 'dev/backend'), ('10000000-0000-0000-0000-000000000624', 'dev'),
  -- JPEG (0625)
  ('10000000-0000-0000-0000-000000000625', 'viajes/fotos/edicion'), ('10000000-0000-0000-0000-000000000625', 'viajes/fotos'), ('10000000-0000-0000-0000-000000000625', 'viajes'),
  -- pom.xml (0626)
  ('10000000-0000-0000-0000-000000000626', 'dev/backend/java'), ('10000000-0000-0000-0000-000000000626', 'dev/backend'), ('10000000-0000-0000-0000-000000000626', 'dev'),
  -- Albacete v1 (0627)
  ('10000000-0000-0000-0000-000000000627', 'viajes/planificacion/rutas'), ('10000000-0000-0000-0000-000000000627', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000627', 'viajes'),
  -- Albacete v2 (0628)
  ('10000000-0000-0000-0000-000000000628', 'viajes/planificacion/rutas'), ('10000000-0000-0000-0000-000000000628', 'viajes/planificacion'), ('10000000-0000-0000-0000-000000000628', 'viajes'),
  -- Informe 5 (0629)
  ('10000000-0000-0000-0000-000000000629', 'dev/backend/java'), ('10000000-0000-0000-0000-000000000629', 'dev/backend'), ('10000000-0000-0000-0000-000000000629', 'dev'),
  -- Informe 6 (0630)
  ('10000000-0000-0000-0000-000000000630', 'dev/backend/java'), ('10000000-0000-0000-0000-000000000630', 'dev/backend'), ('10000000-0000-0000-0000-000000000630', 'dev'),
  -- Informe 7 (0631)
  ('10000000-0000-0000-0000-000000000631', 'dev/backend/java'), ('10000000-0000-0000-0000-000000000631', 'dev/backend'), ('10000000-0000-0000-0000-000000000631', 'dev')
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
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000421', '10000000-0000-0000-0000-000000000422', 0.93, true),

  -- Relations de las nuevas notas (mds reales)
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000601', '10000000-0000-0000-0000-000000000602', 0.91, true),  -- escucha activa ↔ comunicación no verbal
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000601', '10000000-0000-0000-0000-000000000603', 0.88, true),  -- escucha activa ↔ comunicación asertiva
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000604', '10000000-0000-0000-0000-000000000113', 0.82, true),  -- entrevista STAR ↔ code review
  ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000608', '10000000-0000-0000-0000-000000000609', 0.89, true),  -- galleta ↔ tarta lotus
  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000611', '10000000-0000-0000-0000-000000000612', 0.87, true),  -- Tenerife ↔ Canarias
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000612', '10000000-0000-0000-0000-000000000614', 0.86, true),  -- Canarias ↔ Gran Canaria
  ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000619', '10000000-0000-0000-0000-000000000032', 0.85, true),  -- deep learning flujo ↔ RL (Q-Learning)
  ('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000619', '10000000-0000-0000-0000-000000000033', 0.83, true),  -- deep learning flujo ↔ TensorFlow
  ('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000620', '10000000-0000-0000-0000-000000000621', 0.92, true),  -- fiebre señales alarma ↔ protocolo casa
  ('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000622', '10000000-0000-0000-0000-000000000521', 0.80, true),  -- zanahoria ↔ dieta mediterránea
  ('20000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000626', '10000000-0000-0000-0000-000000000012', 0.79, true),  -- pom.xml ↔ Spring Security
  ('20000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000627', '10000000-0000-0000-0000-000000000628', 0.90, true),  -- Albacete turismo ↔ itinerario día
  ('20000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000617', '10000000-0000-0000-0000-000000000421', 0.81, true),  -- safari fotográfico ↔ composición
  ('20000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000606', '10000000-0000-0000-0000-000000000202', 0.83, true)   -- mise en place ↔ métodos de cocción
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
