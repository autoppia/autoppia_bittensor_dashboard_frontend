"use client";

import { WebsiteCard } from "@/app/shared/website-card";
import { WebsiteDataType } from "@/data/websites-data";

interface WebsiteItemProps {
  website: WebsiteDataType;
}

export function WebsiteItem({ website }: Readonly<WebsiteItemProps>) {
  return <WebsiteCard website={website} borderHoverMode="css-vars" />;
}
