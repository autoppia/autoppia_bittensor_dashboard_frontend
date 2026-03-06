import { notFound, redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { roundsRepository } from "@/repositories/rounds/rounds.repository";

export const dynamic = "force-dynamic";

export default async function Page() {
  async function resolveCurrentRoundIdentifier() {
    try {
      const current = await roundsRepository.getCurrentRound();

      // Prefer season/round format if available
      if (current?.season && current?.roundInSeason) {
        return `${current.season}/${current.roundInSeason}`;
      }

      // Fallback to old format
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
      const rounds = roundsList?.data?.rounds ?? [];
      if (Array.isArray(rounds) && rounds.length > 0) {
        const round = rounds[0];

        // Prefer season/round format if available
        if (round?.season && round?.roundInSeason) {
          return `${round.season}/${round.roundInSeason}`;
        }

        // Fallback to old format
        return round.roundKey ?? String(round.id);
      }
    } catch (error) {
      console.warn("Failed to fetch recent rounds for redirect:", error);
    }

    return null;
  }

  const currentRoundId = await resolveCurrentRoundIdentifier();

  if (currentRoundId) {
    // Don't encode if it's season/round format (contains /)
    const redirectPath = currentRoundId.includes('/')
      ? `${routes.rounds}/${currentRoundId}`
      : `${routes.rounds}/${encodeURIComponent(currentRoundId)}`;
    redirect(redirectPath);
  }

  notFound();
}
