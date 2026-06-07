Build a complete full-stack SaaS API Gateway platform called "jzgateway".
Tech: React + Vite + Tailwind (frontend), Hono + Node.js (backend), PostgreSQL + Redis + BullMQ.
Mobile-first, fully responsive. Dark mode default with light mode toggle.

=== DESIGN SYSTEM ===
- Font: Inter (Google Fonts)
- Style: Modern dark SaaS — Linear, Vercel, Raycast aesthetic
- Primary accent: Indigo/violet (#6366f1)
- Background: #0a0a0f, surface: #111118, border: #1e1e2e
- Radius: 12px cards, 8px inputs/buttons
- Icons: Lucide React
- Animations: Framer Motion
- Forms: React Hook Form + Zod
- Data fetching: TanStack Query
- Global state: Zustand
- Charts: Recharts

=== FULL PROJECT STRUCTURE ===

goldbridge/
├── frontend/                          # React + Vite
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                    # Router setup, QueryClient, theme provider
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                    # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx          # Backdrop blur, escape to close, focus trap
│   │   │   │   ├── SlideOver.tsx      # Right panel, swipe dismiss on mobile
│   │   │   │   ├── Toast.tsx          # Top-right, auto-dismiss, success/error/info
│   │   │   │   ├── ConfirmDialog.tsx  # Destructive action confirmation
│   │   │   │   ├── Badge.tsx          # Status badges with variants
│   │   │   │   ├── Skeleton.tsx       # Loading placeholders
│   │   │   │   ├── CopyButton.tsx     # Clipboard copy + checkmark animation
│   │   │   │   ├── MaskedKey.tsx      # Shows last 6 chars, reveal on hover
│   │   │   │   ├── JsonViewer.tsx     # Collapsible syntax-highlighted JSON
│   │   │   │   ├── EmptyState.tsx     # Empty tables/lists with CTA
│   │   │   │   └── Tabs.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx       # Sidebar + topbar wrapper
│   │   │   │   ├── Sidebar.tsx        # Collapsible, icon-only on tablet
│   │   │   │   ├── BottomNav.tsx      # Mobile bottom tab bar (<768px)
│   │   │   │   ├── Topbar.tsx         # Breadcrumb + user avatar dropdown
│   │   │   │   └── PageWrapper.tsx    # Fade+slide page transition wrapper
│   │   │   └── charts/
│   │   │       ├── UsageLineChart.tsx
│   │   │       ├── EndpointBarChart.tsx
│   │   │       └── SuccessDonutChart.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Overview.tsx
│   │   │   │   ├── ApiKeys.tsx
│   │   │   │   ├── Credentials.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── Webhooks.tsx
│   │   │   │   ├── Usage.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── Docs.tsx               # API documentation page
│   │   │   └── NotFound.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # Auth state + login/logout/register
│   │   │   ├── useApiKeys.ts          # CRUD for API keys
│   │   │   ├── useCredentials.ts      # CRUD for MooGold credentials
│   │   │   ├── useOrders.ts           # Fetch + filter orders
│   │   │   ├── useWebhooks.ts         # Webhook management
│   │   │   └── useUsage.ts            # Usage stats + charts data
│   │   ├── stores/
│   │   │   ├── authStore.ts           # Zustand: user, token, isAuthenticated
│   │   │   ├── uiStore.ts             # Zustand: sidebar open, theme, toast queue
│   │   │   └── orderStore.ts          # Zustand: active filters, selected order
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios instance, interceptors, token refresh
│   │   │   ├── queryKeys.ts           # TanStack Query key factory
│   │   │   └── utils.ts               # cn(), formatDate(), formatNumber(), truncate()
│   │   ├── types/
│   │   │   ├── api.types.ts           # All API request/response types
│   │   │   ├── order.types.ts
│   │   │   └── user.types.ts
│   │   └── constants/
│   │       ├── routes.ts
│   │       └── moogold.ts             # MooGold status codes, error map
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                           # Hono + Node.js
│   ├── src/
│   │   ├── index.ts                   # Hono app entry, middleware registration
│   │   ├── config/
│   │   │   ├── env.ts                 # Zod-validated env vars
│   │   │   ├── db.ts                  # PostgreSQL pool (pg / postgres.js)
│   │   │   └── redis.ts               # Redis client (ioredis)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verify, attach user to context
│   │   │   ├── apiKey.middleware.ts   # X-API-Key header → Redis lookup → user
│   │   │   ├── rateLimit.middleware.ts# Sliding window per user_id in Redis
│   │   │   ├── ipAllowlist.middleware.ts # Per-user IP lock check
│   │   │   └── logger.middleware.ts   # Request logging
│   │   ├── routes/
│   │   │   ├── auth.routes.ts         # POST /auth/register, /auth/login, /auth/refresh
│   │   │   ├── apiKeys.routes.ts      # GET/POST/DELETE /api-keys
│   │   │   ├── credentials.routes.ts  # GET/POST/PUT/DELETE /credentials
│   │   │   ├── orders.routes.ts       # GET /orders, GET /orders/:id
│   │   │   ├── webhooks.routes.ts     # GET/POST/PUT/DELETE /webhooks, GET /webhooks/logs
│   │   │   ├── usage.routes.ts        # GET /usage/stats, /usage/chart
│   │   │   ├── gateway.routes.ts      # POST /v1/* — the actual proxy endpoints
│   │   │   └── moogold.routes.ts      # Webhook receiver from MooGold callbacks
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Register, login, token generation, bcrypt
│   │   │   ├── apiKey.service.ts      # Generate key, hash, store, revoke
│   │   │   ├── credential.service.ts  # AES-256 encrypt/decrypt secret keys
│   │   │   ├── order.service.ts       # Create, update status, log timeline
│   │   │   ├── webhook.service.ts     # Deliver payload, sign, retry logic
│   │   │   ├── usage.service.ts       # Aggregate stats from Redis counters
│   │   │   └── moogold.service.ts     # Build signed requests to MooGold API
│   │   ├── workers/
│   │   │   ├── orderWorker.ts         # BullMQ worker: process order jobs
│   │   │   └── webhookWorker.ts       # BullMQ worker: deliver webhook payloads
│   │   ├── queues/
│   │   │   ├── orderQueue.ts          # BullMQ queue definition + job types
│   │   │   └── webhookQueue.ts
│   │   ├── db/
│   │   │   ├── schema.sql             # Full PostgreSQL schema
│   │   │   ├── migrations/            # Numbered migration files
│   │   │   └── queries/               # Raw SQL query functions per domain
│   │   │       ├── users.queries.ts
│   │   │       ├── apiKeys.queries.ts
│   │   │       ├── credentials.queries.ts
│   │   │       ├── orders.queries.ts
│   │   │       └── webhooks.queries.ts
│   │   ├── lib/
│   │   │   ├── crypto.ts              # AES-256-GCM encrypt/decrypt
│   │   │   ├── moogoldSigner.ts       # HMAC-SHA256 signature builder
│   │   │   ├── keyGenerator.ts        # mg_live_<32 hex> key generation
│   │   │   └── errors.ts              # Custom error classes + Hono error handler
│   │   └── types/
│   │       ├── hono.types.ts          # Hono context variable types
│   │       └── queue.types.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml                 # PostgreSQL + Redis + app containers
├── .env.example
└── README.md

=== DATABASE SCHEMA (PostgreSQL) ===

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (platform keys given to users)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(64) UNIQUE NOT NULL,     -- SHA-256 hash of raw key
  key_prefix VARCHAR(16) NOT NULL,          -- mg_live_ + first 8 chars (for display)
  environment VARCHAR(10) DEFAULT 'production' CHECK (environment IN ('uat','production')),
  ip_allowlist TEXT[],                       -- NULL = allow all
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MooGold Credentials (one user can have multiple)
CREATE TABLE moogold_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  partner_id VARCHAR(100) NOT NULL,
  encrypted_secret TEXT NOT NULL,            -- AES-256-GCM encrypted
  encryption_iv TEXT NOT NULL,               -- IV for decryption
  environment VARCHAR(10) DEFAULT 'production' CHECK (environment IN ('uat','production')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  api_key_id UUID REFERENCES api_keys(id),
  credential_id UUID REFERENCES moogold_credentials(id),
  partner_order_id VARCHAR(100),             -- user-supplied idempotency key
  moogold_order_id VARCHAR(100),             -- returned by MooGold
  product_id VARCHAR(100) NOT NULL,
  category_id VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  amount DECIMAL(10,2),
  status VARCHAR(30) DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','refunded','incorrect-details','failed')),
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  error_code VARCHAR(10),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order timeline (status history)
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  message TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  signing_secret VARCHAR(64) NOT NULL,       -- used to HMAC sign deliveries
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook delivery logs
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  event_type VARCHAR(50) NOT NULL,           -- order.completed, order.refunded, etc.
  payload JSONB NOT NULL,
  http_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt_count INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage counters (supplemented by Redis for real-time)
CREATE TABLE usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id),
  date DATE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  UNIQUE(user_id, api_key_id, date)
);

