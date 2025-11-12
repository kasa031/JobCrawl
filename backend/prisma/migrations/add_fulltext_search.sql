-- Full-text search migration for job_listings.description
-- This creates a GIN index for fast full-text search on Norwegian text
-- Run this migration manually: psql -d jobcrawl -f add_fulltext_search.sql

-- Create GIN index for full-text search on description
CREATE INDEX IF NOT EXISTS idx_job_listings_description_fts 
ON job_listings 
USING gin(to_tsvector('norwegian', description));

-- Optional: Create index for title as well (for better search performance)
CREATE INDEX IF NOT EXISTS idx_job_listings_title_fts 
ON job_listings 
USING gin(to_tsvector('norwegian', title));

-- Optional: Create combined index for title and description
CREATE INDEX IF NOT EXISTS idx_job_listings_title_description_fts 
ON job_listings 
USING gin(to_tsvector('norwegian', title || ' ' || COALESCE(description, '')));

-- Verify indexes were created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'job_listings' 
AND indexname LIKE '%_fts';
