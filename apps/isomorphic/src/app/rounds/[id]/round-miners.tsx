"use client";

import PageHeader from "@/app/shared/page-header";
import RoundMinersScore from "./round-miners-score";
import RoundTopMiners from "./round-top-miners";

export default function RoundMiners() {
  return (
    <div>
      <PageHeader title="Miners" className="mt-6" />
      <div className="flex gap-6">
        <RoundMinersScore />
        <RoundTopMiners />
      </div>
    </div>
  );
}
