import {
  AgentHeaderPlaceholder,
  AgentScoreAnalyticsPlaceholder,
  AgentScoreChartPlaceholder,
  AgentStatsPlaceholder,
  AgentValidatorsPlaceholder,
} from "@/components/placeholders/agent-placeholders";

export function AgentsPageFallback() {
  return (
    <div className="space-y-6">
      <AgentHeaderPlaceholder />
      <AgentStatsPlaceholder />
      <div className="flex flex-col xl:flex-row items-stretch gap-6">
        <AgentScoreChartPlaceholder className="w-full xl:w-[calc(100%-320px)]" />
        <AgentScoreAnalyticsPlaceholder className="w-full xl:w-[320px]" />
      </div>
      <AgentValidatorsPlaceholder />
    </div>
  );
}
