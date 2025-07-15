import axios from 'axios';
import { config } from '../config';
import { SlackResponse } from '../types';

export class SlackService {
  private webhookUrl: string;
  private isMockMode: boolean;

  constructor() {
    this.webhookUrl = config.slack.webhookUrl;
    this.isMockMode = !this.webhookUrl;
    
    if (this.isMockMode) {
      console.log('⚠️  Running in mock mode - Slack messages will be logged to console');
    }
  }

  async sendMessage(message: string, channel?: string, threadTs?: string): Promise<boolean> {
    try {
      if (this.isMockMode) {
        console.log('📤 [MOCK SLACK] Message:', message);
        if (channel) console.log('📤 [MOCK SLACK] Channel:', channel);
        if (threadTs) console.log('📤 [MOCK SLACK] Thread:', threadTs);
        return true;
      }

      const payload: SlackResponse = {
        text: message,
      };

      if (channel) {
        payload.channel = channel;
      }

      if (threadTs) {
        payload.thread_ts = threadTs;
      }

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.status === 200) {
        console.log('✅ Slack message sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send Slack message:', response.status, response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending Slack message:', error);
      return false;
    }
  }

  async sendSprintReport(sprintReport: any, originalQuery: string): Promise<boolean> {
    try {
      const message = this.formatSprintReport(sprintReport, originalQuery);
      return await this.sendMessage(message);
    } catch (error) {
      console.error('❌ Error sending sprint report to Slack:', error);
      return false;
    }
  }

  private formatSprintReport(sprintReport: any, originalQuery: string): string {
    const { sprint, totalItems, summary, readyForProduction, blocked, inProgress } = sprintReport;

    let message = `📊 *Sprint Report*\n\n`;
    message += `*Sprint:* ${sprint.name}\n`;
    message += `*Total Work Items:* ${totalItems}\n\n`;

    // Add status breakdown
    message += `*Status Breakdown:*\n`;
    summary.forEach((statusGroup: any) => {
      message += `• ${statusGroup.status}: ${statusGroup.count} items\n`;
    });

    message += `\n*Key Metrics:*\n`;
    message += `• Ready for Production: ${readyForProduction}\n`;
    message += `• In Progress: ${inProgress}\n`;
    message += `• Blocked: ${blocked}\n`;

    if (sprint.goal) {
      message += `\n*Sprint Goal:* ${sprint.goal}\n`;
    }

    message += `\n*Original Query:* "${originalQuery}"`;

    return message;
  }

  async sendErrorResponse(error: string, originalQuery: string): Promise<boolean> {
    const message = `❌ *Error Processing Request*\n\n` +
                   `*Query:* "${originalQuery}"\n` +
                   `*Error:* ${error}\n\n` +
                   `Please try again or contact the development team if the issue persists.`;

    return await this.sendMessage(message);
  }

  async sendProcessingMessage(channel?: string, threadTs?: string): Promise<boolean> {
    const message = `🤔 Processing your request... Please wait a moment.`;
    return await this.sendMessage(message, channel, threadTs);
  }
} 