-- Indexes
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_partner_order_id ON orders(partner_order_id);
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_usage_daily_user_date ON usage_daily(user_id, date DESC);

=== BACKEND API — ALL ENDPOINTS ===

--- AUTH ---
POST   /api/auth/register
  Body: { name, email, password }
  Returns: { user, accessToken, refreshToken }

POST   /api/auth/login
  Body: { email, password }
  Returns: { user, accessToken, refreshToken }

POST   /api/auth/refresh
  Body: { refreshToken }
  Returns: { accessToken }

POST   /api/auth/logout
  Body: { refreshToken }
  Returns: 204

GET    /api/auth/me
  Header: Authorization: Bearer <token>
  Returns: { user }

--- API KEYS ---
GET    /api/api-keys
  Returns: { keys: ApiKey[] }

POST   /api/api-keys
  Body: { name, environment, ipAllowlist? }
  Returns: { key: ApiKey, rawKey: string }  ← raw key shown ONCE

DELETE /api/api-keys/:id
  Returns: 204

PATCH  /api/api-keys/:id/revoke
  Returns: { key: ApiKey }

--- CREDENTIALS ---
GET    /api/credentials
  Returns: { credentials: Credential[] }

POST   /api/credentials
  Body: { label, partnerId, secretKey, environment }
  Returns: { credential: Credential }

