# TradingBoard - Professional Trading Dashboard

A modern, real-time trading dashboard built with React, TypeScript, and Tailwind CSS. Features live market data, technical indicators, customizable watchlists, and AI-powered news summarization.

## 🚀 Features

### ✅ Implemented (Phase 1)

- **Real-Time Market Data**

  - Custom watchlists (My Watchlist, High Volatility)
  - Add/remove symbols dynamically

- **Charts & Technical Indicators**
  - TradingView Advanced chart
  - TradingView News
  - TradingView Calendar
  - TradingView Heatmap

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Node.js with PostgreSQL
- **Database**: PostgreSQL 15 with connection pooling
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom trading theme
- **Charts**: Recharts for financial visualization
- **State Management**: Zustand with subscriptions
- **Real-time Data**: WebSocket with reconnection logic
- **Icons**: Lucide React
- **Layout**: React Resizable Panels
- **Containerization**: Docker & Docker Compose

## 🎨 Design Features

- **Dark Theme**: Optimized for trading environments
- **Professional Colors**:
  - Background: Deep blue (#0b1426)
  - Surface: Muted blue (#1a2332)
  - Accent: Trading blue (#3b82f6)
  - Success: Green (#10b981)
  - Danger: Red (#ef4444)
- **Typography**: Monospace fonts for price data
- **Responsive Layout**: Resizable panels for custom workflows

## 📦 Installation

### Local Development

#### Option 1: With Docker (Recommended)

**Quick Start with Deployment Script:**

```bash
# Clone repository
git clone https://github.com/cgeorges/tradingboard.git
cd tradingboard

# For Linux/macOS
chmod +x deploy.sh
./deploy.sh dev

# For Windows PowerShell
.\deploy.ps1 dev
```

**Manual Docker Setup:**

```bash
# Create environment file
cp .env.sample .env
# Edit .env with your database credentials and API keys

# Start all services (app + PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option 2: Local Node.js + External PostgreSQL

```bash
# Install dependencies
npm install

# Set up PostgreSQL database
# - Install PostgreSQL locally or use cloud provider
# - Create database and run init.sql script
# - Configure .env with your database credentials

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Database Setup (Option 2)

If running locally without Docker:

```bash
# Create database
createdb tradingboard

# Run initialization script
psql -d tradingboard -f init.sql

# Or connect and run manually
psql -d tradingboard
\i init.sql
```

### 🐳 Docker Deployment

The application is containerized with PostgreSQL for easy production deployment:

#### Prerequisites

1. **Create Environment File**: Copy `.env.example` to `.env` and configure your database credentials:

```bash
cp .env.example .env
# Edit .env with your preferred database credentials
```

2. **Install Dependencies** (for local development):

```bash
npm install
```

#### Deployment

```bash
# Build and run with Docker Compose (includes PostgreSQL)
docker-compose up -d

# Or build and run manually (requires external PostgreSQL)
docker build -t tradingboard .
docker run -p 8080:80 \
  -e DB_HOST=your_postgres_host \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  tradingboard
```

The application will be available at `http://localhost:8080`

#### Docker Services

- **tradingboard**: Main React application (port 8080)
- **postgres**: PostgreSQL database (port 5432)
- **postgres_data**: Persistent volume for database storage

#### Docker Commands

**Development (build locally):**

```bash
# Stop services
docker-compose down

# Stop and remove volumes (⚠️  deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres

# Rebuild and restart
docker-compose up --build -d

# Check health status
docker-compose ps

# Access PostgreSQL directly
docker-compose exec postgres psql -U ${DB_USER} -d ${DB_NAME}
```

**Production (use published images):**

```bash
# Deploy with published images
docker-compose -f docker-compose.prod.yml up -d

# Update to latest images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

#### Database Management

```bash
# Backup database
docker-compose exec postgres pg_dump -U tradingboard_user tradingboard > backup.sql

# Restore database
docker-compose exec -T postgres psql -U tradingboard_user tradingboard < backup.sql

# Reset database (⚠️  deletes all data)
docker-compose down -v
docker-compose up -d
```

### 📦 Publishing Docker Image

#### Docker Hub

1. **Login to Docker Hub:**

```bash
docker login
```

2. **Build and tag the image:**

```bash
# Replace 'yourusername' with your Docker Hub username
docker build -t yourusername/tradingboard:latest .
docker build -t yourusername/tradingboard:v1.0.0 .
```

3. **Push to Docker Hub:**

```bash
docker push yourusername/tradingboard:latest
docker push yourusername/tradingboard:v1.0.0
```

4. **Use the published image:**

```bash
docker run -p 8080:80 yourusername/tradingboard:latest
```

#### GitHub Container Registry (GHCR)

1. **Create a Personal Access Token:**

   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `write:packages` scope

2. **Login to GHCR:**

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin
```

3. **Build and tag for GHCR:**

```bash
# Replace 'yourusername' with your GitHub username
docker build -t ghcr.io/yourusername/tradingboard:latest .
docker build -t ghcr.io/yourusername/tradingboard:v1.0.0 .
```

4. **Push to GHCR:**

```bash
docker push ghcr.io/yourusername/tradingboard:latest
docker push ghcr.io/yourusername/tradingboard:v1.0.0
```

#### 🤖 Automated Publishing with GitHub Actions

**Automated builds are already configured!** Every merge to the main branch automatically builds and pushes both frontend and backend images to Docker Hub.

**Published Images:**

- 🖥️ **Frontend**: `cgeorges/tradingboard-frontend:latest`
- 🔧 **Backend**: `cgeorges/tradingboard-backend:latest`

**Setup Requirements:**

1. **Create Docker Hub Access Token:**

   - Go to Docker Hub → Account Settings → Security
   - Click "New Access Token"
   - Copy the generated token

2. **Add GitHub Secrets:**

   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these repository secrets:
     - `DOCKERHUB_USERNAME`: `cgeorges`
     - `DOCKERHUB_TOKEN`: (your Docker Hub access token)

3. **Trigger Build:**
   - Push/merge to main branch
   - Or manually trigger via Actions tab

**What happens automatically:**

- ✅ Builds multi-platform images (amd64, arm64) for both frontend and backend
- ✅ Pushes to Docker Hub with latest and SHA tags
- ✅ Updates Docker Hub descriptions from README
- ✅ Uses build cache for faster builds
- ✅ Separate caching for frontend and backend

**Production Deployment:**

Use the production compose file with published images:

```bash
# Quick production deployment with script
./deploy.sh prod              # Linux/macOS
.\deploy.ps1 prod            # Windows PowerShell

# Manual production deployment
cp .env.example .env.prod
# Edit .env.prod with your production configuration
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Or pull latest images manually
docker pull cgeorges/tradingboard-frontend:latest
docker pull cgeorges/tradingboard-backend:latest
```

**Deployment Script Features:**

- ✅ Environment validation (dev/prod)
- ✅ Automatic .env file creation
- ✅ Health checks after deployment
- ✅ Cross-platform support (Linux/macOS/Windows)
- ✅ Image pulling for production
- ✅ Service status reporting

**Manual Publishing (if needed):**

## 🗃️ Data Storage

TradingBoard now uses **PostgreSQL** for persistent data storage, replacing the previous IndexedDB implementation.

### Database Schema

- **watchlists**: Stores user watchlists with symbols and settings
- **alerts**: Market alerts and notifications (future feature)

### Migration from IndexedDB

If you're upgrading from a previous version that used IndexedDB:

1. Your old watchlist data was stored locally in the browser
2. The new PostgreSQL setup will start with default watchlists
3. You can manually recreate your watchlists in the new system
4. Future versions may include an import tool for migration

### Data Persistence

- **Watchlists**: Stored in PostgreSQL with automatic timestamps
- **User Preferences**: Stored in PostgreSQL (extensible schema)
- **Market Data**: Cached in memory, not persisted (real-time)
- **Alerts**: Future feature, will use PostgreSQL

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration (Required)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tradingboard
DB_USER=tradingboard_user
DB_PASSWORD=tradingboard_password

# Polygon.io API Key for real-time stock data and news
# Get your free API key at: https://polygon.io/
VITE_POLYGON_API_KEY=your_polygon_api_key_here

# OpenAI API Key for agent-forge AI summarization (optional)
# Get your API key at: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=your_openai_api_key_here

# WebSocket URL for real-time data (optional - for premium providers)
# Examples: wss://socket.polygon.io/stocks, wss://ws.finnhub.io
VITE_WS_URL=wss://your-websocket-url.com

# Generic API key for other data providers (optional)
VITE_API_KEY=your_other_api_key_here
```

### Market Data Providers

The application now uses **real market data APIs**:

- **Polygon.io** - Real-time quotes, historical data, and news (primary)
- **IEX Cloud** - Financial data and news
- **Fallback Mode** - Enhanced demo data when APIs are unavailable

**Real data is now enabled by default!** Set your `VITE_ALPHA_VANTAGE_API_KEY` to get live market data.

### Getting Started with Real Data

1. **Get Polygon.io API Key** (free): https://polygon.io/
2. **Create `.env` file** with your API key
3. **Run the application** - it will automatically fetch real market data
4. **Rate Limits**: Free tier allows 5 API calls per minute, 500 per day

## 🎯 Usage

1. **Watchlist Management**

   - Switch between preset watchlists (My Watchlist, High Volatility)
   - Add new symbols using the input field
   - Remove symbols by clicking the minus icon
   - Search existing symbols

2. **Chart Analysis**

   - Click any symbol in watchlist to view charts
   - Switch timeframes using the buttons (1M, 5M, 15M, etc.)
   - Toggle technical indicators (VWAP, EMA20, EMA50)
   - View volume data in the lower chart

3. **News Monitoring**
   - Filter news by category or sentiment
   - Click the sparkle icon for AI summarization
   - Expand articles for full content
   - Open original articles in new tabs

## 🤖 AI Integration

The dashboard now includes **agent-forge framework integration** for enhanced news analysis:

### Current Implementation

- **Enhanced News Analysis Service**: Advanced sentiment analysis and key point extraction
- **Trading Signal Detection**: Identifies bullish/bearish catalysts and market impact
- **Smart Summarization**: Context-aware summaries for trading decisions
- **Agent-Forge Ready**: Framework integrated and ready for LLM-powered agents

### Usage

```typescript
// News analysis is automatically triggered
const analysis = await newsAnalysisService.analyzeNews(newsItem);

// Returns: {
//   summary: "AI-generated trading-focused summary",
//   sentiment: "positive" | "negative" | "neutral",
//   keyPoints: ["Key insight 1", "Key insight 2"],
//   marketImpact: "high" | "medium" | "low",
//   tradingSignals: ["Bullish earnings beat", "Analyst upgrade"]
// }
```

### Agent-Forge Integration

The `newsAnalysisService` can be easily replaced with full agent-forge AI agents:

```typescript
// TODO: Replace with agent-forge implementation
// const newsAgent = new TradingNewsAgent();
// await newsAgent.summarizeNews(newsItem);
```

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── Header.tsx      # Status and title bar
│   ├── Watchlist.tsx   # Stock list and management
│   ├── ChartPanel.tsx  # Charts and indicators
│   └── NewsPanel.tsx   # News feed and filtering
├── services/           # Business logic
│   └── marketDataService.ts  # WebSocket and API calls
├── store/              # State management
│   └── marketStore.ts  # Zustand store
├── types/              # TypeScript definitions
│   └── market.ts       # Data interfaces
└── index.css          # Global styles and theme
```

## 📊 Performance

- **Real-time Updates**: 1-second price refresh rate
- **Chart Rendering**: Optimized with virtualization
- **Memory Management**: Automatic cleanup and limits
- **WebSocket**: Auto-reconnection with exponential backoff

## 🔒 Security

- Environment variable protection
- CORS handling for API requests
- Secure WebSocket connections (WSS)
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Real-time options chain data
- [ ] Advanced technical analysis tools
- [ ] Portfolio optimization algorithms
- [ ] Machine learning price predictions
- [ ] Mobile companion app
- [ ] Multi-asset support (crypto, forex, commodities)

---

**TradingBoard** - Your command center for professional trading decisions.
