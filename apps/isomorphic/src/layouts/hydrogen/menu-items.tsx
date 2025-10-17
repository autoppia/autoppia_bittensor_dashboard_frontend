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
// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: "Home",
    href: routes.home,
    icon: <FaHome />,
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
  },
  {
    name: "Rounds",
    href: routes.rounds,
    icon: <LuCodesandbox />,
  },
  {
    name: "Agents",
    href: routes.agents,
    icon: <LuBot />,
  },
  {
    name: "Agent Run",
    href: routes.agent_run,
    icon: <LuPackageCheck />,
  },
  {
    name: "Tasks",
    href: routes.tasks,
    icon: <LuBoxes />,
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
