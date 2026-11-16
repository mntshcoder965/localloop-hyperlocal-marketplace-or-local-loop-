# LocalLoop REST API & WebSocket Specification

Base URL: `http://localhost:5000/api/v1`  
WebSocket URL: `ws://localhost:5000`

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Create a new user account.
- **Request Body**:
  ```json
  {
    "name": "Arjun Mehta",
    "email": "arjun@example.com",
    "password": "SecurePassword123!",
    "phone": "+919876543210",
    "role": "BUYER"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Account registered successfully",
    "data": {
      "user": { "id": "uuid", "name": "...", "email": "...", "role": "BUYER" },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### `POST /auth/login`
Authenticate user with email and password.
- **Request Body**:
  ```json
  {
    "email": "rahul.seller@gmail.com",
    "password": "MarketPass123!"
  }
  ```

### `POST /auth/refresh`
Rotate access & refresh tokens.
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```

### `GET /auth/me`
Retrieve currently authenticated user profile.
- **Headers**: `Authorization: Bearer <accessToken>`

---

## 2. Listings & Spatial Search (`/listings`)

### `GET /listings`
Hyperlocal search and discovery with PostGIS / Haversine spatial queries.
- **Query Parameters**:
  - `lat` *(float)*: Latitude (e.g. `12.9719`)
  - `lon` *(float)*: Longitude (e.g. `77.6412`)
  - `radiusKm` *(number)*: Proximity radius (`1`, `5`, `10`, `20`, `50`)
  - `q` *(string)*: Full-text search keyword
  - `category` *(string)*: Category slug (e.g. `laptops`, `mobiles`)
  - `condition` *(string)*: `LIKE_NEW`, `GOOD`, `FAIR`, `NEEDS_REPAIR`
  - `minPrice` / `maxPrice` *(number)*
  - `sort`: `newest`, `nearest`, `price_asc`, `price_desc`
  - `page` *(default 1)*, `limit` *(default 12)*
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "MacBook Pro 14-inch M2",
        "price": 92000,
        "original_price": 169900,
        "condition": "LIKE_NEW",
        "locality": "Indiranagar",
        "city": "Bengaluru",
        "pincode": "560038",
        "latitude": 12.97,
        "longitude": 77.64,
        "distance_km": 0.8,
        "images": [{ "image_url": "...", "is_primary": true }]
      }
    ],
    "meta": { "total": 14, "page": 1, "limit": 12, "totalPages": 2 }
  }
  ```

### `POST /listings`
Publish a new product listing.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Sony WH-1000XM4 Headphones",
    "description": "Like-new condition with case and cable.",
    "category_id": "uuid",
    "price": 14500,
    "original_price": 24990,
    "condition": "LIKE_NEW",
    "locality": "Koramangala",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560034",
    "latitude": 12.9352,
    "longitude": 77.6245,
    "images": [{ "url": "https://...", "is_primary": true }]
  }
  ```

### `POST /listings/upload`
Upload up to 6 product images.
- **Content-Type**: `multipart/form-data` (`images`)

---

## 3. Location Resolver (`/locations`)

### `GET /locations/pincode/:pincode`
Resolves Indian 6-digit postal code to locality, city, state, and coordinates.

### `GET /locations/reverse?lat=12.9719&lon=77.6412`
Reverse geocode geographic coordinates to area locality.

---

## 4. Offers & Negotiation (`/offers`)

### `POST /offers`
Make a price offer on a listing.
- **Request Body**:
  ```json
  {
    "listingId": "uuid",
    "amount": 13000,
    "message": "Can meet in Indiranagar today for 13k?"
  }
  ```

### `PATCH /offers/:id/accept`
Seller accepts the price offer.

### `PATCH /offers/:id/reject`
Seller rejects the price offer.

### `PATCH /offers/:id/counter`
Send counteroffer with updated `counterAmount`.

---

## 5. Orders & Transactions (`/orders`)

### `POST /orders`
Create an order with PostgreSQL row-level locking (`SELECT ... FOR UPDATE`).
- **Online Checkout Payload**:
  ```json
  {
    "listingId": "uuid",
    "offerId": "uuid-optional",
    "transactionType": "ONLINE"
  }
  ```
- **Offline Meetup Payload**:
  ```json
  {
    "listingId": "uuid",
    "transactionType": "OFFLINE",
    "meetupLocation": "Blue Tokai Coffee, Indiranagar",
    "meetupTime": "2026-11-09T16:00:00Z",
    "meetupNotes": "Meeting at 4 PM near outside counter"
  }
  ```

### `POST /orders/:id/verify-payment`
Verify cryptographic HMAC-SHA256 signature from Razorpay checkout.

### `POST /orders/:id/confirm-meetup`
Dual handshake: buyer and seller each confirm physical exchange. Marks listing SOLD and order COMPLETED once both confirm.

---

## 6. Socket.IO Real-Time Chat

Connect to `ws://localhost:5000` with auth payload: `{ token: "jwt_access_token" }`.

### Emitted Events (Client -> Server)
- `joinConversation`: `(conversationId)`
- `leaveConversation`: `(conversationId)`
- `sendMessage`: `{ conversationId, content }`
- `typing`: `{ conversationId }`
- `stopTyping`: `{ conversationId }`
- `markRead`: `{ conversationId }`

### Received Events (Server -> Client)
- `newMessage`: Broadcast message payload
- `userTyping`: `{ conversationId, userId }`
- `userStopTyping`: `{ conversationId, userId }`
- `messagesRead`: `{ conversationId, readerId }`
- `newNotification`: `{ type, text, createdAt }`

