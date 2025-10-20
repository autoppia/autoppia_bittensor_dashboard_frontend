import { Suspense } from "react";
import AgentsSidebar from "./agents-sidebar";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<AgentSidebarPlaceholder />}>
        <AgentsSidebar />
      </Suspense>
      <div className="ml-0 lg:ml-[300px]">
        {children}
      </div>
    </>
  );
}
