// Slack Types
export interface SlackMessage {
  text: string;
  user: string;
  channel: string;
  timestamp: string;
}

export interface SlackResponse {
  text: string;
  channel?: string;
  thread_ts?: string;
}

// Jira Types
export interface JiraWorkItem {
  id: string;
  key: string;
  summary: string;
  status: string;
  assignee?: string;
  priority: string;
  issueType: string;
  created: string;
  updated: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate: string;
  endDate: string;
  goal?: string;
}

export interface JiraProject {
  key: string;
  name: string;
  id: string;
}

export interface WorkItemSummary {
  status: string;
  count: number;
  items: JiraWorkItem[];
}

// OpenAI Types
export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface OpenAIFunctionCall {
  name: string;
  arguments: string;
}

export interface OpenAIResponse {
  role: 'assistant';
  content: string | null;
  function_call?: OpenAIFunctionCall;
}

// Application Types
export interface ProcessedQuery {
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
}

export interface SprintReport {
  sprint: JiraSprint;
  totalItems: number;
  summary: WorkItemSummary[];
  readyForProduction: number;
  blocked: number;
  inProgress: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
} 