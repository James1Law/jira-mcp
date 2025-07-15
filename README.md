# MCP Slack-Jira Platform

An AI-powered Multi-Channel Platform (MCP) that acts as a Product Manager agent, providing intelligent responses about Jira sprints and work items using OpenAI. Now with a modern React (Next.js) chat UI.

## 🚀 Features

- **Modern Chat UI**: Beautiful, ChatGPT-style interface built with React (Next.js)
- **Jira Integration**: Fetches sprint data and work items from Jira API
- **OpenAI Integration**: Uses function calling to understand queries and generate responses
- **Mock Mode**: Works with simulated data for development and testing
- **REST API**: Provides endpoints for testing and manual interaction
- **TypeScript**: Fully typed for better development experience

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Jira instance (for production)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/James1Law/jira-mcp.git
   cd mcp-slack-jira
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd public/frontend
   npm install --legacy-peer-deps
   cd ../..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your API keys:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Jira Configuration
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_API_TOKEN=your_jira_api_token_here
   JIRA_EMAIL=your_email@example.com
   JIRA_PROJECT_KEY=YOUR_PROJECT_KEY
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

## 🚀 Quick Start

### Development Mode (with mock data)

```bash
# Build the frontend
cd public/frontend
npm run build
cd ../..

# Start the development server
npm run dev
```

- Visit [http://localhost:3000](http://localhost:3000) to use the chat UI.
- The server will start with mock data for Jira, so you can test the functionality immediately.

### Production Mode

1. Set up all environment variables in `.env`
2. Build the frontend:
   ```bash
   cd public/frontend
   npm run build
   cd ../..
   ```
3. Build and start the production server:
   ```bash
   npm run build
   npm start
   ```

## 💬 Using the Chat UI

- Ask questions about your Jira sprints, work items, and team progress.
- Use the suggested questions or type your own.
- Previous chats are saved in the sidebar for easy access.
- All answers are generated using OpenAI and real Jira data (or mock data in development).

## 📁 Project Structure

```
mcp-slack-jira/
├── src/
│   ├── api/
│   │   └── routes.ts          # Express API routes
│   ├── config/
│   │   └── index.ts           # Configuration management
│   ├── services/
│   │   ├── openai.ts          # OpenAI integration
│   │   ├── jira.ts            # Jira API integration
│   │   └── product-manager-agent.ts  # Main agent orchestration
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── index.ts               # Application entry point
├── public/
│   └── frontend/              # Next.js React frontend (v0.dev)
├── package.json
├── tsconfig.json
├── env.example
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `JIRA_BASE_URL` | Your Jira instance URL | No (uses mock) |
| `JIRA_API_TOKEN` | Jira API token | No |
| `JIRA_EMAIL` | Email associated with Jira account | No |
| `JIRA_PROJECT_KEY` | Jira project key | No |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

### Mock Mode

The platform automatically runs in mock mode when Jira credentials are not provided.

In mock mode:
- Jira data is simulated with realistic test data
- All functionality works for testing

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint with API information |
| `/api/health` | GET | Health check |
| `/api/test/query` | POST | Test query processing |
| `/api/sprint/summary` | GET | Get current sprint summary |
| `/api/test/integration` | POST | Test all integrations |
| `/api/config/status` | GET | Configuration validation |
| `/api/demo/query` | POST | Main endpoint for chat UI |

## 🤖 How It Works

1. **Message Reception**: User submits a question in the chat UI
2. **Query Analysis**: OpenAI analyzes the message to understand intent
3. **Data Fetching**: Jira API is queried for sprint and work item data
4. **Response Generation**: OpenAI generates a helpful response based on the data
5. **Message Display**: Response is shown in the chat UI

### Example Flow

```
User: "How many work items are ready for production?"
    ↓
OpenAI: Analyzes intent → "ready_for_production"
    ↓
Jira: Fetches sprint data → 4 items ready
    ↓
OpenAI: Generates response → "There are 4 work items ready for production..."
    ↓
UI: Shows response to user
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Adding New Features

1. **New Jira queries**: Extend `JiraService` with new methods
2. **New AI capabilities**: Extend `OpenAIService` with new functions
3. **New API endpoints**: Add routes to `routes.ts`
4. **Frontend features**: Update React components in `public/frontend`

## 🔒 Security Considerations

- Store API keys in environment variables
- Use HTTPS in production
- Validate all incoming requests
- Implement rate limiting for production use
- Add authentication for API endpoints in production

## 🐛 Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Check your `.env` file
   - Ensure all required variables are set

2. **"OpenAI API error"**
   - Verify your OpenAI API key is valid
   - Check your OpenAI account has sufficient credits

3. **"Jira API error"**
   - Verify Jira credentials
   - Check project key exists
   - Ensure API token has proper permissions

---

For more details, see the code and comments in each file. 