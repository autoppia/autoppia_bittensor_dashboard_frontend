/* src/data/websites-data.ts */

export type UseCase = {
  name: string;
  examplePrompt: string;
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
  useCases: UseCase[];           // already added
  taskExamples?: TaskExample[];  // NEW: Task Examples
  comingSoonNote?: string;       // NEW: note to show under section
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
    color: "#EF4444",
    description: "E-commerce storefront for product search, carts, and checkout.",
    useCases: [
      { name: "Search & Filter", examplePrompt: "Find wireless headphones under $100 and sort by rating." },
      { name: "Add to Cart", examplePrompt: "Add the top result to the cart and open the cart." },
      { name: "Checkout Flow", examplePrompt: "Proceed to checkout and stop at the payment step." },
      { name: "Order History", examplePrompt: "Open order history and reorder a previous item." },
    ],
    taskExamples: [
      { title: "Search Product", prompt: "Search 'USB-C hub' and open the first product." },
      { title: "Apply Filters", prompt: "Filter by Prime and 4★ & up." },
      { title: "Cart Review", prompt: "Add the item to cart and view subtotal." },
      { title: "Reorder Item", prompt: "Open order history and reorder the last purchase." },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoDining",
    portValidator: "8003",
    href: "http://autodining.autoppia.com",
    origin: "OpenDining",
    totalTasks: [32, 18, 10],
    image: "/images/web2.png",
    color: "#F97316",
    description: "Food discovery and ordering with filters and scheduling.",
    useCases: [
      { name: "Find Restaurant", examplePrompt: "Find nearby Italian restaurants open tonight." },
      { name: "Place Order", examplePrompt: "Order a Margherita pizza for pickup at 7pm." },
      { name: "Dietary Filters", examplePrompt: "Show vegetarian and gluten-free options." },
      { name: "Track Order Status", examplePrompt: "Track your active order and view ETA." },
    ],
    taskExamples: [
      { title: "Browse Menu", prompt: "Open 'Luigi’s' and view the pizza menu." },
      { title: "Customize Item", prompt: "Add extra cheese to the order." },
      { title: "Schedule Pickup", prompt: "Schedule pickup for 19:00." },
      { title: "Order Status", prompt: "Open the current order and check delivery ETA." },
    ],
    comingSoonNote: "Coming soon: full task catalog per difficulty.",
  },
  {
    name: "AutoCRM",
    portValidator: "8004",
    href: "http://autocrm.autoppia.com",
    origin: "ClientCRM",
    totalTasks: [20, 12, 6],
    image: "/images/web3.png",
    color: "#EAB308",
    description: "Lightweight CRM for leads, pipelines, and reporting.",
    useCases: [
      { name: "Create Lead", examplePrompt: "Create a lead for 'Acme Corp' with priority High." },
      { name: "Update Pipeline", examplePrompt: "Move 'Acme Corp' to the Negotiation stage." },
      { name: "Export CSV", examplePrompt: "Export this week’s opportunities as CSV." },
      { name: "Import Contacts", examplePrompt: "Import contacts from CSV and map fields." },
    ],
    taskExamples: [
      { title: "New Lead", prompt: "Add 'Globex' with owner Bruno." },
      { title: "Change Stage", prompt: "Move 'Globex' to Qualification." },
      { title: "Report", prompt: "Open 'Pipeline by Stage' and export CSV." },
      { title: "Bulk Import", prompt: "Import contacts from CSV and verify record count." },
    ],
    comingSoonNote: "More examples and templates coming soon.",
  },
  {
    name: "AutoMail",
    portValidator: "8005",
    href: "http://automail.autoppia.com",
    origin: "Gmail",
    totalTasks: [28, 16, 9],
    image: "/images/web4.png",
    color: "#84CC16",
    description: "Webmail client for composing, searching, and labeling messages.",
    useCases: [
      { name: "Compose Email", examplePrompt: "Draft an email to Bruno about tomorrow’s meeting." },
      { name: "Search Thread", examplePrompt: "Find emails with subject 'Invoice' from last month." },
      { name: "Label & Archive", examplePrompt: "Label the latest invoice 'Finance' and archive it." },
      { name: "Schedule Send", examplePrompt: "Schedule an email to send tomorrow at 9am." },
    ],
    taskExamples: [
      { title: "Compose Draft", prompt: "Compose a draft to alex@acme.com re: Project Alpha." },
      { title: "Search & Open", prompt: "Find 'Invoice' emails from last 30 days and open the latest." },
      { title: "Label & Archive", prompt: "Apply 'Finance' label and archive the thread." },
      { title: "Scheduled Send", prompt: "Schedule the draft to send tomorrow at 09:00." },
    ],
    comingSoonNote: "Thread ops and filters coming soon.",
  },
  {
    name: "AutoDelivery",
    portValidator: "8006",
    href: "http://autodelivery.autoppia.com",
    origin: "DashDish",
    totalTasks: [22, 14, 7],
    image: "/images/web5.png",
    color: "#22C55E",
    description: "Delivery portal for orders, tracking, and address management.",
    useCases: [
      { name: "Track Order", examplePrompt: "Track the latest delivery status." },
      { name: "Schedule Delivery", examplePrompt: "Schedule a delivery for tomorrow at 3pm." },
      { name: "Update Address", examplePrompt: "Change the delivery address to Office HQ." },
      { name: "Cancel Order", examplePrompt: "Cancel a pending order and confirm status." },
    ],
    taskExamples: [
      { title: "Track Package", prompt: "Open the most recent order and view ETA." },
      { title: "Reschedule", prompt: "Reschedule today’s delivery to tomorrow 15:00." },
      { title: "Edit Address", prompt: "Update delivery address to Main Street 100." },
      { title: "Cancel Pending", prompt: "Cancel a pending order and verify cancellation notice." },
    ],
    comingSoonNote: "Driver chat and proof-of-delivery tasks coming soon.",
  },
  {
    name: "AutoLodge",
    portValidator: "8007",
    href: "http://autolodge.autoppia.com",
    origin: "AirBnB",
    totalTasks: [18, 11, 5],
    image: "/images/web6.png",
    color: "#10B981",
    description: "Lodging search and booking with rich filters.",
    useCases: [
      { name: "Search Stays", examplePrompt: "Find stays in Lisbon for 2 guests next weekend." },
      { name: "Apply Filters", examplePrompt: "Show places with Wi-Fi and self check-in." },
      { name: "Request Booking", examplePrompt: "Request a 2-night booking and review total price." },
      { name: "Save Favorites", examplePrompt: "Save listings to Favorites for later." },
    ],
    taskExamples: [
      { title: "Search Dates", prompt: "Search Lisbon for 2 guests, Fri–Sun next week." },
      { title: "Filter Amenities", prompt: "Filter Wi-Fi, kitchen, and self check-in." },
      { title: "Send Request", prompt: "Request to book and review total cost." },
      { title: "Save Listing", prompt: "Save two listings to Favorites and open the list." },
    ],
    comingSoonNote: "Host messaging and cancellations coming soon.",
  },
  {
    name: "AutoConnect",
    portValidator: "8008",
    href: "http://autoconnect.autoppia.com",
    origin: "LinkedIn",
    totalTasks: [30, 17, 9],
    image: "/images/web7.png",
    color: "#14B8A6",
    description: "Professional networking for profiles, jobs, and messaging.",
    useCases: [
      { name: "Find Profiles", examplePrompt: "Find React developers in Berlin." },
      { name: "Connect & Message", examplePrompt: "Send a connection request with a short note." },
      { name: "Jobs & Save", examplePrompt: "Search 'Frontend Engineer' and save two jobs." },
      { name: "Profile Update", examplePrompt: "Update headline and add a new skill." },
    ],
    taskExamples: [
      { title: "Talent Search", prompt: "Search React developers in Berlin and open 3 profiles." },
      { title: "Connect", prompt: "Send a personalized connect note to one profile." },
      { title: "Jobs", prompt: "Search 'Frontend Engineer' and save two listings." },
      { title: "Edit Profile", prompt: "Update profile headline and add a 'TypeScript' skill." },
    ],
    comingSoonNote: "InMail and recruiter tools coming soon.",
  },
];


export const websitesDataMap = websitesData.reduce(
  (acc, website) => {
    acc[website.name] = website;
    return acc;
  },
  {} as Record<string, WebsiteDataType>
);
