export type WebsiteDataType = {
  name: string;
  value: string;
  href: string;
  origin: string;
  totalTasks: number[]; // Array of [easy, medium, hard] task counts
  image: string;
};

export const websitesData = [
  {
    name: "Autozone",
    value: "bittensor",
    href: "http://84.247.180.192:5001/",
    origin: "Amazon",
    totalTasks: [25, 15, 8], // [easy, medium, hard]
    image: "/images/web1.png",
  },
  {
    name: "AutoDining",
    value: "autoppia",
    href: "http://84.247.180.192:5002/",
    origin: "OpenDining",
    totalTasks: [32, 18, 10],
    image: "/images/web2.png",
  },
  {
    name: "AutoCRM",
    value: "t3rn",
    href: "http://84.247.180.192:5003/",
    origin: "ClientCRM",
    totalTasks: [20, 12, 6],
    image: "/images/web3.png",
  },
  {
    name: "AutoMail",
    value: "subtensor",
    href: "http://84.247.180.192:5004/",
    origin: "Gmail",
    totalTasks: [28, 16, 9],
    image: "/images/web4.png",
  },
  {
    name: "AutoDelivery",
    value: "taostats",
    href: "http://84.247.180.192:5005/",
    origin: "DashDish",
    totalTasks: [22, 14, 7],
    image: "/images/web5.png",
  },
  {
    name: "AutoLodge",
    value: "tao_explorer",
    href: "http://84.247.180.192:5006/",
    origin: "AirBnB",
    totalTasks: [18, 11, 5],
    image: "/images/web6.png",
  },
  {
    name: "AutoConnect",
    value: "finney",
    href: "http://84.247.180.192:5007/",
    origin: "LinkedIn",
    totalTasks: [30, 17, 9],
    image: "/images/web7.png",
  },
];
