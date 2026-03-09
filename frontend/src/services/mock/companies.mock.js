// Mock companies data — used as initial state in companyStore
// Real data is fetched from API after login
export const MOCK_COMPANIES = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    name: 'Lumière Fashion',
    slug: 'lumiere-fashion',
    subscription_plan: 'premium',
    credit_balance: 287,
    max_users: 5,
    is_active: true,
  },
  {
    id: 'c0000001-0000-0000-0000-000000000002',
    name: 'Studio Nova',
    slug: 'studio-nova',
    subscription_plan: 'basic',
    credit_balance: 95,
    max_users: 1,
    is_active: true,
  },
  {
    id: 'c0000001-0000-0000-0000-000000000003',
    name: 'Apex Atelier',
    slug: 'apex-atelier',
    subscription_plan: 'enterprise',
    credit_balance: 1240,
    max_users: 20,
    is_active: true,
  },
];
