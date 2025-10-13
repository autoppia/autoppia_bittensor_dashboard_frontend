/* src/data/websites-data.ts */

export type UseCase = {
  name: string;
  examplePrompt: string[];
};

export type TaskExample = {
  title: string;
  prompt: string;
};

export type WebsiteDataType = {
  name: string;
  portValidator: string;
  href: string;
  origin: string;
  totalTasks: number[]; // [easy, medium, hard]
  image: string;
  isComingSoon?: boolean;
  color: string;
  description?: string;
  useCases: UseCase[]; // already added
  taskExamples?: TaskExample[]; // NEW: Task Examples
  comingSoonNote?: string; // NEW: note to show under section
};
/**
 *  Lista de webs con su puerto público del validador.
 *  Se usa en <FilterBoard /> para construir el filtro "Ports".
 */

export const websitesData: WebsiteDataType[] = [
  {
    name: "Autoppia Cinema",
    portValidator: "8000",
    href: "http://autocinema.autoppia.com",
    origin: "Movie Database",
    totalTasks: [30, 20, 12],
    image: "/images/web1.png",
    color: "#9333EA",
    description: "Movie catalog with search, reviews, and user management.",
    useCases: [
      {
        name: "Registration",
        examplePrompt: [
          "Register with the following username:johndoe,email:johndoe@gmail.com and password:mypass123",
          "Create a new account with username:sarahlee,email:sarahlee@gmail.com and password:secure456",
        ],
      },
      {
        name: "Login",
        examplePrompt: [
          "Login for the following username:user123 and password:password123",
          "Sign in to the website username:admin and password:admin123",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "Autoppia Books",
    portValidator: "8001",
    href: "http://autobooks.autoppia.com",
    origin: "Book Store",
    totalTasks: [28, 18, 10],
    image: "/images/web2.png",
    color: "#10B981",
    description:
      "Book store with shopping cart, reviews, and e-commerce features.",
    useCases: [
      {
        name: "Registration",
        examplePrompt: [
          "Register with the following username:bookworm,email:bookworm@gmail.com and password:read123",
          "Create a new account with username:reader99,email:reader99@gmail.com and password:pages456",
        ],
      },
      {
        name: "Login",
        examplePrompt: [
          "Login for the following username:bookfan and password:book123",
          "Sign in to the website username:author1 and password:write456",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "Autozone",
    portValidator: "8002",
    href: "http://autozone.autoppia.com",
    origin: "Amazon",
    totalTasks: [25, 15, 8],
    image: "/images/web3.png",
    color: "#EF4444",
    description:
      "E-commerce storefront for product search, carts, and checkout.",
    useCases: [
      {
        name: "View Product Detail",
        examplePrompt: [
          "Show me details for the Espresso Machine",
          "View product page for a 'Kitchen' item with rating above 4.6",
        ],
      },
      {
        name: "Search Product",
        examplePrompt: [
          "Search for kitchen appliances",
          "Find products matching 'Espresso Machine'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoDining",
    portValidator: "8003",
    href: "http://autodining.autoppia.com",
    origin: "OpenTable",
    totalTasks: [22, 14, 9],
    image: "/images/web4.png",
    color: "#F59E0B",
    description:
      "Restaurant booking platform with search, menus, and reservations.",
    useCases: [
      {
        name: "Date Dropdown Opened",
        examplePrompt: [
          "Open the date selector for my booking.",
          "Click on the calendar icon to select a date after June 15th.",
        ],
      },
      {
        name: "Time Dropdown Opened",
        examplePrompt: [
          "Click on the time field to choose a reservation time.",
          "Open the time selector for dinner",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoCRM",
    portValidator: "8004",
    href: "http://autocrm.autoppia.com",
    origin: "Legal CRM",
    totalTasks: [26, 16, 11],
    image: "/images/web5.png",
    color: "#3B82F6",
    description:
      "Legal case management with matters, clients, documents, and time tracking.",
    useCases: [
      {
        name: "View Matter Details",
        examplePrompt: [
          "Go to the Matters page and click on 'Estate Planning' to view the details of that particular matter",
          "View details of the matter whose client name is 'Jones Legal'",
        ],
      },
      {
        name: "Add New Matter",
        examplePrompt: [
          "Create a matter named 'New Matter', with client 'Acme Co.' and status 'Active'.",
          "Add a new matter where the name is not 'Employment Agreement' and the client is 'Delta Partners'.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoMail",
    portValidator: "8005",
    href: "http://automail.autoppia.com",
    origin: "Gmail",
    totalTasks: [24, 15, 10],
    image: "/images/web6.png",
    color: "#8B5CF6",
    description:
      "Email client with compose, labels, search, and organization features.",
    useCases: [
      {
        name: "View Email",
        examplePrompt: [
          "View the email where email_from equals 'alice.smith@company.com' and subject equals 'Project Kickoff Meeting'",
          "View the email where subject contains 'Update'",
        ],
      },
      {
        name: "Star Email",
        examplePrompt: [
          "Star the email where from_email equals 'grace.lee@company.com' and subject equals 'Team Outing Plan'",
          "Star the email with ID 'email7'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoDelivery",
    portValidator: "8006",
    href: "http://autodelivery.autoppia.com",
    origin: "Uber Eats",
    totalTasks: [27, 17, 12],
    image: "/images/web7.png",
    color: "#EC4899",
    description:
      "Food delivery platform with restaurant search, cart, and order placement.",
    useCases: [
      {
        name: "Search Restaurant",
        examplePrompt: [
          "Search for restaurants serving Italian cuisine.",
          "Find restaurants with 'Sushi' in their name.",
        ],
      },
      {
        name: "View Restaurant",
        examplePrompt: [
          "View details for 'Pizza Palace'.",
          "Show me the menu of the restaurant with cuisine 'Japanese'.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoLodge",
    portValidator: "8007",
    href: "http://autolodge.autoppia.com",
    origin: "Airbnb",
    totalTasks: [25, 16, 10],
    image: "/images/web8.png",
    color: "#06B6D4",
    description:
      "Hotel and lodging booking platform with search, wishlist, and reservations.",
    useCases: [
      {
        name: "Search Hotel",
        examplePrompt: [
          "Search for hotels where search term is Murree from July 25 to July 28 for 2 adults and 1 child",
          "Find a hotel where search term is Mall Road for 3 adults and 1 infant",
        ],
      },
      {
        name: "View Hotel",
        examplePrompt: [
          "I like the one in Murree with 5-star rating and free breakfast. Can you show me more about it?",
          "Show me the villa hosted by someone with great reviews - the one that says 'hosted since 2016'.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoConnect",
    portValidator: "8008",
    href: "http://autoconnect.autoppia.com",
    origin: "LinkedIn",
    totalTasks: [23, 14, 9],
    image: "/images/web9.png",
    color: "#0EA5E9",
    description:
      "Professional networking platform with profiles, posts, jobs, and connections.",
    useCases: [
      {
        name: "View User Profile",
        examplePrompt: [
          "View the profile of user 'janedoe'.",
          "Open Jane Doe's profile from a post header.",
        ],
      },
      {
        name: "Connect with User",
        examplePrompt: [
          "Connect with Jane Doe.",
          "Send a connection request to John Smith.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoWork",
    portValidator: "8009",
    href: "http://autowork.autoppia.com",
    origin: "Upwork",
    totalTasks: [21, 13, 8],
    image: "/images/web10.png",
    color: "#14B8A6",
    description:
      "Freelancer and consultant hiring platform with job postings and bookings.",
    useCases: [
      {
        name: "Book a Consultation",
        examplePrompt: [
          "Book a consultation whose name is 'Alexa R'",
          "Book a consultation whose rate is $40.00/hr",
        ],
      },
      {
        name: "Hire Button Clicked",
        examplePrompt: [
          "Hire a consultant whose name is 'Brandon M'",
          "Hire a consultant whose country is 'Morocco'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoCalendar",
    portValidator: "8010",
    href: "http://autocalendar.autoppia.com",
    origin: "Google Calendar",
    totalTasks: [29, 18, 11],
    image: "/images/web11.png",
    color: "#A855F7",
    description:
      "Calendar application with events, reminders, attendees, and multiple views.",
    useCases: [
      {
        name: "Select Month View",
        examplePrompt: [
          "Switch to month view please.",
          "Show me the entire month on the calendar.",
        ],
      },
      {
        name: "Select Week View",
        examplePrompt: [
          "Switch to week view please.",
          "Show me this week's schedule.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoList",
    portValidator: "8011",
    href: "http://autolist.autoppia.com",
    origin: "Trello/Asana",
    totalTasks: [24, 15, 9],
    image: "/images/web12.png",
    color: "#F97316",
    description:
      "Task and team management platform with priorities, dates, and collaboration.",
    useCases: [
      {
        name: "Add Task Clicked",
        examplePrompt: [
          "Click on the Add Task button to start.",
          "Please click the Add Task button.",
        ],
      },
      {
        name: "Select Date for Task",
        examplePrompt: [
          "Set the date for this task to tomorrow.",
          "Pick next Friday as the due date.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
];

export const websitesDataMap = websitesData.reduce(
  (acc, website) => {
    acc[website.name] = website;
    return acc;
  },
  {} as Record<string, WebsiteDataType>
);
