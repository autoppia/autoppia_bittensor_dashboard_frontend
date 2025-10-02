import AgentsSidebar from "./agents-sidebar";

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgentsSidebar />
      <div className="ml-0 lg:ml-[300px]">
        {children}
      </div>
    </>
  );
}
