import { routes } from "@/config/routes";
import {
  LuComponent,
  LuCodesandbox,
  LuBot,
  LuPackageCheck,
  LuBoxes,
  LuGlobe,
  LuTrophy,
  LuShield,
} from "react-icons/lu";
import { PiFlaskDuotone } from "react-icons/pi";

export type MenuItemType = {
  name: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
};

export type MenuNamespace = "subnet36" | "iwa";

export const NAV_COLLECTION_STORAGE_KEY = "autoppia.navCollection";
export const NAV_COLLECTION_EVENT = "autoppia:nav-collection-change";

export const NAV_COLLECTIONS: Record<MenuNamespace, MenuItemType[]> = {
  subnet36: [
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
      name: "Evaluations",
      href: routes.evaluations,
      icon: <LuBoxes />,
    },
    {
      name: "Validators",
      href: routes.validators,
      icon: <LuShield />,
    },
  ],
  iwa: [
    {
      name: "Leaderboard",
      href: routes.leaderboard,
      icon: <LuTrophy />,
    },

    {
      name: "Websites",
      href: routes.websites,
      icon: <LuGlobe />,
    },
    {
      name: "Playground",
      href: routes.testAgent,
      icon: <PiFlaskDuotone />,
    },
  ],
};

export const DEFAULT_NAV_COLLECTION: MenuNamespace = "subnet36";
