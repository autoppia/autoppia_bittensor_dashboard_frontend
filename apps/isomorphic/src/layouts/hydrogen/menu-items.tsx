import { routes } from "@/config/routes";
import {
  LuComponent,
  LuCodesandbox,
  LuBot,
  LuPackageCheck,
  LuBoxes,
  LuGlobe,
  LuTrophy,
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
    name: "Leaderboard",
    href: routes.leaderboard,
    icon: <LuTrophy />,
  },
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
  {
    name: "Websites",
    href: routes.websites,
    icon: <LuGlobe />,
  },
  {
    name: "Join the arena",
    href: routes.testAgent,
    icon: <PiFlaskDuotone />,
  },
];
