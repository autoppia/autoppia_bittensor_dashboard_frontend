"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/services/hooks/useAgents";

export default function Page() {
  const router = useRouter();
  const { data: agentsData, loading } = useAgents({
    limit: 1,
    sortBy: 'averageScore',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (agentsData?.data?.agents && agentsData.data.agents.length > 0) {
      const topAgent = agentsData.data.agents[0];
      router.push(`/agents/${topAgent.id}`);
    }
  }, [agentsData, router]);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading agents...</div>
        </div>
      </div>
    );
  }

  return null;
}
