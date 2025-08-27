# GameArena Backend API Documentation

## Overview

GameArena is a competitive gaming platform that allows users to create and participate in tournaments, manage wallets, track training sessions, and compete for prizes. The backend is built with Node.js, Express, Prisma (PostgreSQL), Socket.io, and integrates with Safaricom M-Pesa for payments.

**Base URL**: `http://localhost:4000`
**API Version**: 2.0.0

## Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication. Most endpoints require authentication.

### Cookie Details
- **Cookie Name**: `ga_auth`
- **HTTP Only**: Yes
- **SameSite**: Lax
- **Secure**: Configurable (false for development)
- **Expires**: 7 days

## Error Responses

All error responses follow this format:
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": [] // Optional, for validation errors
}
```

Common error codes:
- `UNAUTHORIZED` (401): No token provided
- `INVALID_TOKEN` (401): Invalid or expired token
- `FORBIDDEN` (403): Access denied
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `VALIDATION_ERROR` (400): Invalid input data
- `INSUFFICIENT_FUNDS` (400): Not enough wallet balance
- `MPESA_ERROR` (400): M-Pesa transaction failed
- `INVALID_PHONE` (400): Invalid phone number format

## API Endpoints

### Health Check

#### GET /health
Check server status and version information.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-08-26T10:30:00.000Z",
  "version": "2.0.0",
  "environment": "development"
}
```

---

## Authentication Routes (`/api/auth`)

### POST /api/auth/signup
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response** (201):
```json
{
  "id": "clxxxxxxxxxxxxx",
  "email": "user@example.com",
  "username": "johndoe"
}
```

**Validation Rules**:
- Email: Must be valid email format
- Username: 3-30 characters
- Password: Minimum 6 characters

### POST /api/auth/login
Authenticate user and create session.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200):
```json
{
  "id": "clxxxxxxxxxxxxx",
  "email": "user@example.com",
  "username": "johndoe"
}
```

### POST /api/auth/logout
**Authentication Required**

Logout user and invalidate session.

**Response** (200):
```json
{
  "ok": true
}
```

### GET /api/auth/me
**Authentication Required**

Get current user profile and wallet information.

**Response** (200):
```json
{
  "id": "clxxxxxxxxxxxxx",
  "email": "user@example.com",
  "username": "johndoe",
  "profile": {
    "id": "clxxxxxxxxxxxxx",
    "userId": "clxxxxxxxxxxxxx",
    "country": null,
    "level": "BEGINNER",
    "winRate": 0
  },
  "wallet": {
    "balance": 1000
  }
}
```

---

## Wallet Routes (`/api/wallet`)

All wallet routes require authentication except M-Pesa webhooks.

### GET /api/wallet/balance
Get current wallet balance.

**Response** (200):
```json
{
  "balance": 1000
}
```

### GET /api/wallet/transactions
Get transaction history.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response** (200):
```json
[
  {
    "id": "clxxxxxxxxxxxxx",
    "walletId": "clxxxxxxxxxxxxx",
    "type": "DEPOSIT",
    "amount": 1000,
    "meta": {
      "method": "M-PESA",
      "phone": "254700000000",
      "mpesaReceiptNumber": "QGJ7X8Y9Z1",
      "transactionDate": "20240826143000",
      "checkoutRequestId": "ws_CO_12082024143000123456789",
      "merchantRequestId": "25353-67890-1"
    },
    "createdAt": "2024-08-26T10:30:00.000Z"
  }
]
```

**Transaction Types**:
- `DEPOSIT`: Money added to wallet via M-Pesa
- `WITHDRAWAL`: Money removed from wallet via M-Pesa B2C
- `ENTRY_FEE`: Fee paid to join competition
- `PRIZE`: Prize money received
- `REFUND`: Money refunded from cancelled competition
- `TRANSFER`: Money transferred between accounts

### POST /api/wallet/deposit
**Authentication Required**

Initiate M-Pesa STK Push for wallet deposit.

**Request Body**:
```json
{
  "phone": "254700000000",
  "amount": 1000
}
```

**Response** (200):
```json
{
  "ok": true,
  "message": "STK Push sent successfully",
  "checkoutRequestId": "ws_CO_12082024143000123456789",
  "merchantRequestId": "25353-67890-1"
}
```

