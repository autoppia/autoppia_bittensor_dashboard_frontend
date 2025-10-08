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
    color: "#EF4444", // red-500
  },
  {
    name: "AutoDining",
    portValidator: "8003",
    href: "http://autodining.autoppia.com",
    origin: "OpenDining",
    totalTasks: [32, 18, 10],
    image: "/images/web2.png",
    color: "#F97316", // orange-500
  },
  {
    name: "AutoCRM",
    portValidator: "8004",
    href: "http://autocrm.autoppia.com",
    origin: "ClientCRM",
    totalTasks: [20, 12, 6],
    image: "/images/web3.png",
    color: "#EAB308", // yellow-500
  },
  {
    name: "AutoMail",
    portValidator: "8005",
    href: "http://automail.autoppia.com",
    origin: "Gmail",
    totalTasks: [28, 16, 9],
    image: "/images/web4.png",
    color: "#84CC16", // lime-500
  },
  {
    name: "AutoDelivery",
    portValidator: "8006",
    href: "http://autodelivery.autoppia.com",
    origin: "DashDish",
    totalTasks: [22, 14, 7],
    image: "/images/web5.png",
    color: "#22C55E", // green-500
  },
  {
    name: "AutoLodge",
    portValidator: "8007",
    href: "http://autolodge.autoppia.com",
    origin: "AirBnB",
    totalTasks: [18, 11, 5],
    image: "/images/web6.png",
    color: "#10B981", // emerald-500
  },
  {
    name: "AutoConnect",
    portValidator: "8008",
    href: "http://autoconnect.autoppia.com",
    origin: "LinkedIn",
    totalTasks: [30, 17, 9],
    image: "/images/web7.png",
    color: "#14B8A6", // teal-500
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

export const websitesDataMap = websitesData.reduce((acc, website) => {
  acc[website.name] = website;
  return acc;
}, {} as Record<string, WebsiteDataType>);
