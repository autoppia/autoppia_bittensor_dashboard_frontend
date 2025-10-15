import { notFound, redirect } from "next/navigation";
import { roundsService } from "@/services/api/rounds.service";

export default async function Page() {
  async function resolveCurrentRoundId() {
    try {
      const current = await roundsService.getCurrentRound();
      if (current?.id) {
        return current.id;
      }
    } catch (error) {
      console.warn("Failed to fetch current round for redirect:", error);
    }

    try {
      const roundsList = await roundsService.getRounds({ limit: 1, sortBy: "id", sortOrder: "desc" });
      const rounds = roundsList?.data?.rounds || roundsList?.rounds;
      if (Array.isArray(rounds) && rounds.length > 0) {
        return rounds[0].id;
      }
    } catch (error) {
      console.warn("Failed to fetch recent rounds for redirect:", error);
    }

    return null;
  }

  const currentRoundId = await resolveCurrentRoundId();

  if (currentRoundId) {
    redirect(`/rounds/${currentRoundId}`);
  }

  notFound();
}
