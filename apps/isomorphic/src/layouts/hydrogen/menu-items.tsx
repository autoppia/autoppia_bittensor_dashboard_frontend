import { routes } from "@/config/routes";
import {
  LuComponent,
  LuCodesandbox,
  LuBot,
  LuBoxes,
  LuGlobe,
  LuFence,
} from "react-icons/lu";
import { FaHome } from "react-icons/fa";

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: "Navigation",
  },
  // label end
  {
    name: "Home",
    href: routes.home,
    icon: <FaHome />,
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
    href: routes.agents,
    icon: <LuFence />,
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
];
