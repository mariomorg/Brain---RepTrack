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
    path            VARCHAR(512) NOT NULL,
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