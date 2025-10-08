/* src/data/websites-data.ts */

export type UseCase = {
  name: string;
  examplePrompt: string;
};

export type WebsiteDataType = {
  name: string;
  portValidator: string; // ← puerto que usa el validador
  href: string;
  origin: string;
  totalTasks: number[]; // [easy, medium, hard]
  image: string;
  isComingSoon?: boolean; // New field for "soon" websites
  color: string; // Add color property
  description?: string; // Short description
  useCases?: UseCase[]; // List of use cases
};

/**
 *  Lista de webs con su puerto público del validador.
 *  Se usa en <FilterBoard /> para construir el filtro "Ports".
 */
export const websitesData: WebsiteDataType[] = [
  {
    name: "Autozone",
    portValidator: "8002",
    href: "http://autozone.autoppia.com",
    origin: "Amazon",
    totalTasks: [25, 15, 8],
    image: "/images/web1.png",
    color: "#EF4444", // red-500
    description:
      "E-commerce platform for automotive parts and accessories with advanced search and filtering capabilities.",
    useCases: [
      {
        name: "Product Search",
        examplePrompt: "Find all brake pads for a 2015 Honda Civic",
      },
      {
        name: "Price Comparison",
        examplePrompt: "Compare prices of oil filters across different brands",
      },
      {
        name: "Order Tracking",
        examplePrompt: "Track my order #AZ12345 and show delivery status",
      },
      {
        name: "Product Reviews",
        examplePrompt: "Show me reviews for Bosch windshield wipers",
      },
    ],
  },
  {
    name: "AutoDining",
    portValidator: "8003",
    href: "http://autodining.autoppia.com",
    origin: "OpenDining",
    totalTasks: [32, 18, 10],
    image: "/images/web2.png",
    color: "#F97316", // orange-500
    description:
      "Restaurant discovery and reservation platform with real-time availability and menu browsing.",
    useCases: [
      {
        name: "Restaurant Search",
        examplePrompt:
          "Find Italian restaurants near downtown with outdoor seating",
      },
      {
        name: "Make Reservation",
        examplePrompt: "Book a table for 4 people at 7 PM this Saturday",
      },
      {
        name: "Menu Browsing",
        examplePrompt: "Show me the dinner menu for The Olive Garden",
      },
      {
        name: "Reviews & Ratings",
        examplePrompt: "What are the top-rated sushi restaurants in the area?",
      },
    ],
  },
  {
    name: "AutoCRM",
    portValidator: "8004",
    href: "http://autocrm.autoppia.com",
    origin: "ClientCRM",
    totalTasks: [20, 12, 6],
    image: "/images/web3.png",
    color: "#EAB308", // yellow-500
    description:
      "Customer relationship management system for tracking leads, contacts, and sales pipelines.",
    useCases: [
      {
        name: "Contact Management",
        examplePrompt: "Show me all contacts from the technology sector",
      },
      {
        name: "Lead Tracking",
        examplePrompt: "Update the status of lead #12345 to 'qualified'",
      },
      {
        name: "Pipeline Analytics",
        examplePrompt:
          "What's the total value of deals in the negotiation stage?",
      },
      {
        name: "Task Management",
        examplePrompt: "Create a follow-up task for John Doe next Tuesday",
      },
    ],
  },
  {
    name: "AutoMail",
    portValidator: "8005",
    href: "http://automail.autoppia.com",
    origin: "Gmail",
    totalTasks: [28, 16, 9],
    image: "/images/web4.png",
    color: "#84CC16", // lime-500
    description:
      "Email management platform with advanced search, filtering, and organization features.",
    useCases: [
      {
        name: "Email Search",
        examplePrompt:
          "Find all emails from last week about the project proposal",
      },
      {
        name: "Compose Email",
        examplePrompt: "Draft an email to the team about tomorrow's meeting",
      },
      {
        name: "Label Organization",
        examplePrompt:
          "Move all unread emails from support to a 'pending' label",
      },
      {
        name: "Attachment Management",
        examplePrompt:
          "Show me all emails with PDF attachments from this month",
      },
    ],
  },
  {
    name: "AutoDelivery",
    portValidator: "8006",
    href: "http://autodelivery.autoppia.com",
    origin: "DashDish",
    totalTasks: [22, 14, 7],
    image: "/images/web5.png",
    color: "#22C55E", // green-500
    description:
      "Food delivery service platform with real-time tracking and restaurant partnerships.",
    useCases: [
      {
        name: "Order Food",
        examplePrompt: "Order a large pepperoni pizza from Joe's Pizzeria",
      },
      { name: "Track Delivery", examplePrompt: "Where is my order #DEL789?" },
      {
        name: "Browse Restaurants",
        examplePrompt:
          "Show me restaurants offering Thai food with delivery under 30 minutes",
      },
      {
        name: "Reorder Previous",
        examplePrompt: "Reorder my last meal from yesterday",
      },
    ],
  },
  {
    name: "AutoLodge",
    portValidator: "8007",
    href: "http://autolodge.autoppia.com",
    origin: "AirBnB",
    totalTasks: [18, 11, 5],
    image: "/images/web6.png",
    color: "#10B981", // emerald-500
    description:
      "Vacation rental and accommodation booking platform with property search and booking management.",
    useCases: [
      {
        name: "Property Search",
        examplePrompt: "Find a 2-bedroom apartment in Paris for next month",
      },
      {
        name: "Book Accommodation",
        examplePrompt: "Reserve this property from June 1-7",
      },
      {
        name: "View Amenities",
        examplePrompt: "What amenities are included in this listing?",
      },
      {
        name: "Manage Booking",
        examplePrompt: "Cancel my reservation for booking #AL456",
      },
    ],
  },
  {
    name: "AutoConnect",
    portValidator: "8008",
    href: "http://autoconnect.autoppia.com",
    origin: "LinkedIn",
    totalTasks: [30, 17, 9],
    image: "/images/web7.png",
    color: "#14B8A6", // teal-500
    description:
      "Professional networking platform for career development, job searching, and business connections.",
    useCases: [
      {
        name: "Job Search",
        examplePrompt: "Find software engineer positions in San Francisco",
      },
      {
        name: "Network Connections",
        examplePrompt:
          "Send a connection request to Jane Smith with a personal note",
      },
      {
        name: "Profile Management",
        examplePrompt: "Update my profile headline to 'Senior Product Manager'",
      },
      {
        name: "Post Content",
        examplePrompt: "Share an article about AI trends with my network",
      },
    ],
  },
  // New websites
  {
    name: "AutoWork",
    portValidator: "8009",
    href: "https://autonetwork.autoppia.com",
    origin: "Work",
    totalTasks: [35, 20, 12],
    image: "/images/web10.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#06B6D4", // cyan-500
  },
  {
    name: "AutoCalendar",
    portValidator: "8010",
    href: "https://autocalendar.autoppia.com",
    origin: "Calendar",
    totalTasks: [40, 25, 15],
    image: "/images/web11.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#0EA5E9", // sky-500
  },
  {
    name: "AutoList",
    portValidator: "8011",
    href: "https://autolist.autoppia.com",
    origin: "Coursera",
    totalTasks: [28, 18, 10],
    image: "/images/web12.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#3B82F6", // blue-500
  },
  // Coming soon websites
  {
    name: "AutoDrive",
    portValidator: "8012",
    href: "https://autodrive.autoppia.com",
    origin: "Facebook",
    totalTasks: [0, 0, 0],
    image: "/images/web13.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#6366F1", // indigo-500
  },
  {
    name: "AutoVideo",
    portValidator: "8013",
    href: "#",
    origin: "YouTube",
    totalTasks: [0, 0, 0],
    image: "/images/web5.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#8B5CF6", // violet-500
  },
  {
    name: "AutoMusic",
    portValidator: "8014",
    href: "#",
    origin: "Spotify",
    totalTasks: [0, 0, 0],
    image: "/images/web6.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#A855F7", // purple-500
  },
  {
    name: "AutoTravel",
    portValidator: "8015",
    href: "#",
    origin: "Expedia",
    totalTasks: [0, 0, 0],
    image: "/images/web7.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#D946EF", // fuchsia-500
  },
];

export const websitesDataMap = websitesData.reduce(
  (acc, website) => {
    acc[website.name] = website;
    return acc;
  },
  {} as Record<string, WebsiteDataType>
);
