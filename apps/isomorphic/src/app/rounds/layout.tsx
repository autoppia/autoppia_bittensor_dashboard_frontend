import RoundsSidebar from "./rounds-sidebar";

export default function RoundsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoundsSidebar />
      <div className="ml-0 lg:ml-[300px]">
        {children}
      </div>
    </>
  );
}
