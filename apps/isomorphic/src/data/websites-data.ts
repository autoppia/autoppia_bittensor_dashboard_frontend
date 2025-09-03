/* src/data/websites-data.ts */

export type WebsiteDataType = {
  name: string;
  portValidator: string; // ← puerto que usa el validador
  href: string;
  origin: string;
  totalTasks: number[]; // [easy, medium, hard]
  image: string;
  isComingSoon?: boolean; // New field for "soon" websites
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
  },
  {
    name: "AutoDining",
    portValidator: "8003",
    href: "http://autodining.autoppia.com",
    origin: "OpenDining",
    totalTasks: [32, 18, 10],
    image: "/images/web2.png",
  },
  {
    name: "AutoCRM",
    portValidator: "8004",
    href: "http://autocrm.autoppia.com",
    origin: "ClientCRM",
    totalTasks: [20, 12, 6],
    image: "/images/web3.png",
  },
  {
    name: "AutoMail",
    portValidator: "8005",
    href: "http://automail.autoppia.com",
    origin: "Gmail",
    totalTasks: [28, 16, 9],
    image: "/images/web4.png",
  },
  {
    name: "AutoDelivery",
    portValidator: "8006",
    href: "http://autodelivery.autoppia.com",
    origin: "DashDish",
    totalTasks: [22, 14, 7],
    image: "/images/web5.png",
  },
  {
    name: "AutoLodge",
    portValidator: "8007",
    href: "http://autolodge.autoppia.com",
    origin: "AirBnB",
    totalTasks: [18, 11, 5],
    image: "/images/web6.png",
  },
  {
    name: "AutoConnect",
    portValidator: "8008",
    href: "http://autoconnect.autoppia.com",
    origin: "LinkedIn",
    totalTasks: [30, 17, 9],
    image: "/images/web7.png",
  },
  // New websites
  {
    name: "AutoShop",
    portValidator: "8009",
    href: "http://autoshop.autoppia.com",
    origin: "Shopify",
    totalTasks: [35, 20, 12],
    image: "/images/web1.png", // Reusing existing image for now
  },
  {
    name: "AutoBank",
    portValidator: "8010",
    href: "http://autobank.autoppia.com",
    origin: "Chase",
    totalTasks: [40, 25, 15],
    image: "/images/web2.png", // Reusing existing image for now
  },
  {
    name: "AutoLearn",
    portValidator: "8011",
    href: "http://autolearn.autoppia.com",
    origin: "Coursera",
    totalTasks: [28, 18, 10],
    image: "/images/web3.png", // Reusing existing image for now
  },
  // Coming soon websites
  {
    name: "AutoSocial",
    portValidator: "8012",
    href: "#",
    origin: "Facebook",
    totalTasks: [0, 0, 0],
    image: "/images/web4.png", // Reusing existing image for now
    isComingSoon: true,
  },
  {
    name: "AutoVideo",
    portValidator: "8013",
    href: "#",
    origin: "YouTube",
    totalTasks: [0, 0, 0],
    image: "/images/web5.png", // Reusing existing image for now
    isComingSoon: true,
  },
  {
    name: "AutoMusic",
    portValidator: "8014",
    href: "#",
    origin: "Spotify",
    totalTasks: [0, 0, 0],
    image: "/images/web6.png", // Reusing existing image for now
    isComingSoon: true,
  },
  {
    name: "AutoTravel",
    portValidator: "8015",
    href: "#",
    origin: "Expedia",
    totalTasks: [0, 0, 0],
    image: "/images/web7.png", // Reusing existing image for now
    isComingSoon: true,
  },
];
