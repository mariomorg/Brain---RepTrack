-- =========================================================
--  Digital Brain – PostgreSQL Schema
-- =========================================================
--  Before running:
--    CREATE DATABASE digitalbraindb;
--  Then:
--    psql -U postgres -d digitalbraindb -f schema.sql
-- =========================================================

-- ---------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
--  TABLE: inbox_items
-- =========================================================
CREATE TABLE IF NOT EXISTS inbox_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    raw_text        TEXT NOT NULL,
    detected_type   VARCHAR(64),

    status          VARCHAR(32) NOT NULL DEFAULT 'PENDING',

    proposals_json  TEXT,
    final_json      TEXT,

    output_path     VARCHAR(512),

    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    processed_at    TIMESTAMP,

    CONSTRAINT status_check
        CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'ARCHIVED'))
);

-- =========================================================
--  TABLE: notes
-- =========================================================
CREATE TABLE IF NOT EXISTS notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title           VARCHAR(255) NOT NULL,
    path            VARCHAR(512),
    type            VARCHAR(64),
    summary         TEXT,

    created_at      TIMESTAMP NOT NULL DEFAULT now(),

    inbox_item_id   UUID UNIQUE,
    
    CONSTRAINT fk_notes_inbox
        FOREIGN KEY (inbox_item_id)
        REFERENCES inbox_items(id)
        ON DELETE RESTRICT
);

-- =========================================================
--  TABLE: note_tags
-- =========================================================
CREATE TABLE IF NOT EXISTS note_tags (
    note_id     UUID NOT NULL,
    tag_name    VARCHAR(128) NOT NULL,

    PRIMARY KEY (note_id, tag_name),

    CONSTRAINT fk_note_tags_note
        FOREIGN KEY (note_id)
        REFERENCES notes(id)
        ON DELETE CASCADE
);

-- =========================================================
--  TABLE: relations
-- =========================================================
CREATE TABLE IF NOT EXISTS relations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    note_a      UUID NOT NULL,
    note_b      UUID NOT NULL,

    score       DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    validated   BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_rel_note_a
        FOREIGN KEY (note_a)
        REFERENCES notes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rel_note_b
        FOREIGN KEY (note_b)
        REFERENCES notes(id)
        ON DELETE CASCADE,

    CONSTRAINT no_self_relation
        CHECK (note_a <> note_b)
);

-- ---------------------------------------------------------
-- Prevent duplicate inverse relations (A-B same as B-A)
-- ---------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS unique_relation_pair
ON relations (
    LEAST(note_a, note_b),
    GREATEST(note_a, note_b)
);

-- =========================================================
--  Indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_notes_inbox
    ON notes(inbox_item_id);

CREATE INDEX IF NOT EXISTS idx_note_tags_note
    ON note_tags(note_id);

CREATE INDEX IF NOT EXISTS idx_note_tags_tag
    ON note_tags(tag_name);

CREATE INDEX IF NOT EXISTS idx_relations_note_a
    ON relations(note_a);

CREATE INDEX IF NOT EXISTS idx_relations_note_b
    ON relations(note_b);


-- =========================================================
--  Datos de prueba para desarrollo
-- =========================================================
-- Inbox Items
INSERT INTO inbox_items (id, raw_text, detected_type, status, created_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', '¿Qué es la inteligencia artificial?', 'QUESTION', 'PROCESSED', now()),
    ('00000000-0000-0000-0000-000000000002', 'Enlace a paper sobre redes neuronales', 'LINK', 'PROCESSED', now()),
    ('00000000-0000-0000-0000-000000000003', 'Audio de entrevista sobre IA', 'AUDIO', 'PROCESSED', now())
ON CONFLICT (id) DO NOTHING;

-- Notas
INSERT INTO notes (id, title, path, type, summary, created_at, inbox_item_id)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Introducción a la IA', '/notas/ia', 'TEXT', 'Resumen básico sobre IA.', now(), '00000000-0000-0000-0000-000000000001'),
    ('10000000-0000-0000-0000-000000000002', 'Redes neuronales', '/notas/redes', 'LINK', 'Paper fundamental sobre redes neuronales.', now(), '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000003', 'Entrevista IA', '/notas/audio', 'AUDIO', 'Audio con expertos en IA.', now(), '00000000-0000-0000-0000-000000000003'),
    ('10000000-0000-0000-0000-000000000004', 'Aplicaciones de la IA', '/notas/apps', 'TEXT', 'Usos prácticos de la IA.', now(), null)
ON CONFLICT (id) DO NOTHING;

-- Tags
INSERT INTO note_tags (note_id, tag_name) VALUES
    ('10000000-0000-0000-0000-000000000001', 'inteligencia artificial'),
    ('10000000-0000-0000-0000-000000000001', 'introducción'),
    ('10000000-0000-0000-0000-000000000002', 'redes neuronales'),
    ('10000000-0000-0000-0000-000000000002', 'paper'),
    ('10000000-0000-0000-0000-000000000003', 'audio'),
    ('10000000-0000-0000-0000-000000000003', 'entrevista'),
    ('10000000-0000-0000-0000-000000000004', 'aplicaciones'),
    ('10000000-0000-0000-0000-000000000004', 'inteligencia artificial')
ON CONFLICT (note_id, tag_name) DO NOTHING;

-- Relaciones
INSERT INTO relations (id, note_a, note_b, score, validated)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 0.9, true),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 0.7, false)
ON CONFLICT (id) DO NOTHING;