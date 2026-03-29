-- Kinship Database Schema v1.0
-- Generated from spec: 2026-03-28-kinship-design-v2.md

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- PERSONS TABLE
-- ============================================================
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Identity
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  photo_url TEXT,
  
  -- Contact Info (JSONB for flexibility)
  emails JSONB DEFAULT '[]',
  phones JSONB DEFAULT '[]',
  addresses JSONB DEFAULT '[]',
  
  -- Professional Context
  current_company TEXT,
  current_role TEXT,
  industry TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  website TEXT,
  
  -- Personal Context
  birthday DATE,
  interests JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  
  -- Origin Story
  how_we_met TEXT,
  met_date DATE,
  introduced_by UUID REFERENCES persons(id) ON DELETE SET NULL,
  
  -- AI/Semantic
  notes TEXT,
  embedding VECTOR(1536),
  embedding_stale BOOLEAN DEFAULT false,
  
  -- Relationship Tier
  warmth_tier TEXT CHECK (warmth_tier IN (
    'stranger', 'acquaintance', 'contact', 'colleague', 
    'friend', 'close_friend', 'inner_circle'
  )) DEFAULT 'contact',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY persons_select ON persons FOR SELECT USING (user_id = auth.uid());
CREATE POLICY persons_insert ON persons FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY persons_update ON persons FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY persons_delete ON persons FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- ORGANIZATIONS TABLE
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('company', 'nonprofit', 'group', 'institution', 'other')),
  industry TEXT,
  website TEXT,
  linkedin_url TEXT,
  description TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY organizations_all ON organizations 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- PERSON <-> ORGANIZATION JOIN TABLE
-- ============================================================
CREATE TABLE person_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT,
  department TEXT,
  started_at DATE,
  ended_at DATE,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE person_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY person_organizations_all ON person_organizations 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- INTERACTIONS TABLE
-- ============================================================
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('meeting', 'call', 'email', 'message', 'event', 'other')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound', 'mutual')),
  channel TEXT,
  
  occurred_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  
  subject TEXT,
  summary TEXT,
  notes TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  
  external_id TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY interactions_all ON interactions 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- LIFE EVENTS TABLE
-- ============================================================
CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN (
    'job_change', 'promotion', 'birthday', 'wedding', 'baby', 
    'move', 'death', 'graduation', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  occurred_at DATE,
  
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY life_events_all ON life_events 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- RELATIONSHIPS TABLE (Graph Edges)
-- ============================================================
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  from_person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  to_person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN (
    'colleague', 'manager', 'report', 'mentor', 'mentee', 
    'client', 'vendor', 'investor', 'advisor', 'partner',
    'friend', 'close_friend', 'family', 'spouse', 'parent', 
    'child', 'sibling', 'acquaintance',
    'introduced_by', 'introduced_to', 'referred_by', 'referred_to',
    'other'
  )),
  subtype TEXT,
  
  strength INT CHECK (strength BETWEEN 1 AND 10),
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'rarely')),
  
  context TEXT,
  started_at DATE,
  ended_at DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(from_person_id, to_person_id, type),
  CONSTRAINT chk_no_self_relationship CHECK (from_person_id != to_person_id)
);

ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationships_all ON relationships 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- CONTEXTS TABLE (Tags/Groups)
-- ============================================================
CREATE TABLE contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contexts_all ON contexts 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE person_contexts (
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  context_id UUID REFERENCES contexts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  PRIMARY KEY (person_id, context_id)
);

ALTER TABLE person_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY person_contexts_all ON person_contexts 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================

-- Vector indexes (HNSW for semantic search)
CREATE INDEX idx_persons_embedding ON persons 
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_organizations_embedding ON organizations 
  USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_interactions_embedding ON interactions 
  USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_life_events_embedding ON life_events 
  USING hnsw (embedding vector_cosine_ops);

-- FK indexes
CREATE INDEX idx_relationships_from ON relationships(from_person_id);
CREATE INDEX idx_relationships_to ON relationships(to_person_id);
CREATE INDEX idx_interactions_person ON interactions(person_id, occurred_at DESC);
CREATE INDEX idx_life_events_person ON life_events(person_id);
CREATE INDEX idx_person_orgs_person ON person_organizations(person_id);
CREATE INDEX idx_person_orgs_org ON person_organizations(organization_id);

-- Query-pattern indexes
CREATE INDEX idx_persons_active ON persons(id) WHERE archived_at IS NULL;
CREATE INDEX idx_persons_followup_due ON persons(next_followup_at) 
  WHERE next_followup_at IS NOT NULL AND archived_at IS NULL;
CREATE INDEX idx_persons_last_contact ON persons(last_contact_at);

-- Text search
CREATE INDEX idx_persons_name_trgm ON persons USING gin(full_name gin_trgm_ops);

-- JSONB indexes
CREATE INDEX idx_persons_emails ON persons USING gin(emails jsonb_path_ops);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_persons_updated BEFORE UPDATE ON persons 
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER set_organizations_updated BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER set_relationships_updated BEFORE UPDATE ON relationships 
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- Mark embedding stale on relevant field changes
CREATE OR REPLACE FUNCTION trg_mark_embedding_stale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_name IS DISTINCT FROM OLD.full_name OR
     NEW.notes IS DISTINCT FROM OLD.notes OR
     NEW.current_company IS DISTINCT FROM OLD.current_company OR
     NEW.current_role IS DISTINCT FROM OLD.current_role THEN
    NEW.embedding_stale = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_person_embedding_stale BEFORE UPDATE ON persons 
  FOR EACH ROW EXECUTE FUNCTION trg_mark_embedding_stale();