**Response** (400 - M-Pesa Error):
```json
{
  "error": "MPESA_ERROR",
  "message": "STK Push failed: [Specific error from M-Pesa]"
}
```

**Validation Rules**:
- Phone: Valid Kenyan phone number (starts with 254, 0, 7, or 1)
- Amount: Positive integer, minimum 1 KES, maximum 150,000 KES

**Phone Number Formats Supported**:
- International: `254700000000`
- National: `0700000000`
- Mobile: `700000000`

**M-Pesa Process Flow**:
1. User submits deposit request
2. System initiates STK Push to user's phone
3. User enters M-Pesa PIN on phone
4. M-Pesa processes payment
5. System receives callback and credits wallet
6. User's balance is updated automatically

### POST /api/wallet/withdraw
**Authentication Required**

Initiate M-Pesa B2C transfer for wallet withdrawal.

**Request Body**:
```json
{
  "amount": 500,
  "phone": "254700000000"
}
```

**Response** (200):
```json
{
  "ok": true,
  "message": "Withdrawal initiated successfully",
  "conversationId": "AG_20240826_2050123456789abcdef"
}
```

**Response** (400 - Insufficient Funds):
```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "Insufficient funds"
}
```

**Validation Rules**:
- Amount: Positive integer, minimum 10 KES, maximum 150,000 KES
- Amount must not exceed current wallet balance
- Phone: Required, valid Kenyan phone number

**M-Pesa Process Flow**:
1. User submits withdrawal request
2. System validates sufficient balance
3. Wallet is debited immediately
4. System initiates B2C transfer to user's phone
5. M-Pesa processes transfer
6. User receives money on their M-Pesa account

### GET /api/wallet/query/:checkoutRequestId
**Authentication Required**

Query the status of an M-Pesa STK Push transaction.

**URL Parameters**:
- `checkoutRequestId`: The checkout request ID returned from deposit

**Response** (200):
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "The service request has been accepted successfully",
  "MerchantRequestID": "25353-67890-1",
  "CheckoutRequestID": "ws_CO_12082024143000123456789",
  "ResultCode": "0",
  "ResultDesc": "The service request is processed successfully."
}
```

**Result Codes**:
- `0`: Success
- `1032`: Request cancelled by user
- `1037`: Timeout - user cannot be reached
- `2001`: Wrong PIN entered
- `1025`: Unable to complete transaction

---

## M-Pesa Webhook Routes (`/api/mpesa`)

These routes are called by Safaricom's servers and do not require authentication.

### POST /api/mpesa/callback
**M-Pesa STK Push Callback**

Receives STK Push transaction results from M-Pesa.

**Request Body** (from M-Pesa):
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "25353-67890-1",
      "CheckoutRequestID": "ws_CO_12082024143000123456789",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 10.00
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "QGJ7X8Y9Z1"
          },
          {
            "Name": "TransactionDate",
            "Value": 20240826143000
          },
          {
            "Name": "PhoneNumber",
            "Value": 254700000000
          }
        ]
      }
    }
  }
}
```

**Response** (200):
```json
{
  "ResultCode": 0,
  "ResultDesc": "Success"
}
```

**Process**:
1. Validates callback data
2. Finds matching pending transaction
3. If successful (ResultCode = 0):
   - Credits user's wallet
   - Marks transaction as completed
   - Stores M-Pesa receipt number
4. If failed:
   - Marks transaction as failed
   - Stores failure reason

### POST /api/mpesa/b2c-result
**M-Pesa B2C Result Callback**

Receives B2C transfer results from M-Pesa.

**Request Body** (from M-Pesa):
```json
{
  "Result": {
    "ResultType": 0,
    "ResultCode": 0,
    "ResultDesc": "The service request is processed successfully.",
    "OriginatorConversationID": "25353-67890-1",
    "ConversationID": "AG_20240826_2050123456789abcdef",
    "TransactionID": "QGJ7X8Y9Z1",
    "ResultParameters": {
      "ResultParameter": [
        {
          "Key": "TransactionAmount",
          "Value": 500
        },
        {
          "Key": "TransactionID",
          "Value": "QGJ7X8Y9Z1"
        },
        {
          "Key": "B2CRecipientIsRegisteredCustomer",
          "Value": "Y"
        }
      ]
    }
  }
}
```

**Response** (200):
```json
{
  "ResultCode": 0,
  "ResultDesc": "Success"
}
```

