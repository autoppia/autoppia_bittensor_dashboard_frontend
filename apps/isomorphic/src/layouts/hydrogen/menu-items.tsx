import { routes } from "@/config/routes";
import {
  PiShootingStarDuotone,
  PiSquaresFourDuotone,
  PiRocketLaunchDuotone,
  PiNetworkDuotone,
  PiCodesandboxLogoDuotone
} from "react-icons/pi";

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: "Home",
  },
  // label end
  {
    name: "Overview",
    href: routes.overview,
    icon: <PiRocketLaunchDuotone />,
  },
  {
    name: "Evaluation Runs",
    href: routes.runs,
    icon: <PiCodesandboxLogoDuotone />,
  },
  {
    name: "Agents",
    href: routes.agents,
    icon: <PiCodesandboxLogoDuotone />,
  },
  {
    name: "Tasks",
    href: routes.tasks,
    icon: <PiShootingStarDuotone />,
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
