"use client";

import { WebsiteCard } from "@/app/shared/website-card";
import { WebsiteDataType } from "@/data/websites-data";

type WebsiteItemProps = { website: WebsiteDataType };

export default function WebsiteItem({ website }: Readonly<WebsiteItemProps>) {
  return <WebsiteCard website={website} borderHoverMode="js" />;
}
