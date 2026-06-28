-- Run this once to create the database and table
-- Step 1: Run this as superuser in psql or pgAdmin
-- psql -U postgres -f schema.sql

CREATE DATABASE cardio_ai;

-- Step 2: Connect to the new database
\c cardio_ai

CREATE TABLE IF NOT EXISTS patients (
    id              SERIAL PRIMARY KEY,                          -- replaces INT AUTO_INCREMENT

    -- Identity
    name            VARCHAR(120)    NOT NULL,

    -- Demographics
    age             FLOAT,
    gender          VARCHAR(10),
    height          FLOAT,
    weight          FLOAT,
    bmi             FLOAT,

    -- Vitals
    ap_hi           FLOAT,
    ap_lo           FLOAT,

    -- Labs (raw mg/dL)
    cholesterol     FLOAT,
    glucose         FLOAT,

    -- Derived categories
    chol_category   VARCHAR(30),
    gluc_category   VARCHAR(30),

    -- Lifestyle flags
    smoke           BOOLEAN,
    alco            BOOLEAN,
    active          BOOLEAN,

    -- Prediction results
    stage1_risk     FLOAT,
    stage2_risk     FLOAT,
    high_risk       BOOLEAN,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- replaces DATETIME
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP         -- replaces DATETIME
);

-- Indexes (PostgreSQL uses CREATE INDEX, not inline INDEX)
CREATE INDEX IF NOT EXISTS idx_name        ON patients (name);
CREATE INDEX IF NOT EXISTS idx_high_risk   ON patients (high_risk);
CREATE INDEX IF NOT EXISTS idx_updated_at  ON patients (updated_at);

-- Auto-update updated_at on row change (PostgreSQL needs a trigger for this)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();