"use client";

import TicketIcon from "@core/components/icons/ticket";
import TagIcon from "@core/components/icons/tag";
import MetricCard from "@core/components/cards/metric-card";
import TagIcon2 from "@core/components/icons/tag-2";
import TagIcon3 from "@core/components/icons/tag-3";

const ticketStats = [
  {
    id: 1,
    icon: <TicketIcon className="h-full w-full" />,
    title: "Total Number of Tasks",
    metric: "12,450",
  },
  {
    id: 2,
    icon: <TagIcon className="h-full w-full" />,
    title: "Total Number of Active Miners",
    metric: "3,590",
  },
  {
    id: 3,
    icon: <TagIcon2 className="h-full w-full" />,
    title: "Total Number of Successful Miners",
    metric: "7,890",
  },
  {
    id: 4,
    icon: <TagIcon3 className="h-full w-full" />,
    title: "Average Score",
    metric: "0.633",
  },
];

export default function ValidatorStats() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {ticketStats.map((stat) => (
        <MetricCard
          key={stat.title + stat.id}
          title={stat.title}
          metric={stat.metric}
          icon={stat.icon}
          iconClassName="bg-transparent w-11 h-11"
        />
      ))}
    </div>
  );
}
