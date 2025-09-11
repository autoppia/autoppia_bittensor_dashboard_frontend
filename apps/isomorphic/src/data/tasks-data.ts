export type TaskDataType = {
  id: string;
  prompt: string;
  website: string;
  use_case: string;
  validator_uid: number;
  success_rate: number;
  created_at: string;
};

export const tasksData: TaskDataType[] = [
  {
    id: '3413',
    prompt: 'Buy a product which has a price of 1000',
    website: 'Autozone',
    use_case: 'buy_product',
    validator_uid: 13,
    success_rate: 75,
    created_at: '2023-07-22T10:53:43.612Z',
  },
  {
    id: '3414',
    prompt: 'Find and book a table for 4 people at 7 PM tonight',
    website: 'AutoDining',
    use_case: 'book_reservation',
    validator_uid: 195,
    success_rate: 45,
    created_at: '2023-07-23T14:20:15.123Z',
  },
  {
    id: '3415',
    prompt: 'Create a new customer profile with contact information',
    website: 'AutoCRM',
    use_case: 'create_customer',
    validator_uid: 3,
    success_rate: 88,
    created_at: '2023-07-24T09:15:30.456Z',
  },
  {
    id: '3416',
    prompt: 'Send a promotional email to all subscribers',
    website: 'AutoMail',
    use_case: 'send_email',
    validator_uid: 71,
    success_rate: 62,
    created_at: '2023-07-25T16:45:22.789Z',
  },
  {
    id: '3417',
    prompt: 'Track delivery status for order #12345',
    website: 'AutoDelivery',
    use_case: 'track_delivery',
    validator_uid: 46,
    success_rate: 90,
    created_at: '2023-07-26T11:30:45.012Z',
  },
  {
    id: '3418',
    prompt: 'Book a hotel room for 2 nights starting tomorrow',
    website: 'AutoLodge',
    use_case: 'book_hotel',
    validator_uid: 181,
    success_rate: 38,
    created_at: '2023-07-27T13:25:18.345Z',
  },
  {
    id: '3419',
    prompt: 'Connect to the company VPN network',
    website: 'AutoConnect',
    use_case: 'vpn_connection',
    validator_uid: 13,
    success_rate: 82,
    created_at: '2023-07-28T08:40:33.678Z',
  },
  {
    id: '3420',
    prompt: 'Search for automotive parts by vehicle model',
    website: 'Autozone',
    use_case: 'search_parts',
    validator_uid: 195,
    success_rate: 67,
    created_at: '2023-07-29T15:55:27.901Z',
  },
  {
    id: '3421',
    prompt: 'Update customer preferences in the system',
    website: 'AutoCRM',
    use_case: 'update_customer',
    validator_uid: 3,
    success_rate: 55,
    created_at: '2023-07-30T12:10:41.234Z',
  },
  {
    id: '3422',
    prompt: 'Schedule a delivery for next Tuesday',
    website: 'AutoDelivery',
    use_case: 'schedule_delivery',
    validator_uid: 71,
    success_rate: 73,
    created_at: '2023-07-31T17:35:54.567Z',
  },
  {
    id: '3423',
    prompt: 'Find restaurants near my location',
    website: 'AutoDining',
    use_case: 'find_restaurants',
    validator_uid: 46,
    success_rate: 41,
    created_at: '2023-08-01T10:20:12.890Z',
  },
  {
    id: '3424',
    prompt: 'Send automated follow-up email to leads',
    website: 'AutoMail',
    use_case: 'automated_email',
    validator_uid: 181,
    success_rate: 30,
    created_at: '2023-08-02T14:45:36.123Z',
  },
  {
    id: '3425',
    prompt: 'Check hotel availability for weekend stay',
    website: 'AutoLodge',
    use_case: 'check_availability',
    validator_uid: 13,
    success_rate: 79,
    created_at: '2023-08-03T09:15:49.456Z',
  },
  {
    id: '3426',
    prompt: 'Establish secure connection to remote server',
    website: 'AutoConnect',
    use_case: 'secure_connection',
    validator_uid: 195,
    success_rate: 84,
    created_at: '2023-08-04T16:30:02.789Z',
  },
  {
    id: '3427',
    prompt: 'Process return for defective automotive part',
    website: 'Autozone',
    use_case: 'process_return',
    validator_uid: 3,
    success_rate: 36,
    created_at: '2023-08-05T11:50:15.012Z',
  },
];

export const tasksDataMap = tasksData.reduce((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {} as Record<string, TaskDataType>);