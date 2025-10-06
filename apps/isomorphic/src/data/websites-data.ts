/* src/data/websites-data.ts */

export type WebsiteDataType = {
  name: string;
  portValidator: string; // ← puerto que usa el validador
  href: string;
  origin: string;
  totalTasks: number[]; // [easy, medium, hard]
  image: string;
  isComingSoon?: boolean; // New field for "soon" websites
  color: string; // Add color property
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
    color: "#00FFFF",
  },
  {
    name: "AutoDining",
    portValidator: "8003",
    href: "http://autodining.autoppia.com",
    origin: "OpenDining",
    totalTasks: [32, 18, 10],
    image: "/images/web2.png",
    color: "#9333EA",
  },
  {
    name: "AutoCRM",
    portValidator: "8004",
    href: "http://autocrm.autoppia.com",
    origin: "ClientCRM",
    totalTasks: [20, 12, 6],
    image: "/images/web3.png",
    color: "#10B981",
  },
  {
    name: "AutoMail",
    portValidator: "8005",
    href: "http://automail.autoppia.com",
    origin: "Gmail",
    totalTasks: [28, 16, 9],
    image: "/images/web4.png",
    color: "#3B82F6",
  },
  {
    name: "AutoDelivery",
    portValidator: "8006",
    href: "http://autodelivery.autoppia.com",
    origin: "DashDish",
    totalTasks: [22, 14, 7],
    image: "/images/web5.png",
    color: "#FBBF24",
  },
  {
    name: "AutoLodge",
    portValidator: "8007",
    href: "http://autolodge.autoppia.com",
    origin: "AirBnB",
    totalTasks: [18, 11, 5],
    image: "/images/web6.png",
    color: "#EF4444",
  },
  {
    name: "AutoConnect",
    portValidator: "8008",
    href: "http://autoconnect.autoppia.com",
    origin: "LinkedIn",
    totalTasks: [30, 17, 9],
    image: "/images/web7.png",
    color: "#8B5CF6",
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
    color: "#06B6D4",
  },
  {
    name: "AutoCalendar",
    portValidator: "8010",
    href: "https://autocalendar.autoppia.com",
    origin: "Calendar",
    totalTasks: [40, 25, 15],
    image: "/images/web11.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#84CC16",
  },
  {
    name: "AutoList",
    portValidator: "8011",
    href: "https://autolist.autoppia.com",
    origin: "Coursera",
    totalTasks: [28, 18, 10],
    image: "/images/web12.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#F97316",
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
    color: "#EC4899",
  },
  {
    name: "AutoVideo",
    portValidator: "8013",
    href: "#",
    origin: "YouTube",
    totalTasks: [0, 0, 0],
    image: "/images/web5.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#14B8A6",
  },
  {
    name: "AutoMusic",
    portValidator: "8014",
    href: "#",
    origin: "Spotify",
    totalTasks: [0, 0, 0],
    image: "/images/web6.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#00FFFF", 
  },
  {
    name: "AutoTravel",
    portValidator: "8015",
    href: "#",
    origin: "Expedia",
    totalTasks: [0, 0, 0],
    image: "/images/web7.png", // Reusing existing image for now
    isComingSoon: true,
    color: "#9333EA", 
  },
];

export const websitesDataMap = websitesData.reduce((acc, website) => {
  acc[website.name] = website;
  return acc;
}, {} as Record<string, WebsiteDataType>);
