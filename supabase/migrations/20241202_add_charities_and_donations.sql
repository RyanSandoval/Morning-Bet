-- Migration: Add charities and donations tables for charity integration
-- Created: 2024-12-02

-- Create charities table
CREATE TABLE IF NOT EXISTS charities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('political_left', 'political_right', 'environmental', 'sports', 'social', 'religious', 'other')),
    logo_url TEXT,
    website_url TEXT,
    ein TEXT, -- Tax ID for verification
    stripe_connect_account_id TEXT, -- Stripe Connect account for transfers
    is_active BOOLEAN DEFAULT TRUE,
    is_controversial BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    bet_id INTEGER NOT NULL REFERENCES bets(id),
    charity_id INTEGER NOT NULL REFERENCES charities(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL, -- in cents
    stripe_transfer_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add charity_id column to bets table
ALTER TABLE bets ADD COLUMN IF NOT EXISTS charity_id INTEGER REFERENCES charities(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_charities_category ON charities(category);
CREATE INDEX IF NOT EXISTS idx_charities_is_active ON charities(is_active);
CREATE INDEX IF NOT EXISTS idx_bets_charity_id ON bets(charity_id);
CREATE INDEX IF NOT EXISTS idx_donations_bet_id ON donations(bet_id);
CREATE INDEX IF NOT EXISTS idx_donations_charity_id ON donations(charity_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);

-- Seed initial charity data
INSERT INTO charities (name, description, category, website_url, ein, is_active, is_controversial) VALUES
    ('Planned Parenthood', 'Reproductive health care organization providing services including birth control, STI testing, and abortion care.', 'political_left', 'https://www.plannedparenthood.org', '13-1644147', TRUE, TRUE),
    ('ACLU', 'American Civil Liberties Union - defends individual rights and liberties guaranteed by the Constitution.', 'political_left', 'https://www.aclu.org', '13-6213516', TRUE, TRUE),
    ('Human Rights Campaign', 'LGBTQ+ civil rights advocacy organization and political lobbying group.', 'political_left', 'https://www.hrc.org', '52-1481896', TRUE, TRUE),
    ('NRA Foundation', 'National Rifle Association educational foundation supporting firearms safety and marksmanship programs.', 'political_right', 'https://www.nrafoundation.org', '52-1710886', TRUE, TRUE),
    ('Heritage Foundation', 'Conservative think tank promoting free enterprise, limited government, and traditional values.', 'political_right', 'https://www.heritage.org', '23-7327730', TRUE, TRUE),
    ('Turning Point USA', 'Conservative nonprofit promoting principles of freedom, free markets, and limited government on campuses.', 'political_right', 'https://www.tpusa.com', '80-0948168', TRUE, TRUE),
    ('Sierra Club Foundation', 'Environmental organization focused on conservation and climate advocacy.', 'environmental', 'https://www.sierraclub.org', '94-6069890', TRUE, FALSE),
    ('American Petroleum Institute', 'National trade association representing the oil and natural gas industry.', 'environmental', 'https://www.api.org', '13-0433430', TRUE, TRUE),
    ('New York Yankees Foundation', 'Charitable arm of the New York Yankees baseball team.', 'sports', 'https://www.mlb.com/yankees/community/foundation', '13-3964603', TRUE, TRUE),
    ('Boston Red Sox Foundation', 'Charitable foundation of the Boston Red Sox baseball team.', 'sports', 'https://www.mlb.com/redsox/community/foundation', '04-3558003', TRUE, TRUE),
    ('Dallas Cowboys Foundation', 'Charitable arm of the Dallas Cowboys football team.', 'sports', 'https://www.dallascowboys.com/community', '75-2745089', TRUE, TRUE),
    ('Philadelphia Eagles Foundation', 'Charitable foundation of the Philadelphia Eagles football team.', 'sports', 'https://www.philadelphiaeagles.com/community', '23-2944915', TRUE, TRUE),
    ('PETA', 'People for the Ethical Treatment of Animals - animal rights organization.', 'social', 'https://www.peta.org', '52-1218336', TRUE, TRUE),
    ('Salvation Army', 'International charitable organization providing social services and disaster relief.', 'social', 'https://www.salvationarmyusa.org', '58-0660607', TRUE, FALSE),
    ('Focus on the Family', 'Christian conservative organization promoting traditional family values.', 'religious', 'https://www.focusonthefamily.com', '84-0694733', TRUE, TRUE),
    ('Freedom From Religion Foundation', 'Nonprofit promoting separation of church and state and advocating for nontheists.', 'religious', 'https://ffrf.org', '39-1302520', TRUE, TRUE),
    ('Flat Earth Society', 'Organization promoting the belief that the Earth is flat.', 'other', 'https://www.tfes.org', NULL, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for charities (public read access)
CREATE POLICY "Charities are viewable by everyone" ON charities
    FOR SELECT USING (is_active = TRUE);

-- Create RLS policies for donations (users can only see their own donations)
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can insert donations" ON donations
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service role can update donations" ON donations
    FOR UPDATE USING (TRUE);
