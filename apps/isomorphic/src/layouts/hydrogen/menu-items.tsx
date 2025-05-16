import { routes } from "@/config/routes";
import {
  PiSquaresFourDuotone,
  PiRocketLaunchDuotone,
  PiNetworkDuotone,
  PiCodesandboxLogoDuotone
} from "react-icons/pi";

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: "Overview",
  },
  // label end
  {
    name: "Leaderboard",
    href: routes.leaderboard,
    icon: <PiRocketLaunchDuotone />,
  },
  {
    name: "Agents",
    href: routes.agents,
    icon: <PiCodesandboxLogoDuotone />,
  },
  {
    name: "Websites",
    href: routes.websites,
    icon: <PiSquaresFourDuotone />,
  },
  {
    name: "Subnet36",
    href: routes.subnet36,
    icon: <PiNetworkDuotone />,
  }
];