**Process**:
1. Logs transaction result
2. For successful transactions: Updates transaction records
3. For failed transactions: May require manual intervention to credit back user's wallet

### POST /api/mpesa/timeout
**M-Pesa Timeout Callback**

Handles M-Pesa timeout notifications.

**Response** (200):
```json
{
  "ResultCode": 0,
  "ResultDesc": "Success"
}
```

---

## M-Pesa Configuration

### Environment Variables Required

```env
# M-Pesa Environment
MPESA_ENV=sandbox # or 'live'

# Sandbox Configuration
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_sandbox_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_QUEUE_TIMEOUT_URL=https://yourdomain.com/api/mpesa/timeout
MPESA_RESULT_URL=https://yourdomain.com/api/mpesa/b2c-result
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=Safaricom999!*!

# Live Configuration (Production)
MPESA_LIVE_CONSUMER_KEY=your_live_consumer_key
MPESA_LIVE_CONSUMER_SECRET=your_live_consumer_secret
MPESA_LIVE_BUSINESS_SHORT_CODE=your_live_shortcode
MPESA_LIVE_PASSKEY=your_live_passkey
MPESA_LIVE_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_LIVE_QUEUE_TIMEOUT_URL=https://yourdomain.com/api/mpesa/timeout
MPESA_LIVE_RESULT_URL=https://yourdomain.com/api/mpesa/b2c-result
MPESA_LIVE_INITIATOR_NAME=your_initiator_name
MPESA_LIVE_SECURITY_CREDENTIAL=encrypted_credential
```

### M-Pesa URLs

**Sandbox**:
- Base URL: `https://sandbox.safaricom.co.ke`
- OAuth: `/oauth/v1/generate?grant_type=client_credentials`
- STK Push: `/mpesa/stkpush/v1/processrequest`
- STK Query: `/mpesa/stkpushquery/v1/query`
- B2C: `/mpesa/b2c/v1/paymentrequest`

**Production**:
- Base URL: `https://api.safaricom.co.ke`
- Same endpoints as sandbox

### M-Pesa Transaction Limits

- **STK Push (Deposits)**:
  - Minimum: KES 1
  - Maximum: KES 150,000
  - Per day: KES 300,000

- **B2C (Withdrawals)**:
  - Minimum: KES 10
  - Maximum: KES 150,000
  - Per day: KES 300,000

### M-Pesa Error Codes

Common M-Pesa error codes and their meanings:

- `0`: Success
- `1`: Insufficient funds
- `1025`: Unable to complete transaction
- `1032`: Request cancelled by user
- `1037`: Timeout - user cannot be reached
- `2001`: Wrong PIN entered
- `1`: The balance is insufficient for the transaction
- `1001`: Unable to lock subscriber
- `1019`: Transaction failed
- `9999`: Request failed

---

## Competition Routes (`/api/competitions`)

### GET /api/competitions/public
Get list of public competitions.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (UPCOMING, ONGOING, COMPLETED, CANCELED)
- `level` (optional): Filter by level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)

**Response** (200):
```json
[
  {
    "id": "clxxxxxxxxxxxxx",
    "title": "Snake Championship",
    "status": "UPCOMING",
    "minutesToPlay": 10,
    "maxPlayers": 50,
    "currentPlayers": 12,
    "entryFee": 100,
    "totalPrizePool": 1080,
    "code": "ABC12345",
    "gameLevel": "BEGINNER",
    "startsAt": "2024-08-26T15:00:00.000Z",
    "endsAt": "2024-08-26T15:15:00.000Z",
    "creator": "johndoe",
    "Game": {
      "name": "Snake"
    }
  }
]
```

### GET /api/competitions/:code
Get specific competition details by code.

**URL Parameters**:
- `code`: Competition code (e.g., "ABC12345")

