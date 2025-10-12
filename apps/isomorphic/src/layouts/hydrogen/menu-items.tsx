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
// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: "Home",
    href: routes.home,
    icon: <FaHome />,
  },
  // label end
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
    name: "Test Agent",
    href: routes.testAgent,
    icon: <PiFlaskDuotone />
  }
];
