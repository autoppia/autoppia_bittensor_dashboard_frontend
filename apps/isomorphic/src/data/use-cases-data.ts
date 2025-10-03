export type UseCaseType = {
  id: string;
  name: string;
  website: string;
  examplePrompt: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export const useCasesData: UseCaseType[] = [
  // Autozone
  {
    id: 'autozone_filter_products',
    name: 'FILTER_PRODUCTS',
    website: 'Autozone',
    examplePrompt: 'Filter products by category "Automotive Parts" and sort by price low to high',
    difficulty: 'easy',
  },
  {
    id: 'autozone_search',
    name: 'SEARCH_PRODUCT',
    website: 'Autozone',
    examplePrompt: 'Search for "brake pads" and add the first result to cart',
    difficulty: 'medium',
  },
  {
    id: 'autozone_checkout',
    name: 'CHECKOUT',
    website: 'Autozone',
    examplePrompt: 'Complete the checkout process with test payment information',
    difficulty: 'hard',
  },
  
  // AutoDining
  {
    id: 'autodining_filter_restaurants',
    name: 'FILTER_RESTAURANTS',
    website: 'AutoDining',
    examplePrompt: 'Find Italian restaurants open now with rating above 4 stars',
    difficulty: 'easy',
  },
  {
    id: 'autodining_make_reservation',
    name: 'MAKE_RESERVATION',
    website: 'AutoDining',
    examplePrompt: 'Make a reservation for 2 people at 7 PM tonight',
    difficulty: 'medium',
  },
  {
    id: 'autodining_review',
    name: 'LEAVE_REVIEW',
    website: 'AutoDining',
    examplePrompt: 'Write a 5-star review for the most recent restaurant visited',
    difficulty: 'easy',
  },
  
  // AutoCRM
  {
    id: 'autocrm_create_contact',
    name: 'CREATE_CONTACT',
    website: 'AutoCRM',
    examplePrompt: 'Create a new contact with name "John Doe" and email "john@example.com"',
    difficulty: 'easy',
  },
  {
    id: 'autocrm_filter_leads',
    name: 'FILTER_LEADS',
    website: 'AutoCRM',
    examplePrompt: 'Filter leads by status "Hot" and industry "Technology"',
    difficulty: 'medium',
  },
  {
    id: 'autocrm_create_deal',
    name: 'CREATE_DEAL',
    website: 'AutoCRM',
    examplePrompt: 'Create a new deal worth $50,000 with expected close date next month',
    difficulty: 'hard',
  },
  
  // AutoMail
  {
    id: 'automail_compose',
    name: 'COMPOSE_EMAIL',
    website: 'AutoMail',
    examplePrompt: 'Compose an email to team@example.com with subject "Project Update"',
    difficulty: 'easy',
  },
  {
    id: 'automail_filter',
    name: 'FILTER_EMAILS',
    website: 'AutoMail',
    examplePrompt: 'Filter unread emails from last week and mark them as important',
    difficulty: 'medium',
  },
  {
    id: 'automail_organize',
    name: 'ORGANIZE_INBOX',
    website: 'AutoMail',
    examplePrompt: 'Create a label "Work" and move all emails from domain company.com to it',
    difficulty: 'hard',
  },
  
  // AutoDelivery
  {
    id: 'autodelivery_search_restaurants',
    name: 'SEARCH_RESTAURANTS',
    website: 'AutoDelivery',
    examplePrompt: 'Search for Chinese restaurants with delivery time under 30 minutes',
    difficulty: 'easy',
  },
  {
    id: 'autodelivery_place_order',
    name: 'PLACE_ORDER',
    website: 'AutoDelivery',
    examplePrompt: 'Order a large pepperoni pizza and add delivery instructions',
    difficulty: 'medium',
  },
  {
    id: 'autodelivery_track_order',
    name: 'TRACK_ORDER',
    website: 'AutoDelivery',
    examplePrompt: 'Track the status of the most recent order and get estimated delivery time',
    difficulty: 'easy',
  },
  
  // AutoLodge
  {
    id: 'autolodge_search',
    name: 'SEARCH_PROPERTIES',
    website: 'AutoLodge',
    examplePrompt: 'Search for properties in San Francisco for 2 guests, check-in next Friday',
    difficulty: 'easy',
  },
  {
    id: 'autolodge_filter',
    name: 'FILTER_PROPERTIES',
    website: 'AutoLodge',
    examplePrompt: 'Filter properties with WiFi, kitchen, and price under $200 per night',
    difficulty: 'medium',
  },
  {
    id: 'autolodge_book',
    name: 'BOOK_PROPERTY',
    website: 'AutoLodge',
    examplePrompt: 'Book the highest-rated property for 3 nights with guest details',
    difficulty: 'hard',
  },
  
  // AutoConnect
  {
    id: 'autoconnect_search_people',
    name: 'SEARCH_PEOPLE',
    website: 'AutoConnect',
    examplePrompt: 'Search for Software Engineers in the Bay Area with 5+ years experience',
    difficulty: 'easy',
  },
  {
    id: 'autoconnect_send_connection',
    name: 'SEND_CONNECTION',
    website: 'AutoConnect',
    examplePrompt: 'Send connection request to the first 3 search results with a custom message',
    difficulty: 'medium',
  },
  {
    id: 'autoconnect_post_update',
    name: 'POST_UPDATE',
    website: 'AutoConnect',
    examplePrompt: 'Create a professional post about AI trends with relevant hashtags',
    difficulty: 'medium',
  },
];

export const getUseCasesByWebsite = (websiteName: string): UseCaseType[] => {
  return useCasesData.filter((useCase) => useCase.website === websiteName);
};
