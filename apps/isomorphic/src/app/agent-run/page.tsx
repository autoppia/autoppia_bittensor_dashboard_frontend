import { redirect } from "next/navigation";
import { agentRunData } from "@/data/agent-run-data";

export default function Page() {
  if (agentRunData) {
    redirect(`/agent-run/${agentRunData[0].runUid}`);
  }

  return null;
}