PUT    /api/credentials/:id
  Body: { label, partnerId, secretKey?, environment }
  Returns: { credential: Credential }

DELETE /api/credentials/:id
  Returns: 204

POST   /api/credentials/:id/test
  Returns: { success: boolean, message: string, latencyMs: number }

PATCH  /api/credentials/:id/set-default
  Returns: { credential: Credential }

--- ORDERS ---
GET    /api/orders
  Query: ?status=&search=&from=&to=&page=&limit=
  Returns: { orders: Order[], total, page, limit }

GET    /api/orders/:id
  Returns: { order: Order, events: OrderEvent[] }

--- WEBHOOKS ---
GET    /api/webhooks
  Returns: { webhook: Webhook | null }

POST   /api/webhooks
  Body: { url }
  Returns: { webhook: Webhook, signingSecret: string }  ← secret shown ONCE

PUT    /api/webhooks/:id
  Body: { url, isActive }
  Returns: { webhook: Webhook }

DELETE /api/webhooks/:id
  Returns: 204

GET    /api/webhooks/:id/logs
  Query: ?page=&limit=
  Returns: { logs: WebhookLog[], total }

POST   /api/webhooks/logs/:logId/resend
  Returns: { success: boolean }

--- USAGE ---
GET    /api/usage/stats
  Query: ?period=7d|30d|90d
  Returns: { totalRequests, successRate, callsToday, activeKeys }

GET    /api/usage/chart
  Query: ?period=7d|30d|90d
  Returns: { daily: { date, requests, success, failed }[] }

GET    /api/usage/by-endpoint
  Query: ?period=7d|30d|90d
  Returns: { endpoints: { path, count }[] }

--- GATEWAY (the actual proxy — uses X-API-Key header, NOT JWT) ---

POST   /v1/order/create
  Header: X-API-Key: mg_live_...
  Body: {
    partner_order_id: string,   -- your idempotency key
    product_id: string,
    category_id: string,
    quantity: number,
    fields: object              -- product-specific fields (user_id, zone_id, etc.)
  }
  Returns: { jobId, orderId, status: "queued" }

