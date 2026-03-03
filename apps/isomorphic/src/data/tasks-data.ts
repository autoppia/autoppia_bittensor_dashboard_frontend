export type TaskDataType = {
  id: string;
  prompt: string;
  website: string;
  use_case: string;
  successRate: number;
  score: number;
  solutionTime: number; // in seconds
  createdAt: string;
  agentRunId: string; // Agent run ID this task belongs to
};

export const tasksData: TaskDataType[] = [
  {
    id: '3413',
    prompt: 'Buy a product which has a price of 1000',
    website: 'Autozone',
    use_case: 'buy_product',
    successRate: 75,
    score: 0.82,
    solutionTime: 45,
    createdAt: '2023-07-22T10:53:43.612Z',
    agentRunId: 'round_020_1',
  },
  {
    id: '3414',
    prompt: 'Find and book a table for 4 people at 7 PM tonight',
    website: 'AutoDining',
    use_case: 'book_reservation',
    successRate: 45,
    score: 0.61,
    solutionTime: 78,
    createdAt: '2023-07-23T14:20:15.123Z',
    agentRunId: 'round_020_2',
  },
  {
    id: '3415',
    prompt: 'Create a new customer profile with contact information',
    website: 'AutoCRM',
    use_case: 'create_customer',
    successRate: 88,
    score: 0.93,
    solutionTime: 32,
    createdAt: '2023-07-24T09:15:30.456Z',
    agentRunId: 'round_020_3',
  },
  {
    id: '3416',
    prompt: 'Send a promotional email to all subscribers',
    website: 'AutoMail',
    use_case: 'send_email',
    successRate: 62,
    score: 0.74,
    solutionTime: 56,
    createdAt: '2023-07-25T16:45:22.789Z',
    agentRunId: 'round_020_4',
  },
  {
    id: '3417',
    prompt: 'Track delivery status for order #12345',
    website: 'AutoDelivery',
    use_case: 'track_delivery',
    successRate: 90,
    score: 0.95,
    solutionTime: 28,
    createdAt: '2023-07-26T11:30:45.012Z',
    agentRunId: 'round_020_5',
  },
  {
    id: '3418',
    prompt: 'Book a hotel room for 2 nights starting tomorrow',
    website: 'AutoLodge',
    use_case: 'book_hotel',
    successRate: 38,
    score: 0.58,
    solutionTime: 92,
    createdAt: '2023-07-27T13:25:18.345Z',
    agentRunId: 'round_020_6',
  },
  {
    id: '3419',
    prompt: 'Connect to the company VPN network',
    website: 'AutoConnect',
    use_case: 'vpn_connection',
    successRate: 82,
    score: 0.87,
    solutionTime: 38,
    createdAt: '2023-07-28T08:40:33.678Z',
    agentRunId: 'round_020_7',
  },
  {
    id: '3420',
    prompt: 'Search for automotive parts by vehicle model',
    website: 'Autozone',
    use_case: 'search_parts',
    successRate: 67,
    score: 0.76,
    solutionTime: 52,
    createdAt: '2023-07-29T15:55:27.901Z',
    agentRunId: 'round_020_8',
  },
  {
    id: '3421',
    prompt: 'Update customer preferences in the system',
    website: 'AutoCRM',
    use_case: 'update_customer',
    successRate: 55,
    score: 0.69,
    solutionTime: 64,
    createdAt: '2023-07-30T12:10:41.234Z',
    agentRunId: 'round_020_9',
  },
  {
    id: '3422',
    prompt: 'Schedule a delivery for next Tuesday',
    website: 'AutoDelivery',
    use_case: 'schedule_delivery',
    successRate: 73,
    score: 0.80,
    solutionTime: 47,
    createdAt: '2023-07-31T17:35:54.567Z',
    agentRunId: 'round_019_1',
  },
  {
    id: '3423',
    prompt: 'Find restaurants near my location',
    website: 'AutoDining',
    use_case: 'find_restaurants',
    successRate: 41,
    score: 0.59,
    solutionTime: 85,
    createdAt: '2023-08-01T10:20:12.890Z',
    agentRunId: 'round_019_2',
  },
  {
    id: '3424',
    prompt: 'Send automated follow-up email to leads',
    website: 'AutoMail',
    use_case: 'automated_email',
    successRate: 30,
    score: 0.48,
    solutionTime: 108,
    createdAt: '2023-08-02T14:45:36.123Z',
    agentRunId: 'round_019_3',
  },
  {
    id: '3425',
    prompt: 'Check hotel availability for weekend stay',
    website: 'AutoLodge',
    use_case: 'check_availability',
    successRate: 79,
    score: 0.84,
    solutionTime: 41,
    createdAt: '2023-08-03T09:15:49.456Z',
    agentRunId: 'round_019_4',
  },
  {
    id: '3426',
    prompt: 'Establish secure connection to remote server',
    website: 'AutoConnect',
    use_case: 'secure_connection',
    successRate: 84,
    score: 0.89,
    solutionTime: 35,
    createdAt: '2023-08-04T16:30:02.789Z',
    agentRunId: 'round_019_5',
  },
  {
    id: '3427',
    prompt: 'Process return for defective automotive part',
    website: 'Autozone',
    use_case: 'process_return',
    successRate: 36,
    score: 0.52,
    solutionTime: 95,
    createdAt: '2023-08-05T11:50:15.012Z',
    agentRunId: 'round_019_6',
  },
];

export const tasksDataMap = tasksData.reduce((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {} as Record<string, TaskDataType>);

// Function to get agent run ID for a task
export const getAgentRunIdForTask = (taskId: string): string | null => {
  const task = tasksDataMap[taskId];
  return task?.agentRunId || null;
};
