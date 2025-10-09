import { redirect } from "next/navigation";
import { sortedMinersData } from "@/data/miners-data";

export default function Page() {
  const topMiner = sortedMinersData[0];

  if (topMiner) {
    redirect(`/agents/${topMiner.uid}`);
  }

  return null;
}
