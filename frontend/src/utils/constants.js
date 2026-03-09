export const CREDIT_COSTS = {
  SWAP_MODEL: 1,
  IMAGE_GEN: 1,
  VIDEO_GEN: 5,
  BULK_PER_IMAGE: 1,
};

export const JOB_TYPES = {
  SWAP_MODEL: 'swap_model',
  IMAGE_GEN: 'image_gen',
  VIDEO_GEN: 'video_gen',
  BULK: 'bulk',
};

export const JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'superadmin',
  COMPANY_ADMIN: 'company_admin',
  USER: 'user',
};

export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const AVATAR_GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const AVATAR_ETHNICITIES = [
  { value: 'european', label: 'European' },
  { value: 'american', label: 'American' },
  { value: 'asian', label: 'Asian' },
  { value: 'african', label: 'African' },
];

export const SUBSCRIPTION_PLANS = {
  BASIC: { id: 'basic', name: 'Basic', price: 49, credits: 100, users: 1 },
  PREMIUM: { id: 'premium', name: 'Premium', price: 199, credits: 500, users: 5 },
  ENTERPRISE: { id: 'enterprise', name: 'Enterprise', price: null, credits: null, users: null },
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  // Users
  ME: '/api/users/me',
  USERS: '/api/users',
  // Companies
  COMPANIES: '/api/companies',
  // Avatars
  AVATARS: '/api/avatars',
  // Jobs
  JOBS: '/api/jobs',
  // Generate
  GENERATE_SWAP: '/api/generate/swap-model',
  GENERATE_IMAGE: '/api/generate/image',
  GENERATE_VIDEO: '/api/generate/video',
  GENERATE_BULK: '/api/generate/bulk',
  GENERATE_UPLOAD: '/api/generate/upload',
  // Credits
  CREDITS_BALANCE: '/api/credits/balance',
  CREDITS_TRANSACTIONS: '/api/credits/transactions',
  CREDITS_ALLOCATE: '/api/credits/allocate',
  // Payments
  PAYMENT_CHECKOUT: '/api/payments/create-checkout',
  PAYMENT_WEBHOOK: '/api/payments/webhook',
  PAYMENT_SUBSCRIPTION: '/api/payments/subscription',
};

export const CREDIT_WARNING_THRESHOLD = 10;

export const MAX_UPLOAD_SIZE_MB = 100 * 1024; // 100 GB in MB
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export const OUTPUT_RESOLUTION = {
  PORTRAIT: { width: 2730, height: 4096 },
};
