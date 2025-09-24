"use client";

import MetricCard from "@core/components/cards/metric-card";
import TicketIcon from "@core/components/icons/ticket";
import TagIcon from "@core/components/icons/tag";
import TagIcon2 from "@core/components/icons/tag-2";
import TagIcon3 from "@core/components/icons/tag-3";

export default function OverviewMetrics() {
  return (
    <div className="w-[500px] grid grid-cols-2 gap-6">
      <MetricCard
        title="Total Tasks"
        metric="5000"
        icon={<TicketIcon className="h-full w-full" />}
        className="flex items-center"
      />
      <MetricCard
        title="Successful Tasks"
        metric="3000"
        icon={<TagIcon className="h-full w-full" />}
        className="flex items-center"
      />
      <MetricCard
        title="Failed Tasks"
        metric="2000"
        icon={<TagIcon2 className="h-full w-full" />}
        className="flex items-center"
      />
      <MetricCard
        title="Average Response Time"
        metric="35s"
        icon={<TagIcon3 className="h-full w-full" />}
        className="flex items-center"
      />
    </div>
  );
}
