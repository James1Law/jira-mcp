import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o', // switched from gpt-4 to gpt-4o
    temperature: 0.1,
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    botToken: process.env.SLACK_BOT_TOKEN || '',
  },
  jira: {
    baseUrl: process.env.JIRA_BASE_URL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
    email: process.env.JIRA_EMAIL || '',
    projectKey: process.env.JIRA_PROJECT_KEY || '',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
} as const;

// Validation function
export function validateConfig(): void {
  const requiredFields = [
    'openai.apiKey',
    'slack.webhookUrl',
    'jira.baseUrl',
    'jira.apiToken',
    'jira.email',
    'jira.projectKey',
  ];

  const missingFields = requiredFields.filter(field => {
    const keys = field.split('.');
    let value: any = config;
    for (const key of keys) {
      value = value[key];
    }
    return !value;
  });

  if (missingFields.length > 0) {
    console.warn('Missing required environment variables:', missingFields);
    console.warn('Please check your .env file or environment variables.');
  }
} 