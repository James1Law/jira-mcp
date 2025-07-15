import express from 'express';
import cors from 'cors';
import path from 'path';
import { config, validateConfig } from './config';
import routes from './api/routes';
import { ProductManagerAgent } from './services/product-manager-agent';

async function startServer() {
  try {
    // Validate configuration
    console.log('🔧 Validating configuration...');
    validateConfig();

    // Create Express app
    const app = express();

    // Serve Next.js static assets
    app.use('/_next/static', express.static(path.join(__dirname, '../public/frontend/.next/static')));
    // Serve Next.js built HTML (main UI)
    app.get('*', (req, res, next) => {
      // Only serve the Next.js UI for non-API routes
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(__dirname, '../public/frontend/.next/server/app/index.html'));
    });

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // API routes
    app.use('/api', routes);

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        name: 'MCP Slack-Jira Platform',
        version: '1.0.0',
        description: 'AI-powered Product Manager agent for Slack and Jira integration',
        endpoints: {
          health: '/api/health',
          slackWebhook: '/api/slack/webhook',
          testQuery: '/api/test/query',
          sprintSummary: '/api/sprint/summary',
          testIntegration: '/api/test/integration',
          configStatus: '/api/config/status',
        },
        documentation: 'See README.md for setup instructions',
      });
    });

    // Error handling middleware
    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
      });
    });

    // Start server
    const port = config.server.port;
    app.listen(port, () => {
      console.log('🚀 MCP Slack-Jira Platform started successfully!');
      console.log(`📡 Server running on http://localhost:${port}`);
      console.log(`🔗 Slack webhook: http://localhost:${port}/api/slack/webhook`);
      console.log(`🧪 Test endpoint: http://localhost:${port}/api/test/query`);
      console.log(`📊 Sprint summary: http://localhost:${port}/api/sprint/summary`);
      console.log('');
      console.log('💡 Quick test commands:');
      console.log(`  curl -X POST http://localhost:${port}/api/test/query \\`);
      console.log('    -H "Content-Type: application/json" \\');
      console.log('    -d \'{"message": "How many work items are ready for production?"}\'');
      console.log('');
      console.log(`  curl http://localhost:${port}/api/sprint/summary`);
      console.log('');
      console.log('⚠️  Remember to set up your environment variables in .env file');
    });

    // Test integration on startup (optional)
    if (config.server.nodeEnv === 'development') {
      console.log('🧪 Running integration test on startup...');
      const agent = new ProductManagerAgent();
      try {
        await agent.testIntegration();
        console.log('✅ Integration test passed on startup');
      } catch (error) {
        console.log('⚠️  Integration test failed on startup (this is normal in development)');
      }
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer(); 