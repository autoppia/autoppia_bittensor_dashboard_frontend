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
    description: "E-commerce storefront for product search, carts, and checkout.",
    useCases: [
      { name: "Search & Filter", examplePrompt: "Find wireless headphones under $100 and sort by rating." },
      { name: "Add to Cart", examplePrompt: "Add the top result to the cart and open the cart." },
      { name: "Checkout Flow", examplePrompt: "Proceed to checkout and stop at the payment step." },
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
    description: "Food discovery and ordering with filters and scheduling.",
    useCases: [
      { name: "Find Restaurant", examplePrompt: "Find nearby Italian restaurants open tonight." },
      { name: "Place Order", examplePrompt: "Order a Margherita pizza for pickup at 7pm." },
      { name: "Dietary Filters", examplePrompt: "Show vegetarian and gluten-free options." },
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
    description: "Lightweight CRM for leads, pipelines, and reporting.",
    useCases: [
      { name: "Create Lead", examplePrompt: "Create a lead for 'Acme Corp' with priority High." },
      { name: "Update Pipeline", examplePrompt: "Move 'Acme Corp' to the Negotiation stage." },
      { name: "Export CSV", examplePrompt: "Export this week’s opportunities as CSV." },
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
    description: "Webmail client for composing, searching, and labeling messages.",
    useCases: [
      { name: "Compose Email", examplePrompt: "Draft an email to Bruno about tomorrow’s meeting." },
      { name: "Search Thread", examplePrompt: "Find emails with subject 'Invoice' from last month." },
      { name: "Label & Archive", examplePrompt: "Label the latest invoice 'Finance' and archive it." },
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
    description: "Delivery portal for orders, tracking, and address management.",
    useCases: [
      { name: "Track Order", examplePrompt: "Track the latest delivery status." },
      { name: "Schedule Delivery", examplePrompt: "Schedule a delivery for tomorrow at 3pm." },
      { name: "Update Address", examplePrompt: "Change the delivery address to Office HQ." },
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
    description: "Lodging search and booking with rich filters.",
    useCases: [
      { name: "Search Stays", examplePrompt: "Find stays in Lisbon for 2 guests next weekend." },
      { name: "Apply Filters", examplePrompt: "Show places with Wi-Fi and self check-in." },
      { name: "Request Booking", examplePrompt: "Request a 2-night booking and review total price." },
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
    description: "Professional networking for profiles, jobs, and messaging.",
    useCases: [
      { name: "Find Profiles", examplePrompt: "Find React developers in Berlin." },
      { name: "Connect & Message", examplePrompt: "Send a connection request with a short note." },
      { name: "Jobs & Save", examplePrompt: "Search 'Frontend Engineer' and save two jobs." },
    ],
  },
  // New websites
  {
    name: "AutoWork",
    portValidator: "8009",
    href: "https://autonetwork.autoppia.com",
    origin: "Work",
    totalTasks: [35, 20, 12],
    image: "/images/web10.png",
    isComingSoon: true,
    color: "#06B6D4", // cyan-500
    description: "Work hub with tasks, search, and exports.",
    useCases: [
      { name: "Quick Start", examplePrompt: "Open the dashboard and review today’s tasks." },
      { name: "Search Content", examplePrompt: "Search for 'Quarterly report' and open the latest." },
      { name: "Export/Share", examplePrompt: "Export the current view as PDF." },
    ],
  },
  {
    name: "AutoCalendar",
    portValidator: "8010",
    href: "https://autocalendar.autoppia.com",
    origin: "Calendar",
    totalTasks: [40, 25, 15],
    image: "/images/web11.png",
    isComingSoon: true,
    color: "#0EA5E9", // sky-500
    description: "Calendar for events, availability, and invites.",
    useCases: [
      { name: "Create Event", examplePrompt: "Create 'Team Sync' on Wednesday 17–18h." },
      { name: "Find Availability", examplePrompt: "Find a 30-minute slot this week." },
      { name: "Share Invite", examplePrompt: "Invite Alex and Bruno to the event." },
    ],
  },
  {
    name: "AutoList",
    portValidator: "8011",
    href: "https://autolist.autoppia.com",
    origin: "Coursera",
    totalTasks: [28, 18, 10],
    image: "/images/web12.png",
    isComingSoon: true,
    color: "#3B82F6", // blue-500
    description: "Course catalog for browsing, enrolling, and progress.",
    useCases: [
      { name: "Browse Courses", examplePrompt: "Find a beginner Python course and save it." },
      { name: "Enroll Flow", examplePrompt: "Start enrollment and review pricing." },
      { name: "Progress Check", examplePrompt: "Open 'Saved' and view progress." },
    ],
  },
  // Coming soon websites
  {
    name: "AutoDrive",
    portValidator: "8012",
    href: "https://autodrive.autoppia.com",
    origin: "Facebook",
    totalTasks: [0, 0, 0],
    image: "/images/web13.png",
    isComingSoon: true,
    color: "#6366F1", // indigo-500
    description: "Social hub for pages, posts, and messaging.",
    useCases: [
      { name: "Search Pages", examplePrompt: "Find the company page for 'Autoppia'." },
      { name: "Create Post", examplePrompt: "Draft a post announcing a new feature." },
      { name: "Send Message", examplePrompt: "Open Messenger and start a chat with support." },
    ],
  },
  {
    name: "AutoVideo",
    portValidator: "8013",
    href: "#",
    origin: "YouTube",
    totalTasks: [0, 0, 0],
    image: "/images/web5.png",
    isComingSoon: true,
    color: "#8B5CF6", // violet-500
    description: "Video platform for search, playlists, and playback controls.",
    useCases: [
      { name: "Search Videos", examplePrompt: "Find tutorials on Next.js App Router." },
      { name: "Playlist Save", examplePrompt: "Save two videos to a 'Study' playlist." },
      { name: "Captions/Speed", examplePrompt: "Enable captions and set speed to 1.5×." },
    ],
  },
  {
    name: "AutoMusic",
    portValidator: "8014",
    href: "#",
    origin: "Spotify",
    totalTasks: [0, 0, 0],
    image: "/images/web6.png",
    isComingSoon: true,
    color: "#A855F7", // purple-500
    description: "Music streaming for discovery, playlists, and following artists.",
    useCases: [
      { name: "Find Tracks", examplePrompt: "Search lofi study music and play a track." },
      { name: "Create Playlist", examplePrompt: "Create a playlist named 'Focus' and add two songs." },
      { name: "Follow Artist", examplePrompt: "Follow the artist 'Tycho'." },
    ],
  },
  {
    name: "AutoTravel",
    portValidator: "8015",
    href: "#",
    origin: "Expedia",
    totalTasks: [0, 0, 0],
    image: "/images/web7.png",
    isComingSoon: true,
    color: "#D946EF", // fuchsia-500
    description: "Travel booking for flights, stays, and bundles.",
    useCases: [
      { name: "Search Flights", examplePrompt: "Search Lisbon → Berlin next month." },
      { name: "Filter & Sort", examplePrompt: "Filter by non-stop and sort by price." },
      { name: "Bundle Review", examplePrompt: "Add a hotel and review the total price." },
    ],
  },
];

export const websitesDataMap = websitesData.reduce(
  (acc, website) => {
    acc[website.name] = website;
    return acc;
  },
  {} as Record<string, WebsiteDataType>
);
