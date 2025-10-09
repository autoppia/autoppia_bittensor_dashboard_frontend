import { redirect } from "next/navigation";
import { roundsData } from "@/data/rounds-data";

export default function Page() {
  const currentRound = roundsData.find((round) => round.current);

  if (currentRound) {
    redirect(`/rounds/${currentRound.id}`);
  }

  return null;
}
