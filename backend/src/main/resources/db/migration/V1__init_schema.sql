-- V1: Initial Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    picture_url TEXT,
    gmail_access_token TEXT,
    gmail_refresh_token TEXT,
    token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    category VARCHAR(100),
    merchant VARCHAR(255),
    description TEXT,
    transaction_date DATE NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'MANUAL', -- GMAIL | MANUAL
    raw_email_id VARCHAR(255), -- Gmail message ID (for dedup)
    type VARCHAR(10) NOT NULL, -- DEBIT | CREDIT
    account_type VARCHAR(20), -- BANK | CREDIT_CARD
    bank_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date);

CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_email_id ON transactions (user_id, raw_email_id)
WHERE
    raw_email_id IS NOT NULL;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user | assistant
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages (user_id);