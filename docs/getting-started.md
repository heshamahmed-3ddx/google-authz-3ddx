# Getting Started

This guide will help you set up and run the Google AuthZ 3DDX project locally.

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Google Cloud Platform account
- Git

## Quick Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd google-authz-3ddx
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Environment
```bash
cd server
cp .env.example .env
```

Edit `.env` with your Google OAuth credentials:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_secure_session_secret
```

#### Client Environment
```bash
cd client
cp .env.example .env
```

### 4. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and any other required APIs
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
   - Authorized JavaScript origins: `http://localhost:3000`

### 5. Run the Application

#### Development Mode

Start both server and client in development mode:

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
google-authz-3ddx/
├── server/          # Node.js + Express backend
├── client/          # Vue 3 + Vuetify frontend
├── tests/           # Test suites
├── scripts/         # Utility scripts
├── docs/            # Documentation
└── README.md        # Project overview
```

## Next Steps

- [Environment Setup](./environment-setup.md) - Detailed configuration
- [API Reference](./api-reference.md) - Backend API documentation
- [Architecture](./architecture.md) - System design overview