"use client";

import { Title, Text } from 'rizzui/typography';
import cn from '@core/utils/class-names';

export type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  className,
  children,
}: React.PropsWithChildren<PageHeaderProps>) {
  return (
    <header className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <Title
            as="h2"
            className="text-[22px] lg:text-3xl 4xl:text-[26px] font-bold"
          >
            {title}
          </Title>
          <Text className="mt-1 text-md lg:text-lg text-gray-500">{description}</Text>
        </div>
        {children}
      </div>
    </header>
  );
}
