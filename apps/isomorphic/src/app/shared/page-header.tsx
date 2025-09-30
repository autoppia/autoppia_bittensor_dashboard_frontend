import { Title } from 'rizzui/typography';
import cn from '@core/utils/class-names';

export type PageHeaderProps = {
  title: string;
  className?: string;
};

export default function PageHeader({
  title,
  children,
  className,
}: React.PropsWithChildren<PageHeaderProps>) {
  return (
    <header className={cn('mb-6 @container', className)}>
      <div className="flex flex-col gap-2 @lg:flex-row @lg:items-center @lg:justify-between">
        <div>
          <Title
            as="h2"
            className="text-[22px] lg:text-3xl 4xl:text-[26px]"
          >
            {title}
          </Title>
        </div>
        {children}
      </div>
    </header>
  );
}
