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
    processed_at    TIMESTAMP
);
-- Recreate constraint idempotently (works on both fresh installs and upgrades)
ALTER TABLE inbox_items DROP CONSTRAINT IF EXISTS status_check;
ALTER TABLE inbox_items ADD CONSTRAINT status_check
    CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'AWAITING_APPROVAL', 'REJECTED', 'ARCHIVED'))
    NOT VALID;

-- Add unified-capture columns (safe no-op on fresh installs)
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS source_url   VARCHAR(2048);
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS metadata     TEXT;

-- Extensive AI-generated summary of the topic
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS ai_summary   TEXT;

-- Path to the original uploaded file (for FILE-type items)
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS file_path    VARCHAR(512);

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
    confidence_score DOUBLE PRECISION,
    CONSTRAINT fk_notes_inbox
        FOREIGN KEY (inbox_item_id)
        REFERENCES inbox_items(id)
        ON DELETE RESTRICT
);
-- Add confidence_score if the table already existed without it
ALTER TABLE notes ADD COLUMN IF NOT EXISTS confidence_score DOUBLE PRECISION;

-- Index to speed-up the high-confidence overlap check in AiProcessingServiceImpl
CREATE INDEX IF NOT EXISTS idx_notes_path_confidence ON notes (path, confidence_score);

-- =========================================================
--  TABLE: tags  (global tag registry with parent reference)
-- =========================================================
CREATE TABLE IF NOT EXISTS tags (
    name        VARCHAR(128) PRIMARY KEY,
    parent_name VARCHAR(128),
    CONSTRAINT tag_name_not_empty CHECK (trim(name) <> ''),
    CONSTRAINT fk_tag_parent
        FOREIGN KEY (parent_name)
        REFERENCES tags(name)
        ON DELETE SET NULL
);

-- =========================================================
--  TABLE: note_tags
-- =========================================================
CREATE TABLE IF NOT EXISTS note_tags (
    note_id          UUID NOT NULL,
    tag_name         VARCHAR(128) NOT NULL,
    confidence_level DOUBLE PRECISION,

    PRIMARY KEY (note_id, tag_name),

    CONSTRAINT fk_note_tags_note
        FOREIGN KEY (note_id)
        REFERENCES notes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_note_tags_tag
        FOREIGN KEY (tag_name)
        REFERENCES tags(name)
        ON DELETE RESTRICT
);
-- Add confidence_level if the table already existed without it
ALTER TABLE note_tags ADD COLUMN IF NOT EXISTS confidence_level DOUBLE PRECISION;
-- Backfill any note_tags rows whose tag_name is missing from the tags registry
-- (can happen on existing DBs created before the FK was added)
INSERT INTO tags (name, parent_name)
    SELECT DISTINCT tag_name, NULL
    FROM note_tags
    WHERE tag_name NOT IN (SELECT name FROM tags)
ON CONFLICT (name) DO NOTHING;
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
--  TABLE: users
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(64)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(128),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    last_login      TIMESTAMP,
    CONSTRAINT username_not_empty CHECK (trim(username) <> ''),
    CONSTRAINT email_not_empty    CHECK (trim(email) <> '')
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);

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

-- Tags (registry must be populated before note_tags FK inserts)
INSERT INTO tags (name, parent_name) VALUES
    ('inteligencia artificial', NULL),
    ('introducción', NULL),
    ('redes neuronales', NULL),
    ('paper', NULL),
    ('audio', NULL),
    ('entrevista', NULL),
    ('aplicaciones', NULL)
ON CONFLICT (name) DO NOTHING;

-- Note-Tag associations
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