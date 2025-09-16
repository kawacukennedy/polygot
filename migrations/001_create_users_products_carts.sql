CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, display_name VARCHAR(100), created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT, price_cents INT NOT NULL, currency CHAR(3) DEFAULT 'USD', stock INT DEFAULT 0, image_url TEXT, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS carts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id VARCHAR(255) UNIQUE NOT NULL, items JSONB DEFAULT '[]'::jsonb, updated_at TIMESTAMPTZ DEFAULT now());