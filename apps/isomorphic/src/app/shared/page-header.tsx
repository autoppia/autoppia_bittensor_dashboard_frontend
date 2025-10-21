"use client";

import type { ReactNode } from "react";
import { Title, Text } from "rizzui/typography";
import cn from "@core/utils/class-names";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  className,
  children,
}: React.PropsWithChildren<PageHeaderProps>) {
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
          {description ? (
            typeof description === "string" || typeof description === "number" ? (
              <Text className="mt-1 text-md lg:text-lg text-gray-500">
                {description}
              </Text>
            ) : (
              <div className="mt-1 text-md lg:text-lg text-gray-500">
                {description}
              </div>
            )
          ) : null}
        </div>
        {children}
      </div>
    </header>
  );
}
