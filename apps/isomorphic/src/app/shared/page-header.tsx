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
    <header className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
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