**Response** (200):
```json
{
  "id": "clxxxxxxxxxxxxx",
  "code": "ABC12345",
  "title": "Snake Championship",
  "description": "Weekly snake competition",
  "creatorId": "clxxxxxxxxxxxxx",
  "gameId": "clxxxxxxxxxxxxx",
  "level": "BEGINNER",
  "privacy": "PUBLIC",
  "minutesToPlay": 10,
  "maxPlayers": 50,
  "entryFee": 100,
  "totalPrizePool": 1080,
  "status": "UPCOMING",
  "startsAt": "2024-08-26T15:00:00.000Z",
  "endsAt": "2024-08-26T15:15:00.000Z",
  "createdAt": "2024-08-26T10:00:00.000Z",
  "updatedAt": "2024-08-26T10:00:00.000Z",
  "creator": {
    "username": "johndoe"
  },
  "game": {
    "id": "clxxxxxxxxxxxxx",
    "name": "Snake",
    "minEntryFee": 100
  },
  "players": [
    {
      "id": "clxxxxxxxxxxxxx",
      "username": "player1",
      "score": 150,
      "isReady": true,
      "rank": 1,
      "joinedAt": "2024-08-26T10:15:00.000Z"
    }
  ]
}
```

### GET /api/competitions/mine
**Authentication Required**

Get competitions created by current user.

**Response** (200): Same format as public competitions list.

### POST /api/competitions/create
**Authentication Required**

Create a new competition.

**Request Body**:
```json
{
  "title": "Snake Championship",
  "description": "Weekly snake competition",
  "gameId": "clxxxxxxxxxxxxx",
  "level": "BEGINNER",
  "privacy": "PUBLIC",
  "minutesToPlay": 10,
  "maxPlayers": 50,
  "entryFee": 100,
  "startsAt": "2024-08-26T15:00:00.000Z",
  "endsAt": "2024-08-26T15:15:00.000Z"
}
```

**Response** (200):
```json
{
  "id": "clxxxxxxxxxxxxx",
  "code": "ABC12345",
  "title": "Snake Championship",
  "description": "Weekly snake competition",
  "creatorId": "clxxxxxxxxxxxxx",
  "gameId": "clxxxxxxxxxxxxx",
  "level": "BEGINNER",
  "privacy": "PUBLIC",
  "minutesToPlay": 10,
  "maxPlayers": 50,
  "entryFee": 100,
  "totalPrizePool": 0,
  "status": "UPCOMING",
  "startsAt": "2024-08-26T15:00:00.000Z",
  "endsAt": "2024-08-26T15:15:00.000Z",
  "createdAt": "2024-08-26T10:00:00.000Z",
  "updatedAt": "2024-08-26T10:00:00.000Z",
  "game": {
    "id": "clxxxxxxxxxxxxx",
    "name": "Snake",
    "minEntryFee": 100
  }
}
```

**Validation Rules**:
- Title: Minimum 3 characters
- GameId: Must be valid CUID and exist
- Level: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- Privacy: PUBLIC or PRIVATE (default: PUBLIC)
- MinutesToPlay: Minimum 1 minute
- MaxPlayers: 2-1000 players
- EntryFee: Non-negative integer, must meet game's minimum
- EndsAt: Must be after startsAt

### POST /api/competitions/:code/join
**Authentication Required**

Join a competition by code.

**URL Parameters**:
- `code`: Competition code

**Response** (200):
```json
{
  "ok": true,
  "poolIncrement": 90
}
```

**Response** (200 - Already Joined):
```json
{
  "ok": true,
  "alreadyJoined": true
}
```

**Error Conditions**:
- Competition not found (404)
- Competition not accepting players (400)
- Competition full (400)
- Insufficient wallet balance (400)

### POST /api/competitions/:code/ready
**Authentication Required**

Mark player as ready in a competition.

**URL Parameters**:
- `code`: Competition code

**Response** (200):
```json
{
  "ok": true,
  "readyCount": 8,
  "total": 10
}
```

**Note**: Competition automatically starts when all players are ready and there are at least 2 players.

### POST /api/competitions/:code/score
**Authentication Required**

Submit score for ongoing competition.

**URL Parameters**:
- `code`: Competition code

**Request Body**:
```json
{
  "score": 1250
}
```

**Response** (200):
```json
{
  "ok": true
}
```

**Validation Rules**:
- Score: Non-negative integer
- Competition must be in ONGOING status

### POST /api/competitions/:code/complete
**Authentication Required**

Complete a competition and distribute prizes (creator only).

**URL Parameters**:
- `code`: Competition code

**Response** (200):
```json
{
  "ok": true,
  "results": {
    "winners": [
      {
        "rank": 1,
        "username": "player1",
        "score": 1500,
        "prize": 648
      },
      {
        "rank": 2,
        "username": "player2",
        "score": 1200,
        "prize": 270
      },
      {
        "rank": 3,
        "username": "player3",
        "score": 1000,
        "prize": 162
      }
    ],
    "totalPrizePool": 1080
  }
}
```

