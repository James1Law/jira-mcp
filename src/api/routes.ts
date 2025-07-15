import express from 'express';
import { ProductManagerAgent } from '../services/product-manager-agent';
import { validateConfig } from '../config';
import { config } from '../config';

const router = express.Router();
const agent = new ProductManagerAgent();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Slack webhook endpoint
router.post('/slack/webhook', express.json(), async (req, res) => {
  try {
    const { challenge, event, type } = req.body;

    // Handle Slack URL verification
    if (type === 'url_verification' && challenge) {
      return res.json({ challenge });
    }

    // Handle Slack events
    if (type === 'event_callback' && event) {
      console.log('📨 Received Slack event:', event.type);
      
      // Handle message events
      if (event.type === 'message') {
        await agent.handleSlackEvent(event);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error handling Slack webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for manual query processing
router.post('/test/query', express.json(), async (req, res) => {
  try {
    const { message, channel, threadTs } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`🧪 Testing query: "${message}"`);
    await agent.processQuery(message, channel, threadTs);

    res.json({ 
      success: true, 
      message: 'Query processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error processing test query:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get sprint summary endpoint
router.get('/sprint/summary', async (req, res) => {
  try {
    const sprintReport = await agent.generateSprintSummary();
    res.json({
      success: true,
      data: sprintReport,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching sprint summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sprint summary',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test integration endpoint
router.post('/test/integration', async (req, res) => {
  try {
    await agent.testIntegration();
    res.json({ 
      success: true, 
      message: 'Integration test completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    res.status(500).json({ 
      error: 'Integration test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Configuration status endpoint
router.get('/config/status', (req, res) => {
  validateConfig();
  res.json({
    message: 'Configuration validation completed',
    timestamp: new Date().toISOString(),
  });
});

// Demo endpoint for frontend UI
router.post('/demo/query', express.json(), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    // Use the agent to get the answer (reuse OpenAI and Jira logic)
    const analysis = await agent.openaiService.analyzeQuery(message);
    const sprintReport = await agent.jiraService.generateSprintReport();

    // Custom logic: If the user is asking what a particular user is working on
    const userMatch = message.match(/(?:what|which|show|list)[^\w]+(?:is|tickets|tasks)?[^\w]+([A-Za-z .'-]+)[^\w]+working on/i);
    let aiResponse;
    if (userMatch) {
      const person = userMatch[1].trim();
      // Find all work items assigned to this person
      const assignedItems = [];
      let mainItems = [];
      let otherItems = [];
      if (sprintReport && sprintReport.summary) {
        for (const group of sprintReport.summary) {
          for (const item of group.items) {
            if (item.assignee && item.assignee.toLowerCase().includes(person.toLowerCase())) {
              assignedItems.push({ ...item, status: group.status });
              if (['in progress', 'code review'].includes(group.status.toLowerCase())) {
                mainItems.push({ ...item, status: group.status });
              } else {
                otherItems.push({ ...item, status: group.status });
              }
            }
          }
        }
      }
      // Compose a summary for OpenAI
      let summaryText = `You are a product manager assistant. The user asked what ${person} is working on. Here are their tickets in the current sprint.\n\n`;
      if (mainItems.length > 0) {
        summaryText += `Main focus (In Progress or Code Review):\n`;
        mainItems.forEach(item => {
          summaryText += `• [${item.status}] ${item.key}: ${item.summary}\n`;
        });
      } else {
        summaryText += `${person} has no tickets currently In Progress or in Code Review.\n`;
      }
      if (otherItems.length > 0) {
        summaryText += `\nOther assigned tickets (not In Progress or Code Review):\n`;
        otherItems.forEach(item => {
          summaryText += `• [${item.status}] ${item.key}: ${item.summary}\n`;
        });
      }
      summaryText += `\nPlease summarise this for the user.`;
      // Ask OpenAI to summarise
      aiResponse = await agent.openaiService.generateResponse({}, summaryText);
      aiResponse = agent['formatForSlack'] ? agent['formatForSlack'](aiResponse) : aiResponse;
      return res.json({ answer: aiResponse });
    }
    // Default: normal flow
    aiResponse = await agent.openaiService.generateResponse(sprintReport, message);
    aiResponse = agent['formatForSlack'] ? agent['formatForSlack'](aiResponse) : aiResponse;
    res.json({ answer: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 