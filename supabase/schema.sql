-- SkillBridge Supabase PostgreSQL Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Analyses table for skill-gap evaluations
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name TEXT,
    target_role TEXT,
    match_score INT,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    roadmap JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Saved jobs table for bookmarked career opportunities
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for fast querying
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs (user_id);
