import { routes } from "@/config/routes";
import {
  LuComponent,
  LuCodesandbox,
  LuBot,
  LuPackageCheck,
  LuBoxes,
  LuGlobe,
} from "react-icons/lu";
import { PiFlaskDuotone } from "react-icons/pi";
import { FaHome } from "react-icons/fa";

export type MenuItemType = {
  name: string;
  href: string;
  icon: React.ReactNode;
  section?: "general" | "leaderboard";
};

// Note: do not add href in the label object, it is rendering as label
export const menuItems: MenuItemType[] = [
  // General Section
  {
    name: "Home",
    href: routes.home,
    icon: <FaHome />,
    section: "general",
  },
  {
    name: "Websites",
    href: routes.websites,
    icon: <LuGlobe />,
    section: "general",
  },
  {
    name: "Test Agent",
    href: routes.testAgent,
    icon: <PiFlaskDuotone />,
    section: "general",
  },
  // Leaderboard Section
  {
    name: "Overview",
    href: routes.overview,
    icon: <LuComponent />,
    section: "leaderboard",
  },
  {
    name: "Rounds",
    href: routes.rounds,
    icon: <LuCodesandbox />,
    section: "leaderboard",
  },
  {
    name: "Agents",
    href: routes.agents,
    icon: <LuBot />,
    section: "leaderboard",
  },
  {
    name: "Agent Run",
    href: routes.agent_run,
    icon: <LuPackageCheck />,
    section: "leaderboard",
  },
  {
    name: "Tasks",
    href: routes.tasks,
    icon: <LuBoxes />,
    section: "leaderboard",
  },
];
