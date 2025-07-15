# MCP Slack-Jira Platform

An AI-powered Multi-Channel Platform (MCP) that acts as a Product Manager agent, listening for Slack messages about Jira sprints and providing intelligent responses using OpenAI.

## 🚀 Features

- **Slack Integration**: Listens for messages and responds via webhooks
- **Jira Integration**: Fetches sprint data and work items from Jira API
- **OpenAI Integration**: Uses function calling to understand queries and generate responses
- **Mock Mode**: Works with simulated data for development and testing
- **REST API**: Provides endpoints for testing and manual interaction
- **TypeScript**: Fully typed for better development experience

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Slack workspace (for production)
- Jira instance (for production)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mcp-slack-jira
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Slack Configuration (optional for development)
   SLACK_WEBHOOK_URL=your_slack_webhook_url_here
   SLACK_BOT_TOKEN=your_slack_bot_token_here
   
   # Jira Configuration (optional for development)
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
# Start the development server
npm run dev
```

The server will start with mock data for both Slack and Jira, so you can test the functionality immediately.

### Production Mode

1. Set up all environment variables in `.env`
2. Build the project:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

## 🧪 Testing

### Test the API endpoints

1. **Health check**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test a query**
   ```bash
   curl -X POST http://localhost:3000/api/test/query \
     -H "Content-Type: application/json" \
     -d '{"message": "How many work items are ready for production?"}'
   ```

3. **Get sprint summary**
   ```bash
   curl http://localhost:3000/api/sprint/summary
   ```

4. **Test integration**
   ```bash
   curl -X POST http://localhost:3000/api/test/integration
   ```

### Example Queries

The platform can handle various types of queries:

- "How many work items are ready for production?"
- "What's the status of our current sprint?"
- "How many items are blocked?"
- "Show me the sprint progress"
- "Count the work items in progress"

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
│   │   ├── slack.ts           # Slack webhook integration
│   │   └── product-manager-agent.ts  # Main agent orchestration
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── index.ts               # Application entry point
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
| `SLACK_WEBHOOK_URL` | Slack webhook URL for sending messages | No (uses mock) |
| `SLACK_BOT_TOKEN` | Slack bot token for advanced features | No |
| `JIRA_BASE_URL` | Your Jira instance URL | No (uses mock) |
| `JIRA_API_TOKEN` | Jira API token | No |
| `JIRA_EMAIL` | Email associated with Jira account | No |
| `JIRA_PROJECT_KEY` | Jira project key | No |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

### Mock Mode

The platform automatically runs in mock mode when:
- Slack webhook URL is not provided
- Jira credentials are not provided

In mock mode:
- Slack messages are logged to console
- Jira data is simulated with realistic test data
- All functionality works for testing

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint with API information |
| `/api/health` | GET | Health check |
| `/api/slack/webhook` | POST | Slack webhook endpoint |
| `/api/test/query` | POST | Test query processing |
| `/api/sprint/summary` | GET | Get current sprint summary |
| `/api/test/integration` | POST | Test all integrations |
| `/api/config/status` | GET | Configuration validation |

## 🤖 How It Works

1. **Message Reception**: Slack sends a message to the webhook endpoint
2. **Query Analysis**: OpenAI analyzes the message to understand intent
3. **Data Fetching**: Jira API is queried for sprint and work item data
4. **Response Generation**: OpenAI generates a helpful response based on the data
5. **Message Sending**: Response is sent back to Slack

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
Slack: Sends response to user
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
2. **New Slack features**: Add methods to `SlackService`
3. **New AI capabilities**: Extend `OpenAIService` with new functions
4. **New API endpoints**: Add routes to `routes.ts`

## 🔒 Security Considerations

- Store API keys in environment variables
- Use HTTPS in production
- Validate all incoming webhook requests
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

4. **"Slack webhook error"**
   - Verify webhook URL is correct
   - Check Slack app permissions

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation 