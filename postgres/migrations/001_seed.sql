-- ============================================================
-- AI FASHION STUDIO — Seed Data (Development Only)
-- Run AFTER schema.sql
-- ============================================================
-- Passwords below are all: Admin@123 / User@123

-- Companies
INSERT INTO companies (id, name, slug, subscription_plan, credit_balance, max_users) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Lumière Fashion',   'lumiere-fashion', 'premium',    287,  5),
  ('c0000001-0000-0000-0000-000000000002', 'Studio Nova',       'studio-nova',     'basic',       95,  1),
  ('c0000001-0000-0000-0000-000000000003', 'Apex Atelier',      'apex-atelier',    'enterprise', 1240, 20);

-- Users (password_hash is bcrypt of 'Admin@123' and 'User@123')
-- These are placeholder hashes — run `node -e "require('bcrypt').hash('Admin@123',12).then(console.log)"` to generate real ones
INSERT INTO users (id, company_id, email, password_hash, full_name, role, status) VALUES
  ('u0000001-0000-0000-0000-000000000001', NULL,
   'superadmin@test.com',
   '$2b$12$PLACEHOLDER_HASH_SUPER_ADMIN',
   'Super Admin', 'superadmin', 'approved'),

  ('u0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001',
   'admin@lumiere.com',
   '$2b$12$PLACEHOLDER_HASH_ADMIN',
   'Alice Admin', 'company_admin', 'approved'),

  ('u0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001',
   'user@lumiere.com',
   '$2b$12$PLACEHOLDER_HASH_USER',
   'Bob User', 'user', 'approved'),

  ('u0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002',
   'admin@studionova.com',
   '$2b$12$PLACEHOLDER_HASH_ADMIN',
   'David Admin', 'company_admin', 'approved'),

  ('u0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000003',
   'admin@apexatelier.com',
   '$2b$12$PLACEHOLDER_HASH_ADMIN',
   'Eva Admin', 'company_admin', 'approved');

-- Global Avatars
INSERT INTO avatars (company_id, name, gender, ethnicity, image_url, status, is_global) VALUES
  (NULL, 'Ava',     'female', 'european', '/assets/images/Ava.png',     'approved', true),
  (NULL, 'Lora',    'female', 'american', '/assets/images/Lora.png',    'approved', true),
  (NULL, 'Himari',  'female', 'asian',    '/assets/images/himari.png',  'approved', true),
  (NULL, 'Zola',    'female', 'african',  '/assets/images/zola.png',    'approved', true),
  (NULL, 'Henry',   'male',   'european', '/assets/images/henry.png',   'approved', true),
  (NULL, 'Mark',    'male',   'american', '/assets/images/mark.png',    'approved', true),
  (NULL, 'Seo-Jun', 'male',   'asian',    '/assets/images/seo-jun.png', 'approved', true),
  (NULL, 'Kwame',   'male',   'african',  '/assets/images/kwame.png',   'approved', true);
