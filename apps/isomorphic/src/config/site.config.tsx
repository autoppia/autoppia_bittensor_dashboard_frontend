import { Metadata } from "next";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import { LAYOUT_OPTIONS } from "./enums";

enum MODE {
  DARK = "dark",
  LIGHT = "light",
}

export const siteConfig = {
  title: "Leaderboard - Bittensor Subnet 36",
  description: `The Bittensor Subnet 36 Leaderboard`,
  mode: MODE.DARK,
  layout: LAYOUT_OPTIONS.HYDROGEN,
  // TODO: favicon
};

export const metaObject = () => {
  return {
    title: siteConfig.title,
    description: siteConfig.description,
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.description,
      url: "https://leaderboard.autoppia.com",
      siteName: "Bittensor Subnet 36 Leaderboard", 
      locale: "en_US",
      type: "website",
    },
  };
};