GET    /v1/order/:orderId
  Header: X-API-Key: mg_live_...
  Returns: { order: Order }

GET    /v1/order/by-partner/:partnerOrderId
  Header: X-API-Key: mg_live_...
  Returns: { order: Order }

GET    /v1/products
  Header: X-API-Key: mg_live_...
  Query: ?category_id=
  Returns: { products: Product[] }

GET    /v1/products/:productId
  Header: X-API-Key: mg_live_...
  Returns: { product: Product }

GET    /v1/categories
  Header: X-API-Key: mg_live_...
  Returns: { categories: Category[] }

POST   /v1/webhook/moogold-callback          -- MooGold calls THIS to update order status
  Body: MooGold callback payload
  Returns: { status: "ok" }

=== MOOGOLD CREDENTIAL SERVICE — FULL IMPLEMENTATION ===

// moogoldSigner.ts
function buildMooGoldHeaders(
  payload: object,
  path: string,         // e.g. "order/create_order" — no leading slash
  partnerId: string,
  secretKey: string
): {
  Authorization: string   // Basic base64(partnerId:secretKey)
  auth: string            // HMAC-SHA256(payloadJSON + timestamp + path, secretKey)
  timestamp: string       // Unix timestamp as string
}

// moogold.service.ts
class MooGoldService {
  private baseUrl = "https://moogold.com/wp-json/v1/api"

  async createOrder(credential, body): Promise<MooGoldOrderResponse>
  async getOrder(credential, orderId): Promise<MooGoldOrderResponse>
  async getOrderByPartnerId(credential, partnerOrderId): Promise<MooGoldOrderResponse>
  async getProducts(credential, categoryId?): Promise<MooGoldProduct[]>
  async getProductDetail(credential, productId): Promise<MooGoldProduct>
  async getCategories(credential): Promise<MooGoldCategory[]>
  async getUserBalance(credential): Promise<{ balance: number }>

  private signRequest(payload, path, secretKey): headers
  private handleMooGoldError(errCode, errMessage): never
}

MooGold error code → message map (build exhaustively):
  "111" → "Insufficient balance"
  "113" → "Product ID missing"
  "114" → "Product out of stock"
  "117" → "Max quantity exceeded (limit: 10)"
  "118" → "Product is blocked"
  "403" → "Invalid credentials or unauthorized"
  "418" → "Incorrect API path"
  "419" → "Missing required arguments"
  "420" → "Duplicate partner order ID"
  "421" → "Partner order ID not found"
  "422" → "Product ID invalid or not authorized"
  "423" → "Category ID missing"
  "424" → "Invalid payment method"
  "425" → "Invalid amount"
  "426" → "Timestamp incorrect"
  "433" → "IP not allowed"
  "434" → "Rate limit exceeded"
  "435" → "Invalid status filter"
  "436" → "Start date after end date"
  "437" → "Date range exceeds 30 days"
  "1111" → "Endpoint restricted to members only"

=== CREDENTIAL ENCRYPTION ===

// crypto.ts — AES-256-GCM
function encrypt(plaintext: string, masterKey: string): { encrypted: string, iv: string }
function decrypt(encrypted: string, iv: string, masterKey: string): string

Master key from: process.env.CREDENTIAL_ENCRYPTION_KEY (32-byte hex)
Never log decrypted secrets. Never return secretKey in API responses — return "••••••••" only.

=== API KEY SECURITY ===

// keyGenerator.ts
function generateApiKey(): { rawKey: string, keyHash: string, keyPrefix: string }
  rawKey   = "mg_live_" + crypto.randomBytes(32).toString("hex")
  keyHash  = SHA-256(rawKey)           -- stored in DB
  keyPrefix = "mg_live_" + first8chars  -- shown in UI

Raw key is returned ONCE on creation. Never stored, only its hash.
Redis stores: keyHash → { userId, keyId, environment, ipAllowlist }
TTL: 5 minutes (refreshed on use). Falls back to DB on cache miss.

=== BULLMQ QUEUES ===

