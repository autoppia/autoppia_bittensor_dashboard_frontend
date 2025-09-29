import { routes } from "@/config/routes";
import {
  PiSquaresFourDuotone,
  PiRocketLaunchDuotone,
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
    name: "Rounds",
    href: routes.rounds,
    icon: <PiCodesandboxLogoDuotone />,
  },
  {
    name: "Agents",
    href: routes.agents,
    icon: <PiCodesandboxLogoDuotone />,
  },
  {
    name: "Agent Run",
    href: routes.agent_run,
    icon: <PiCodesandboxLogoDuotone />,
  },
  {
    name: "Websites",
    href: routes.websites,
    icon: <PiSquaresFourDuotone />,
  },
];