**Prize Distribution**:
- 2 players: 70% first, 30% second
- 3+ players: 60% first, 25% second, remainder third

---

## Invite Routes (`/api/invite`)

All invite routes require authentication.

### GET /api/invite/mine
Get invites created by current user.

**Response** (200):
```json
[
  {
    "id": "clxxxxxxxxxxxxx",
    "competitionId": "clxxxxxxxxxxxxx",
    "inviterId": "clxxxxxxxxxxxxx",
    "inviteeId": null,
    "code": "INV12345",
    "accepted": false,
    "createdAt": "2024-08-26T10:00:00.000Z",
    "Competition": {
      "title": "Snake Championship",
      "code": "ABC12345",
      "status": "UPCOMING"
    }
  }
]
```

### POST /api/invite/:competitionId
Create an invite for a competition (creator only).

**URL Parameters**:
- `competitionId`: Competition ID

**Response** (200):
```json
{
  "code": "INV12345",
  "link": "http://localhost:5173/join/INV12345",
  "inviteId": "clxxxxxxxxxxxxx"
}
```

### POST /api/invite/accept/:code
Accept an invite by code.

**URL Parameters**:
- `code`: Invite code

**Response** (200):
```json
{
  "ok": true,
  "competitionCode": "ABC12345",
  "competitionTitle": "Snake Championship"
}
```

---

## Leaderboard Routes (`/api/leaderboard`)

### GET /api/leaderboard/global
Get global leaderboard across all competitions.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 50)

**Response** (200):
```json
[
  {
    "rank": 1,
    "userId": "clxxxxxxxxxxxxx",
    "username": "topplayer",
    "totalScore": 15000,
    "averageScore": 1250,
    "tournaments": 12,
    "memberSince": "2024-07-01T10:00:00.000Z"
  }
]
```

### GET /api/leaderboard/competition/:code
Get leaderboard for specific competition.

**URL Parameters**:
- `code`: Competition code

**Response** (200):
```json
{
  "competition": {
    "title": "Snake Championship",
    "status": "ONGOING",
    "totalPrizePool": 1080
  },
  "leaderboard": [
    {
      "rank": 1,
      "username": "player1",
      "score": 1500,
      "isReady": true,
      "joinedAt": "2024-08-26T10:15:00.000Z"
    }
  ]
}
```

---

## Training Routes (`/api/training`)

All training routes require authentication.

### GET /api/training/mine
Get training sessions for current user.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `gameName` (optional): Filter by game name

**Response** (200):
```json
[
  {
    "id": "clxxxxxxxxxxxxx",
    "userId": "clxxxxxxxxxxxxx",
    "gameName": "Snake",
    "score": 1200,
    "duration": 180,
    "createdAt": "2024-08-26T10:00:00.000Z"
  }
]
```

### GET /api/training/stats
Get training statistics grouped by game.

**Response** (200):
```json
[
  {
    "gameName": "Snake",
    "sessionsPlayed": 25,
    "totalDuration": 4500,
    "totalScore": 30000,
    "averageScore": 1200,
    "bestScore": 1800
  }
]
```

### POST /api/training/session
Create a new training session.

**Request Body**:
```json
{
  "gameName": "Snake",
  "score": 1200,
  "duration": 180
}
```

**Response** (200):
```json
{
  "id": "clxxxxxxxxxxxxx",
  "userId": "clxxxxxxxxxxxxx",
  "gameName": "Snake",
  "score": 1200,
  "duration": 180,
  "createdAt": "2024-08-26T10:00:00.000Z"
}
```

**Validation Rules**:
- GameName: Required, minimum 1 character
- Score: Non-negative integer
- Duration: Non-negative integer (seconds)

---

## History Routes (`/api/history`)

All history routes require authentication.

### GET /api/history/mine
Get competition history for current user.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response** (200):
```json
[
  {
    "id": "clxxxxxxxxxxxxx",
    "competitionId": "clxxxxxxxxxxxxx",
    "title": "Snake Championship",
    "gameName": "Snake",
    "status": "COMPLETED",
    "score": 1200,
    "rank": 3,
    "entryFee": 100,
    "totalPrizePool": 1080,
    "joinedAt": "2024-08-26T10:15:00.000Z",
    "startsAt": "2024-08-26T15:00:00.000Z",
    "endsAt": "2024-08-26T15:15:00.000Z"
  }
]
```

