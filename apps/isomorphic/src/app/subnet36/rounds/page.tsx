import { notFound, redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { roundsRepository } from "@/repositories/rounds/rounds.repository";

export const dynamic = "force-dynamic";

export default async function Page() {
  async function resolveCurrentRoundIdentifier() {
    try {
      const current = await roundsRepository.getCurrentRound();
      if (current?.roundKey) {
        return current.roundKey;
      }
      if (current?.id) {
        return String(current.id);
      }
    } catch (error) {
      console.warn("Failed to fetch current round for redirect:", error);
    }

    try {
      const roundsList = await roundsRepository.getRounds({ limit: 1, sortBy: "id", sortOrder: "desc" });
      const rounds = roundsList?.data?.rounds || roundsList?.rounds;
      if (Array.isArray(rounds) && rounds.length > 0) {
        return rounds[0].roundKey ?? String(rounds[0].id);
      }
    } catch (error) {
      console.warn("Failed to fetch recent rounds for redirect:", error);
    }

    return null;
  }

  const currentRoundId = await resolveCurrentRoundIdentifier();

  if (currentRoundId) {
    redirect(`${routes.rounds}/${encodeURIComponent(currentRoundId)}`);
  }

  notFound();
}
