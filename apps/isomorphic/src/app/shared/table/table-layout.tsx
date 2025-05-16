'use client';

import { Button } from 'rizzui';
import { PiChartLineUpDuotone, PiClock } from 'react-icons/pi';
import PageHeader, { PageHeaderProps } from '@/app/shared/page-header';

type TableLayoutProps = {
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
} & PageHeaderProps;

export default function TableLayout({
  view,
  setView,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <Button
            variant={view == "score" ? "solid" : "outline"}
            className="w-full @lg:w-auto"
            onClick={() => setView("score")}
          >
            <PiChartLineUpDuotone className="me-1.5 h-[17px] w-[17px]" />
            Score
          </Button>
          <Button
            variant={view == "duration" ? "solid" : "outline"}
            className="w-full @lg:w-auto"
            onClick={() => setView("duration")}
          >
            <PiClock className="me-1.5 h-[17px] w-[17px]" />
            Time
          </Button>
        </div>
      </PageHeader >

      {children}
    </>
  );
}