---

## Development Routes

Available only in development environment (`NODE_ENV=development`).

### GET /api/dev/reset-competitions
Reset all competitions and players (development only).

**Response** (200):
```json
{
  "message": "All competitions reset"
}
```

### GET /api/dev/seed-games
Seed default games into database (development only).

**Response** (200):
```json
{
  "message": "Games seeded successfully",
  "games": [
    {
      "name": "Snake",
      "minEntryFee": 100
    },
    {
      "name": "Tetris",
      "minEntryFee": 150
    },
    {
      "name": "Pac-Man",
      "minEntryFee": 200
    },
    {
      "name": "Space Invaders",
      "minEntryFee": 100
    },
    {
      "name": "Breakout",
      "minEntryFee": 100
    }
  ]
}
```

---
### 1. List All Games (Enhanced)
**GET** `/games`

Lists all games with filtering and pagination support.

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/games`
- Headers: None required

**Query Parameters:**
- `gameType`: `ACTION` (values: ACTION, ADVENTURE, PUZZLE, STRATEGY, RACING, SPORTS, RPG, SIMULATION, ARCADE, TRIVIA, CARD, BOARD)
- `level`: `INTERMEDIATE` (values: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- `isPopular`: `true` (boolean)
- `isActive`: `true` (default: true)
- `minPlayers`: `2` (filter games that support at least this many players)
- `maxPlayers`: `10` (filter games that support at most this many players)
- `page`: `1` (default: 1)
- `limit`: `20` (default: 20)

**Full URL Example:**
```
{{baseUrl}}/games?gameType=ACTION&level=INTERMEDIATE&isPopular=true&page=1&limit=10
```

**Response Example:**
```json
{
  "games": [
    {
      "id": "clp123abc456",
      "name": "Chess Master",
      "description": "Strategic chess game for competitive players",
      "gameType": "STRATEGY",
      "level": "INTERMEDIATE",
      "playerRange": "2-2",
      "playTimeRange": "30-60 min",
      "minEntryFee": 100,
      "isPopular": true,
      "imageUrl": "https://example.com/chess-image.jpg",
      "activeCompetitions": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

### 2. Get Game Types
**GET** `/games/types`

Gets all available game types with counts.

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/games/types`
- Headers: None required

**Response Example:**
```json
[
  {
    "type": "ACTION",
    "count": 15
  },
  {
    "type": "STRATEGY",
    "count": 8
  },
  {
    "type": "PUZZLE",
    "count": 12
  }
]
```

---

### 3. Get Popular Games
**GET** `/games/popular`

Gets popular games ordered by active competitions.

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/games/popular`
- Headers: None required

**Query Parameters:**
- `limit`: `10` (default: 10)

**Response Example:**
```json
[
  {
    "id": "clp123abc456",
    "name": "Chess Master",
    "description": "Strategic chess game for competitive players",
    "gameType": "STRATEGY",
    "level": "INTERMEDIATE",
    "playerRange": "2-2",
    "playTimeRange": "30-60 min",
    "imageUrl": "https://example.com/chess-image.jpg",
    "activeCompetitions": 15
  }
]
```

---

### 4. Get Game Details (Enhanced)
**GET** `/games/:id`

Gets detailed information about a specific game including recent competitions.

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/games/{{gameId}}`
- Headers: None required

**Response Example:**
```json
{
  "id": "clp123abc456",
  "name": "Chess Master",
  "description": "Strategic chess game for competitive players",
  "gameType": "STRATEGY",
  "level": "INTERMEDIATE",
  "playerRange": "2-2",
  "playTimeRange": "30-60 min",
  "minEntryFee": 100,
  "isPopular": true,
  "imageUrl": "https://example.com/chess-image.jpg",
  "isActive": true,
  "competitions": [
    {
      "id": "comp123",
      "title": "Sunday Chess Championship",
      "status": "UPCOMING",
      "maxPlayers": 2,
      "currentPlayers": 1,
      "entryFee": 200,
      "totalPrizePool": 180,
      "code": "CH123A",
      "startsAt": "2025-08-28T10:00:00.000Z",
      "endsAt": "2025-08-28T12:00:00.000Z",
      "minutesToPlay": 45,
      "creator": "chessmaster"
    }
  ]
}
```

---

### 5. Get Game Statistics (Enhanced)
**GET** `/games/:id/stats`

Gets comprehensive statistics for a game.

**Response Example:**
```json
{
  "game": {
    "id": "clp123abc456",
    "name": "Chess Master",
    "description": "Strategic chess game for competitive players",
    "gameType": "STRATEGY",
    "level": "INTERMEDIATE",
    "playerRange": "2-2",
    "playTimeRange": "30-60 min",
    "minEntryFee": 100,
    "isPopular": true,
    "imageUrl": "https://example.com/chess-image.jpg"
  },
  "totalCompetitions": 25,
  "totalPlayers": 340,
  "totalPrizesAwarded": 45000,
  "averageEntryFee": 150,
  "averagePrizePool": 1800,
  "averagePlayTime": 45,
  "statusBreakdown": {
    "upcoming": 3,
    "ongoing": 2,
    "completed": 20,
    "canceled": 0
  }
}
```

---

## 🔒 Protected Endpoints (Enhanced)

### 6. Create Game (Enhanced)
**POST** `/games`

Creates a new game with comprehensive metadata.

**Postman Setup:**
- Method: `POST`
- URL: `{{baseUrl}}/games`
- Headers: 
  ```
  Authorization: Bearer {{authToken}}
  Content-Type: application/json
  ```

**Request Body:**
```json
{
  "name": "Racing Thunder",
  "description": "High-speed racing game with multiple tracks and vehicle customization",
  "gameType": "RACING",
  "level": "INTERMEDIATE",
  "minPlayers": 2,
  "maxPlayers": 8,
  "minPlayTime": 15,
  "maxPlayTime": 30,
  "minEntryFee": 200,
  "isPopular": false,
  "imageUrl": "https://example.com/racing-game.jpg"
}
```

**Response Example:**
```json
{
  "id": "clp456ghi789",
  "name": "Racing Thunder",
  "description": "High-speed racing game with multiple tracks and vehicle customization",
  "gameType": "RACING",
  "level": "INTERMEDIATE",
  "minPlayers": 2,
  "maxPlayers": 8,
  "minPlayTime": 15,
  "maxPlayTime": 30,
  "minEntryFee": 200,
  "isPopular": false,
  "imageUrl": "https://example.com/racing-game.jpg",
  "isActive": true,
  "createdAt": "2025-08-27T10:00:00.000Z"
}
```

**Validation Rules:**
- `name`: 2-100 characters, must be unique
- `description`: 10-500 characters (optional)
- `gameType`: Must be one of the enum values
- `level`: Must be one of BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- `minPlayers`: Must be ≥ 1
- `maxPlayers`: Must be ≥ minPlayers
- `minPlayTime`: Must be ≥ 1 minute
- `maxPlayTime`: Must be ≥ minPlayTime
- `minEntryFee`: Must be ≥ 0 (in cents)
- `imageUrl`: Must be valid URL (optional)

**Test Cases:**
- ✅ Should return 201 with created game details
- ❌ Should return 401 without authentication
- ❌ Should return 400 for invalid player ranges (maxPlayers < minPlayers)
- ❌ Should return 400 for invalid time ranges (maxPlayTime < minPlayTime)
- ❌ Should return 400 if game name already exists
- ❌ Should return 400 for invalid enum values

---

### 7. Update Game (Enhanced)
**PUT** `/games/:id`

Updates an existing game's details with full validation.

**Postman Setup:**
- Method: `PUT`
- URL: `{{baseUrl}}/games/{{gameId}}`
- Headers: 
  ```
  Authorization: Bearer {{authToken}}
  Content-Type: application/json
  ```

**Request Body (partial updates allowed):**
```json
{
  "description": "Updated description with new features",
  "isPopular": true,
  "minEntryFee": 150,
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**Test Cases:**
- ✅ Should validate ranges across existing and new values
- ❌ Should prevent invalid combinations (e.g., setting maxPlayers below existing minPlayers)
- ✅ Should allow partial updates
- ❌ Should return 400 if new name conflicts with existing game

---

## 🎯 Competition Model Changes

The Competition model has been streamlined. **Removed fields:**
- `level` (now references `game.level`)

**Enhanced validation:**
- `minutesToPlay` must be within game's `minPlayTime` - `maxPlayTime` range
- `maxPlayers` cannot exceed game's `maxPlayers`
- `maxPlayers` cannot be less than game's `minPlayers`
- `entryFee` must meet game's `minEntryFee` requirement

### Updated Competition Responses

**Competition List Response:**
```json
{
  "id": "comp123",
  "title": "Sunday Chess Championship",
  "status": "UPCOMING",
  "minutesToPlay": 45,
  "maxPlayers": 2,
  "currentPlayers": 1,
  "entryFee": 200,
  "totalPrizePool": 180,
  "code": "CH123A",
  "startsAt": "2025-08-28T10:00:00.000Z",
  "endsAt": "2025-08-28T12:00:00.000Z",
  "Game": {
    "name": "Chess Master",
    "gameType": "STRATEGY",
    "level": "INTERMEDIATE",
    "playerRange": "2-2",
    "playTimeRange": "30-60 min",
    "imageUrl": "https://example.com/chess-image.jpg"
  }
}
```

### New Competition Creation Validations

**POST** `/competitions/create`

**Enhanced Request Body:**
```json
{
  "title": "Evening Chess Tournament",
  "description": "Competitive chess for intermediate players",
  "gameId": "clp123abc456",
  "privacy": "PUBLIC",
  "minutesToPlay": 45,
  "maxPlayers": 2,
  "entryFee": 200,
  "startsAt": "2025-08-28T18:00:00.000Z",
  "endsAt": "2025-08-28T20:00:00.000Z"
}
```

**New Error Responses:**
```json
// If play time is outside game's range
{
  "error": "INVALID_PLAY_TIME",
  "message": "Play time must be between 30-60 minutes for this game"
}

// If exceeds max players
{
  "error": "EXCEEDS_MAX_PLAYERS",
  "message": "This game supports maximum 2 players"
}

// If below minimum players
{
  "error": "BELOW_MIN_PLAYERS",
  "message": "This game requires minimum 2 players"
}
```
---

## WebSocket Events

The API includes real-time WebSocket support via Socket.io for competition updates.

**Connection URL**: `ws://localhost:4000`

**Authentication**: Include JWT token in socket handshake:
```javascript
const socket = io('http://localhost:4000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Socket Events

#### Client → Server

**subscribe:competition**
```json
"ABC12345"
```

**score:update**
```json
{
  "code": "ABC12345",
  "score": 1500
}
```

**ready:toggle**
```json
{
  "code": "ABC12345"
}
```

#### Server → Client

**subscribed**
```json
{
  "competition": "ABC12345"
}
```

**leaderboard:update**
```json
{
  "competition": "ABC12345",
  "leaderboard": [
    {
      "rank": 1,
      "username": "player1",
      "score": 1500,
      "isReady": true
    }
  ],
  "timestamp": "2024-08-26T10:30:00.000Z"
}
```

**competition:started**
```json
{
  "competition": "ABC12345",
  "message": "Competition has started!"
}
```

**ready:update**
```json
{
  "competition": "ABC12345",
  "readyCount": 8,
  "totalPlayers": 10,
  "user": "johndoe",
  "isReady": true
}
```

**error**
```json
{
  "message": "Error message"
}
```

---

## Data Models

### User Levels
- `BEGINNER`: New players
- `INTERMEDIATE`: Experienced players  
- `ADVANCED`: Skilled players
- `EXPERT`: Professional players

### Competition Status
- `UPCOMING`: Not yet started, accepting players
- `ONGOING`: Currently active, players submitting scores
- `COMPLETED`: Finished, prizes distributed
- `CANCELED`: Cancelled, refunds processed

### Privacy Levels
- `PUBLIC`: Visible to all users
- `PRIVATE`: Only accessible via invite

### Pending Transaction Status
- `PENDING`: M-Pesa transaction initiated, waiting for confirmation
- `COMPLETED`: M-Pesa transaction successful, wallet credited
- `FAILED`: M-Pesa transaction failed
---

## Rate Limits

No explicit rate limits are configured, but the application includes:
- Connection timeouts (60s ping timeout, 25s ping interval)
- Request size limits (10MB)
- Database connection pooling

---

## Error Handling

The API includes comprehensive error handling:
- Prisma database errors are mapped to appropriate HTTP status codes
- Zod validation errors include detailed field-level messages  
- All errors are logged with request context
- Graceful shutdown handling for database connections