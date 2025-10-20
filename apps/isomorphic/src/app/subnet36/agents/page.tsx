import { Suspense } from "react";
import AgentsLanding from "./agents-landing";
import { AgentsPageFallback } from "./agents-fallback";

export default function Page() {
  return (
    <Suspense fallback={<AgentsPageFallback />}>
      <AgentsLanding />
    </Suspense>
  );
}
