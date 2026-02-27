-- =========================================================
--  Brain-RepTrack – PostgreSQL schema
--  Tables: inbox_items, notes, tags, note_tags, relations
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ---------------------------------------------------------
-- inbox_items
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS inbox_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_text        TEXT        NOT NULL,
    detected_type   VARCHAR(64),
    status          VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    proposals_json  TEXT,
    final_json      TEXT,
    output_path     VARCHAR(512),
    created_at      TIMESTAMP   NOT NULL DEFAULT now(),
    processed_at    TIMESTAMP
);

-- ---------------------------------------------------------
-- notes
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    path            VARCHAR(512),
    type            VARCHAR(64),
    summary         TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    inbox_item_id   UUID         REFERENCES inbox_items(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- note_tags  (note <-> tag_name directly, no separate tags table)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS note_tags (
    note_id  UUID         NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_name VARCHAR(128) NOT NULL,
    PRIMARY KEY (note_id, tag_name)
);

-- ---------------------------------------------------------
-- relations  (note_a → note_b with a score)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS relations (
    id        UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    note_a    UUID             NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    note_b    UUID             NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    score     DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    validated BOOLEAN          NOT NULL DEFAULT FALSE
);

