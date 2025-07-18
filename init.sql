-- TradingBoard Database Initialization
-- This script creates the necessary tables for the TradingBoard application

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbols TEXT[] NOT NULL DEFAULT '{}',
    pinned_symbols TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_default BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlists_created_at ON watchlists(created_at);
CREATE INDEX IF NOT EXISTS idx_watchlists_updated_at ON watchlists(updated_at);
CREATE INDEX IF NOT EXISTS idx_watchlists_is_default ON watchlists(is_default);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_watchlists_updated_at
    BEFORE UPDATE ON watchlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default watchlists
INSERT INTO watchlists (id, name, symbols, pinned_symbols, is_default) VALUES
    ('default', 'My Watchlist', ARRAY['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'], ARRAY['AAPL'], true),
    ('volatility', 'High Volatility', ARRAY['GME', 'AMC', 'PLTR', 'ROKU'], ARRAY[]::TEXT[], false)
ON CONFLICT (id) DO NOTHING;

-- Future tables can be added here as the application grows
-- For example: alerts, user_preferences, trade_history, etc.

-- Create alerts table for future use
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) NOT NULL,
    condition VARCHAR(10) NOT NULL CHECK (condition IN ('above', 'below')),
    price DECIMAL(10, 2) NOT NULL,
    alert_type VARCHAR(10) NOT NULL CHECK (alert_type IN ('price', 'volume')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at); 