# Spotify Clone API Routes & Database Schema

## API Routes

### 1. `/api/create-checkout-session`
- **Method:** POST
- **Description:** Creates a Stripe checkout session for a subscription.
- **Body:** `{ price, quantity, metadata }`
- **Response:** `{ sessionId }`

### 2. `/api/create-portal-link`
- **Method:** POST
- **Description:** Creates a Stripe billing portal session for the user.
- **Response:** `{ url }`

### 3. `/api/songs`
- **Method:** POST
- **Description:** Adds a new song with artist info.
- **Body:** `{ title, image_path, song_path, user_id, artist: { name, country } OR { artist_id } }`
- **Response:** Song creation result

### 4. `/api/users`
- **Method:** POST
- **Description:** Creates or updates a user profile.
- **Body:** `{ id, full_name, avatar_url }`
- **Response:** `{ success: true }` or error

### 5. `/api/webhooks`
- **Method:** POST
- **Description:** Handles Stripe webhook events for products, prices, and subscriptions.
- **Relevant Events:**
  - product.created, product.updated
  - price.created, price.updated
  - checkout.session.completed
  - customer.subscription.created, updated, deleted

---

## Database Schema

### Table: `artists`
- `artist_id` (PK)
- `name`
- `country`
- `created_at`
- `updated_at`

### Table: `artist_song`
- `id` (PK)
- `artist_id` (FK → artists.artist_id)
- `song_id` (FK → songs.id)
- `created_at`

### Table: `customers`
- `id` (PK, FK → users.id)
- `stripe_customer_id`

### Table: `liked_songs`
- `created_at`
- `song_id` (FK → songs.id)
- `user_id` (FK → users.id)

### Table: `prices`
- `id` (PK)
- `product_id` (FK → products.id)
- `unit_amount`
- `currency`
- `active`
- `type`
- `interval`
- `interval_count`
- `metadata`

### Table: `products`
- `id` (PK)
- `name`
- `description`
- `image`
- `metadata`
- `active`

### Table: `songs`
- `id` (PK)
- `title`
- `song_path`
- `image_path`
- `user_id` (FK → users.id)
- `created_at`

### Table: `subscriptions`
- `id` (PK)
- `user_id` (FK → users.id)
- `price_id` (FK → prices.id)
- `status`
- `created`
- `current_period_start`
- `current_period_end`
- `trial_start`
- `trial_end`
- `cancel_at`
- `cancel_at_period_end`
- `canceled_at`
- `ended_at`
- `metadata`
- `quantity`

### Table: `users`
- `id` (PK)
- `full_name`
- `avatar_url`
- `billing_address`
- `payment_method`

---

## Relationships
- **Primary Keys (PK):**
  - artists.artist_id
  - artist_song.id
  - customers.id
  - prices.id
  - products.id
  - songs.id
  - subscriptions.id
  - users.id
- **Foreign Keys (FK):**
  - artist_song.artist_id → artists.artist_id
  - artist_song.song_id → songs.id
  - customers.id → users.id
  - liked_songs.song_id → songs.id
  - liked_songs.user_id → users.id
  - prices.product_id → products.id
  - songs.user_id → users.id
  - subscriptions.price_id → prices.id
  - subscriptions.user_id → users.id

---

## Enum Types
- `pricing_plan_interval`: day, week, month, year
- `pricing_type`: one_time, recurring
- `subscription_status`: trialing, active, canceled, incomplete, incomplete_expired, past_due, unpaid

---

**This document summarizes all API routes and the database schema including relationships (PK, FK) for the Spotify Clone project.**
