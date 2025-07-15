import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { JiraWorkItem, JiraSprint, SprintReport, WorkItemSummary } from '../types';

export class JiraService {
  private client: AxiosInstance;
  private isMockMode: boolean;
  private boardId: string | number | undefined;

  constructor() {
    this.isMockMode = !config.jira.baseUrl || !config.jira.apiToken;
    // Always use the board ID from .env (e.g., JIRA_BOARD_ID=464)
    this.boardId = process.env.JIRA_BOARD_ID || undefined;
    
    if (this.isMockMode) {
      console.log('⚠️  Running in mock mode - using simulated Jira data');
      this.client = axios.create();
    } else {
      this.client = axios.create({
        baseURL: config.jira.baseUrl,
        auth: {
          username: config.jira.email,
          password: config.jira.apiToken,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
    }
  }

  async getActiveSprint(): Promise<JiraSprint> {
    if (this.isMockMode) {
      return this.getMockActiveSprint();
    }

    try {
      // Only use the board ID from .env
      const boardId = this.boardId;
      if (!boardId) {
        throw new Error('JIRA_BOARD_ID must be set in .env to specify the board to use.');
      }

      const sprintsResponse = await this.client.get(`/rest/agile/1.0/board/${boardId}/sprint`, {
        params: {
          state: 'active',
        },
      });

      const activeSprints = sprintsResponse.data.values;
      if (!activeSprints || activeSprints.length === 0) {
        throw new Error('No active sprints found');
      }

      const sprint = activeSprints[0];
      return {
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        goal: sprint.goal,
      };
    } catch (error) {
      console.error('Error fetching active sprint:', error);
      throw new Error('Failed to fetch active sprint');
    }
  }

  async getWorkItemsInSprint(sprintId: number): Promise<JiraWorkItem[]> {
    if (this.isMockMode) {
      return this.getMockWorkItems();
    }

    try {
      // Only fetch minimal fields needed for reporting and analysis
      const response = await this.client.get(`/rest/agile/1.0/sprint/${sprintId}/issue`, {
        params: {
          fields: 'summary,status,assignee,priority,issuetype,created,updated,key,duedate',
          maxResults: 100,
        },
      });

      // Minimal debug log for each issue
      const minimalIssues = response.data.issues.map((issue: any) => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name,
        assignee: issue.fields.assignee?.displayName,
        issueType: issue.fields.issuetype?.name,
        duedate: issue.fields.duedate,
      }));
      console.log('Jira minimal issues:', JSON.stringify(minimalIssues, null, 2));

      return response.data.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name || 'Medium',
        issueType: issue.fields.issuetype?.name,
        created: issue.fields.created,
        updated: issue.fields.updated,
        // Add duedate for sprint timing
        duedate: issue.fields.duedate,
      }));
    } catch (error) {
      console.error('Error fetching work items:', error);
      throw new Error('Failed to fetch work items');
    }
  }

  async generateSprintReport(): Promise<SprintReport> {
    try {
      const sprint = await this.getActiveSprint();
      const workItems = await this.getWorkItemsInSprint(sprint.id);

      // Group work items by status
      const statusGroups = workItems.reduce((acc, item) => {
        const status = item.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(item);
        return acc;
      }, {} as Record<string, JiraWorkItem[]>);

      // Create summary
      const summary: WorkItemSummary[] = Object.entries(statusGroups).map(([status, items]) => ({
        status,
        count: items.length,
        items,
      }));

      // Calculate specific counts
      const readyForProduction = workItems.filter(item => 
        item.status.toLowerCase().includes('ready') || 
        item.status.toLowerCase().includes('done') ||
        item.status.toLowerCase().includes('complete')
      ).length;

      const blocked = workItems.filter(item => 
        item.status.toLowerCase().includes('blocked') || 
        item.status.toLowerCase().includes('impediment')
      ).length;

      const inProgress = workItems.filter(item => 
        item.status.toLowerCase().includes('progress') || 
        item.status.toLowerCase().includes('development')
      ).length;

      return {
        sprint,
        totalItems: workItems.length,
        summary,
        readyForProduction,
        blocked,
        inProgress,
      };
    } catch (error) {
      console.error('Error generating sprint report:', error);
      throw error;
    }
  }

  // Mock data methods for development
  private getMockActiveSprint(): JiraSprint {
    return {
      id: 123,
      name: 'Sprint 15 - Product Launch',
      state: 'active',
      startDate: '2024-01-15T00:00:00.000Z',
      endDate: '2024-01-29T00:00:00.000Z',
      goal: 'Launch the new user dashboard and improve performance',
    };
  }

  private getMockWorkItems(): JiraWorkItem[] {
    return [
      {
        id: '1001',
        key: 'PROJ-101',
        summary: 'Implement user authentication flow',
        status: 'Ready for Production',
        assignee: 'John Doe',
        priority: 'High',
        issueType: 'Story',
        created: '2024-01-10T10:00:00.000Z',
        updated: '2024-01-20T15:30:00.000Z',
      },
      {
        id: '1002',
        key: 'PROJ-102',
        summary: 'Design new dashboard layout',
        status: 'In Progress',
        assignee: 'Jane Smith',
        priority: 'Medium',
        issueType: 'Task',
        created: '2024-01-12T09:00:00.000Z',
        updated: '2024-01-21T11:45:00.000Z',
      },
      {
        id: '1003',
        key: 'PROJ-103',
        summary: 'Fix performance issues in search',
        status: 'Blocked',
        assignee: 'Mike Johnson',
        priority: 'High',
        issueType: 'Bug',
        created: '2024-01-14T14:20:00.000Z',
        updated: '2024-01-22T16:15:00.000Z',
      },
      {
        id: '1004',
        key: 'PROJ-104',
        summary: 'Add unit tests for API endpoints',
        status: 'Ready for Production',
        assignee: 'Sarah Wilson',
        priority: 'Medium',
        issueType: 'Task',
        created: '2024-01-16T08:30:00.000Z',
        updated: '2024-01-23T10:20:00.000Z',
      },
      {
        id: '1005',
        key: 'PROJ-105',
        summary: 'Update documentation',
        status: 'In Progress',
        assignee: 'Tom Brown',
        priority: 'Low',
        issueType: 'Task',
        created: '2024-01-18T13:45:00.000Z',
        updated: '2024-01-24T09:30:00.000Z',
      },
      {
        id: '1006',
        key: 'PROJ-106',
        summary: 'Implement dark mode toggle',
        status: 'Ready for Production',
        assignee: 'Lisa Chen',
        priority: 'Medium',
        issueType: 'Story',
        created: '2024-01-20T11:15:00.000Z',
        updated: '2024-01-25T14:45:00.000Z',
      },
    ];
  }
} 