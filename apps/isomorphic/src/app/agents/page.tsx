"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMinersList } from "@/services/hooks/useAgents";

export default function Page() {
  const router = useRouter();
  const { data: minersData, loading } = useMinersList({
    limit: 100,
  });

  useEffect(() => {
    if (minersData?.miners && minersData.miners.length > 0) {
      // Find the top miner (ranking === 1)
      const topMiner = minersData.miners.find(miner => miner.ranking === 1);
      
      if (topMiner) {
        router.push(`/agents/${topMiner.uid}`);
      } else {
        // Fallback to first miner if no ranking === 1 found
        router.push(`/agents/${minersData.miners[0].uid}`);
      }
    }
  }, [minersData, router]);

  return null;
}
