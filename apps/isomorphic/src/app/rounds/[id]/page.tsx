import { metaObject } from "@/config/site.config";
import { notFound, redirect } from "next/navigation";
import Round from "./round";
import { overviewService } from "@/services/api/overview.service";
import { roundsService } from "@/services/api/rounds.service";

export const dynamic = "force-dynamic";

export const metadata = {
  ...metaObject(),
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  async function resolveCurrentRoundIdentifier() {
    const normalizeRoundIdentifier = (round: any): string | null => {
      if (!round || typeof round !== "object") {
        return null;
      }
      if (round.roundKey && typeof round.roundKey === "string") {
        return round.roundKey;
      }
      const numericRound =
        typeof round.round === "number"
          ? round.round
          : typeof round.roundNumber === "number"
          ? round.roundNumber
          : typeof round.id === "number"
          ? round.id
          : undefined;
      if (typeof numericRound === "number" && Number.isFinite(numericRound) && numericRound > 0) {
        return `round_${numericRound}`;
      }
      if (typeof round.round === "string") {
        return round.round;
      }
      if (typeof round.roundNumber === "string") {
        return round.roundNumber;
      }
      return null;
    };

    try {
      const currentRound = await roundsService.getCurrentRound();
      const resolved = normalizeRoundIdentifier(currentRound);
      if (resolved) {
        return resolved;
      }
    } catch (error) {
      console.warn("Failed to load current round from rounds service:", error);
    }

    try {
      const roundsResponse = await roundsService.getRounds({
        page: 1,
        limit: 1,
        sortBy: "round",
        sortOrder: "desc",
      });
      const roundsArray = roundsResponse?.data?.rounds;
      if (Array.isArray(roundsArray) && roundsArray.length > 0) {
        const resolved = normalizeRoundIdentifier(roundsArray[0]);
        if (resolved) {
          return resolved;
        }
      }
      const resolvedCurrent = normalizeRoundIdentifier(roundsResponse?.data?.currentRound);
      if (resolvedCurrent) {
        return resolvedCurrent;
      }
    } catch (error) {
      console.warn("Failed to load rounds list for current round resolution:", error);
    }

    try {
      const metrics = await overviewService.getMetrics();
      if (metrics?.currentRound) {
        return metrics.currentRound.toString().startsWith("round_")
          ? metrics.currentRound.toString()
          : `round_${metrics.currentRound}`;
      }
    } catch (error) {
      console.warn("Failed to load overview metrics for current round resolution:", error);
    }

    try {
      const roundsResponse: any = await overviewService.getRounds({ limit: 1, includeCurrent: true });
      const roundsArray = roundsResponse?.data?.rounds || roundsResponse?.rounds;
      if (Array.isArray(roundsArray) && roundsArray.length > 0) {
        const resolved = normalizeRoundIdentifier(roundsArray[0]);
        if (resolved) {
          return resolved;
        }
      }
      const fallback = normalizeRoundIdentifier(
        roundsResponse?.data?.currentRound ?? roundsResponse?.currentRound
      );
      if (fallback) {
        return fallback;
      }
    } catch (error) {
      console.warn("Failed to load overview rounds list for current round resolution:", error);
    }

    return null;
  }

  if (id === "current") {
    const currentRoundId = await resolveCurrentRoundIdentifier();

    if (currentRoundId) {
      redirect(`/rounds/${encodeURIComponent(currentRoundId)}`);
    }

    notFound();
  }

  return <Round />;
}
