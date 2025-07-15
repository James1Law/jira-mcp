import OpenAI from 'openai';
import { config } from '../config';
import { ProcessedQuery, OpenAIFunction } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  private getQueryAnalysisFunctions(): OpenAIFunction[] {
    return [
      {
        name: 'analyze_sprint_query',
        description: 'Analyze a user query about Jira sprint and work items',
        parameters: {
          type: 'object',
          properties: {
            intent: {
              type: 'string',
              enum: [
                'sprint_status',
                'work_item_count',
                'ready_for_production',
                'blocked_items',
                'sprint_progress',
                'unknown'
              ],
              description: 'The intent of the user query'
            },
            parameters: {
              type: 'object',
              properties: {
                status_filter: {
                  type: 'string',
                  description: 'Specific status to filter by (e.g., "Ready for Production", "Blocked")'
                },
                count_only: {
                  type: 'boolean',
                  description: 'Whether the user only wants a count'
                },
                include_details: {
                  type: 'boolean',
                  description: 'Whether to include detailed information about work items'
                }
              }
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confidence score for the analysis'
            }
          },
          required: ['intent', 'parameters', 'confidence']
        }
      }
    ];
  }

  async analyzeQuery(userMessage: string): Promise<ProcessedQuery> {
    try {
      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a Product Manager assistant that helps analyze queries about Jira sprints and work items. 
            Analyze the user's question and extract the intent and relevant parameters. 
            Common intents include:
            - sprint_status: General questions about sprint state
            - work_item_count: Questions about number of work items
            - ready_for_production: Questions about items ready for production
            - blocked_items: Questions about blocked or stuck items
            - sprint_progress: Questions about overall sprint progress`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        functions: this.getQueryAnalysisFunctions(),
        function_call: { name: 'analyze_sprint_query' },
        temperature: config.openai.temperature,
      });

      const functionCall = response.choices[0]?.message?.function_call;
      if (!functionCall) {
        throw new Error('No function call returned from OpenAI');
      }

      const parsedArgs = JSON.parse(functionCall.arguments);
      return {
        intent: parsedArgs.intent,
        parameters: parsedArgs.parameters,
        confidence: parsedArgs.confidence,
      };
    } catch (error) {
      console.error('Error analyzing query with OpenAI:', error);
      // Fallback to a default analysis
      return {
        intent: 'sprint_status',
        parameters: {},
        confidence: 0.5,
      };
    }
  }

  async generateResponse(sprintReport: any, originalQuery: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful Product Manager assistant. Generate clear, concise responses about sprint status and work items. Be professional but friendly. Use bullet points when appropriate. Always provide actionable insights. Always use British English spellings in your responses.`
          },
          {
            role: 'user',
            content: `Original question: "${originalQuery}"
            
            Sprint data: ${JSON.stringify(sprintReport, null, 2)}
            
            Please provide a helpful response based on this data.`
          }
        ],
        temperature: config.openai.temperature,
      });

      return response.choices[0]?.message?.content || 'Unable to generate response';
    } catch (error) {
      console.error('Error generating response with OpenAI:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }
} 