// Order queue job data:
{
  jobId: string,
  orderId: string,
  userId: string,
  credentialId: string,
  moogoldPath: "order/create_order",
  payload: object
}
Retry: 3 attempts, exponential backoff (2s, 8s, 32s)
On all retries failed → update order status to "failed", fire webhook

// Webhook queue job data:
{
  webhookId: string,
  orderId: string,
  eventType: "order.completed" | "order.refunded" | "order.failed" | "order.incorrect-details",
  payload: object
}
Retry: 10 attempts, 1 minute apart (mirrors MooGold's own retry behavior)
Sign payload: X-GoldBridge-Signature: HMAC-SHA256(JSON.stringify(payload), signingSecret)

=== FRONTEND DOCS PAGE (/docs) ===

Build a full interactive API documentation page (like Stripe Docs):
- Left sidebar: navigation between endpoint groups
  (Authentication, Orders, Products, Webhooks, Error Codes)
- Center: endpoint documentation with:
  * Method badge (POST/GET colored), full URL
  * Description
  * Request headers table
  * Request body parameters table (name, type, required, description)
  * Response schema table
  * Code examples tabbed by language: cURL, JavaScript (fetch), PHP, Python
- Right sidebar: live code example panel (dark themed)
- Error codes reference table: all MooGold codes + platform codes
- Authentication guide: step-by-step how to use X-API-Key
- Quickstart section: from register to first order in 5 steps

=== FRONTEND PAGES ===

1. LANDING (/)
- Navbar: logo, Features, Docs, Pricing, Login, Get Started
- Hero: "Your MooGold API. Everywhere."
  Animated terminal showing a real API request + response
- Features: 3 cards — Multi-account, Secure vault, Real-time tracking
- How it works: Register → Add credentials → Copy API key → Integrate
- Pricing: Free (1 key, 500 req/day) / Pro (10 keys, 50k req/day) / Enterprise (unlimited)
- Footer

2. AUTH (/login, /register) — centered card, brand logo

3. DASHBOARD OVERVIEW (/dashboard)
- Stats: Total Orders, Success Rate, API Calls Today, Active Keys (count-up animation)
- Recent orders table
- Usage sparkline (last 7 days, Recharts)

4. API KEYS (/dashboard/api-keys)
- Table with masked keys, status, last used
- Create modal → show raw key once with copy button + glow animation
- IP allowlist, environment toggle

5. CREDENTIALS (/dashboard/credentials)
- Cards per credential set
- Add/Edit modal with test connection button
- Default credential badge

6. ORDERS (/dashboard/orders)
- Filterable table → card stack on mobile
- Status badges: amber=processing (pulse), green=completed, red=refunded, orange=incorrect-details
- Row click → SlideOver with timeline + JSON viewer

7. WEBHOOKS (/dashboard/webhooks)
- Endpoint URL, signing secret (masked), enable/disable
- Delivery logs table with resend button

8. USAGE (/dashboard/usage)
- Date range selector
- Line chart, bar chart, donut chart (Recharts)
- Per-key rate limit progress bars

9. SETTINGS (/dashboard/settings)
- Tabs: Profile | Security | Notifications
- Change password, sessions, 2FA toggle (UI)

=== MOBILE UX ===
- Bottom tab bar on <768px (Overview, Orders, Keys, Settings)
- Tables → card stacks on mobile
- Modals → bottom sheets on mobile
- Min 44px touch targets

=== ENV VARIABLES (.env.example) ===

# Backend
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/goldbridge
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CREDENTIAL_ENCRYPTION_KEY=32_byte_hex_key_here
MOOGOLD_BASE_URL=https://moogold.com/wp-json/v1/api

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GATEWAY_BASE_URL=http://localhost:3000/v1

=== DOCKER COMPOSE ===

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: goldbridge
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    ports: ["3000:3000"]
    depends_on: [postgres, redis]
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [backend]

=== ADDITIONAL REQUIREMENTS ===
- All TypeScript, strict mode
- Zod validation on all API inputs (backend) and all forms (frontend)
- Error boundaries on each route
- Skeleton loaders on all async data
- Toast notifications for all actions
- Accessible: aria-labels, keyboard nav, focus rings
- 404 page
- README with setup instructions and architecture diagram