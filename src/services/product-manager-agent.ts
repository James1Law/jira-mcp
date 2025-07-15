import { OpenAIService } from './openai';
import { JiraService } from './jira';
import { SlackService } from './slack';
import { ProcessedQuery, SprintReport } from '../types';

export class ProductManagerAgent {
  public openaiService: OpenAIService;
  public jiraService: JiraService;
  public slackService: SlackService;

  constructor() {
    this.openaiService = new OpenAIService();
    this.jiraService = new JiraService();
    this.slackService = new SlackService();
  }

  // Helper to clean up markdown for Slack and add emojis for section headings, flattening all markdown
  private formatForSlack(message: string): string {
    // Remove all markdown headings (###, ##, #)
    let formatted = message.replace(/^#+\s?/gm, '');
    // Remove all asterisks used for bold/italics
    formatted = formatted.replace(/\*+/g, '');
    // Replace section headings with emojis
    formatted = formatted.replace(/Active Work on Bunker-Related Tickets:?/gi, '🚧 Active Work on Bunker-Related Tickets:');
    formatted = formatted.replace(/Completed Bunker-Related Work:?/gi, '✅ Completed Bunker-Related Work:');
    formatted = formatted.replace(/Completed Bunkers-Related Tickets:?/gi, '✅ Completed Bunkers-Related Tickets:');
    formatted = formatted.replace(/Actionable Insights:?/gi, '💡 Actionable Insights:');
    // Replace all unordered list markers (-, •) with indented bullets
    formatted = formatted.replace(/^\s*[-•]\s?/gm, '  • ');
    // Replace nested lists (two or more spaces before a dash) with further indentation
    formatted = formatted.replace(/^(\s{2,})-\s?/gm, match => '    '.repeat(match.length / 2) + '• ');
    // Remove any remaining markdown underscores
    formatted = formatted.replace(/_/g, '');
    // Collapse multiple newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    // Trim leading/trailing whitespace
    return formatted.trim();
  }

  async processQuery(userMessage: string, channel?: string, threadTs?: string): Promise<void> {
    try {
      console.log(`🤖 Processing query: "${userMessage}"`);

      // Step 1: Send processing message
      await this.slackService.sendProcessingMessage(channel, threadTs);

      // Step 2: Analyze the query with OpenAI
      console.log('🔍 Analyzing query with OpenAI...');
      const analysis = await this.openaiService.analyzeQuery(userMessage);
      console.log('📊 Query analysis:', analysis);

      // Step 3: Fetch sprint data from Jira
      console.log('📋 Fetching sprint data from Jira...');
      const sprintReport = await this.jiraService.generateSprintReport();
      console.log('📊 Sprint report generated:', {
        sprint: sprintReport.sprint.name,
        totalItems: sprintReport.totalItems,
        readyForProduction: sprintReport.readyForProduction,
        blocked: sprintReport.blocked,
      });

      // Step 4: Generate AI-powered response
      console.log('🤖 Generating AI response...');
      let aiResponse = await this.openaiService.generateResponse(sprintReport, userMessage);
      aiResponse = this.formatForSlack(aiResponse);

      // Step 5: Send response to Slack
      console.log('📤 Sending response to Slack...');
      const success = await this.slackService.sendMessage(aiResponse, channel, threadTs);

      if (success) {
        console.log('✅ Query processed successfully');
      } else {
        console.error('❌ Failed to send response to Slack');
      }

    } catch (error) {
      console.error('❌ Error processing query:', error);
      // Send error response to Slack
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await this.slackService.sendErrorResponse(errorMessage, userMessage);
    }
  }

  async handleSlackEvent(event: any): Promise<void> {
    try {
      // Extract message details
      const message = event.text || '';
      const channel = event.channel;
      const threadTs = event.thread_ts;
      const user = event.user;

      // Ignore bot messages and empty messages
      if (event.bot_id || !message.trim()) {
        return;
      }

      // Check if message is asking about sprint/work items
      const sprintKeywords = [
        'sprint', 'work item', 'work items', 'ready for production', 
        'blocked', 'progress', 'status', 'how many', 'count'
      ];

      const hasSprintKeywords = sprintKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasSprintKeywords) {
        console.log(`🎯 Detected sprint-related query from ${user}: "${message}"`);
        await this.processQuery(message, channel, threadTs);
      } else {
        console.log(`⏭️  Ignoring non-sprint query: "${message}"`);
      }

    } catch (error) {
      console.error('❌ Error handling Slack event:', error);
    }
  }

  async generateSprintSummary(): Promise<SprintReport> {
    try {
      return await this.jiraService.generateSprintReport();
    } catch (error) {
      console.error('❌ Error generating sprint summary:', error);
      throw error;
    }
  }

  async testIntegration(): Promise<void> {
    try {
      console.log('🧪 Testing integration...');

      // Test OpenAI
      console.log('Testing OpenAI...');
      const testAnalysis = await this.openaiService.analyzeQuery('How many work items are ready for production?');
      console.log('✅ OpenAI test passed:', testAnalysis);

      // Test Jira
      console.log('Testing Jira...');
      const sprintReport = await this.jiraService.generateSprintReport();
      console.log('✅ Jira test passed:', {
        sprint: sprintReport.sprint.name,
        totalItems: sprintReport.totalItems,
      });

      // Test Slack
      console.log('Testing Slack...');
      const slackSuccess = await this.slackService.sendMessage('🧪 Integration test successful!');
      console.log('✅ Slack test passed:', slackSuccess);

      console.log('🎉 All integration tests passed!');

    } catch (error) {
      console.error('❌ Integration test failed:', error);
      throw error;
    }
  }
} 