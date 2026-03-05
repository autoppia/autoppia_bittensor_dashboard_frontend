"use client";

import type { ReactNode } from "react";
import { Title, Text } from "rizzui/typography";
import cn from "@core/utils/class-names";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

const descriptionClassName = "mt-1 text-md lg:text-lg text-gray-500";

export default function PageHeader({
  title,
  description,
  className,
  children,
}: React.PropsWithChildren<PageHeaderProps>) {
  let descriptionNode: ReactNode = null;
  if (description != null) {
    if (typeof description === "string" || typeof description === "number") {
      descriptionNode = (
        <Text className={descriptionClassName}>{description}</Text>
      );
    } else {
      descriptionNode = (
        <div className={descriptionClassName}>{description}</div>
      );
    }
  }

  return (
    <header className={cn("mb-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title
            as="h2"
            className="text-[22px] lg:text-3xl 4xl:text-[26px] font-bold"
          >
            {title}
          </Title>
          {descriptionNode}
        </div>
        {children}
      </div>
    </header>
  );
}
