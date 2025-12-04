-- Create users table for wallet management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(88) UNIQUE NOT NULL,
  email VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table for plan management
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'monthly', 'yearly')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'pending')),
  price_usd DECIMAL(10, 2),
  billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create payments table for transaction tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  token_type VARCHAR(50) NOT NULL CHECK (token_type IN ('sol', 'usdt', 'usdc')),
  token_amount DECIMAL(20, 8) NOT NULL,
  transaction_hash VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create api_keys table for authentication
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create wallet_searches table for tracking and analytics
CREATE TABLE IF NOT EXISTS wallet_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address VARCHAR(88) NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Allow public insert for signup" ON users
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for api_keys
CREATE POLICY "Users can view own api keys" ON api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create api keys" ON api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete api keys" ON api_keys
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for wallet_searches
CREATE POLICY "Users can view own searches" ON wallet_searches
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create searches" ON wallet_searches
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_hash ON payments(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_wallet_searches_address ON wallet_searches(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_searches_user ON wallet_searches(user_id);
