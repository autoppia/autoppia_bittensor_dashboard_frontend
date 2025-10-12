"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { Text, Input, Checkbox } from "rizzui";
import { LuSearch } from "react-icons/lu";
import { FaCrown } from "react-icons/fa";
import { useAgents } from "@/services/hooks/useAgents";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import type { AgentData } from "@/services/api/types/agents";

export default function AgentsSidebar() {
  const { id } = useParams();
  const [query, setQuery] = useState<string>("");
  const [showSotaOnly, setShowSotaOnly] = useState<boolean>(false);
  const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);

  // Fetch agents data
  const { data: agentsData, loading, error } = useAgents({
    limit: 100,
    sortBy: 'averageScore',
    sortOrder: 'desc',
  });

  // Update filtered agents when data changes
  useEffect(() => {
    if (agentsData?.data?.agents) {
      let filtered = agentsData.data.agents;
      
      // Apply SOTA filter
      if (showSotaOnly) {
        filtered = filtered.filter(agent => agent.isSota);
      }
      
      setFilteredAgents(filtered);
    }
  }, [agentsData, showSotaOnly]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);

    if (!agentsData?.data?.agents) return;

    let filtered = agentsData.data.agents;
    
    // Apply SOTA filter first
    if (showSotaOnly) {
      filtered = filtered.filter(agent => agent.isSota);
    }
    
    // Then apply search filter
    if (query.trim() !== "") {
      filtered = filtered.filter((agent) =>
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.id.toLowerCase().includes(query.toLowerCase()) ||
        agent.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredAgents(filtered);
  };

  // Show loading placeholder
  if (loading) {
    return <AgentSidebarPlaceholder />;
  }

  // Show error state
  if (error) {
    return (
      <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-5">
        <div className="h-full border rounded-xl bg-gray-50 pb-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-sm">Error loading agents</div>
            <div className="text-gray-500 text-xs mt-1">{error}</div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-5">
      <div className="h-full border rounded-xl bg-gray-50 pb-4">
        <Text className="sticky top-0 px-6 py-4 text-2xl font-bold text-gray-900 border-b">
          All Miners
        </Text>
        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto pl-4 pr-2 mt-3 scroll-smooth">
          <div className="flex flex-col gap-1">
            <div className="mb-2 space-y-2">
              <Input
                prefix={<LuSearch className="w-4" />}
                placeholder="Search miners..."
                clearable={true}
                value={query}
                onChange={handleSearch}
                onClear={() => {
                  setQuery("");
                  if (agentsData?.data?.agents) {
                    let filtered = agentsData.data.agents;
                    if (showSotaOnly) {
                      filtered = filtered.filter(agent => agent.isSota);
                    }
                    setFilteredAgents(filtered);
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showSotaOnly}
                  onChange={(e) => setShowSotaOnly(e.target.checked)}
                  className="text-xs"
                />
                <Text className="text-xs text-gray-600">Show SOTA agents only</Text>
              </div>
            </div>
            {filteredAgents.map((agent, index) => {
              const isActive = agent.id === id;
              const isTopRanked = index === 0; // First agent is top ranked

              return (
                <Link
                  key={`agent-menu-${agent.id}`}
                  href={`/agents/${agent.id}`}
                >
                  <div
                    className={cn(
                      "relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200",
                      isTopRanked &&
                        "bg-yellow-500/10 border border-yellow-400 text-gray-900 hover:bg-yellow-500/30",
                      isActive
                        ? "bg-emerald-500/60 hover:bg-emerald-500/60 text-gray-900"
                        : "hover:bg-emerald-500/30"
                    )}
                  >
                    {/* Crown badge for top agent - positioned at top-left corner */}
                    {isTopRanked && (
                      <div
                        className={cn(
                          "absolute -top-2 -left-2 rounded-full p-1 shadow-xl border-2 z-10",
                          isActive
                            ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-yellow-900 border-yellow-300 animate-pulse"
                            : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-yellow-900 border-yellow-300"
                        )}
                      >
                        <FaCrown className="w-3 h-3 drop-shadow-sm" />
                      </div>
                    )}

                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100 mr-3">
                      <Image
                        src={agent.imageUrl}
                        alt={agent.name}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate text-gray-900">
                          {agent.name}
                        </span>
                        {agent.isSota && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            SOTA
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Score: {(agent.averageScore * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Status badge - positioned on the right */}
                    <div
                      className={cn(
                        "flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold shrink-0 ml-2",
                        agent.status === 'active'
                          ? "bg-green-100 text-green-700"
                          : agent.status === 'maintenance'
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {agent.status}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
