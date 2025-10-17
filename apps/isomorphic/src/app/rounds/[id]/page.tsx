import { metaObject } from "@/config/site.config";
import { notFound, redirect } from "next/navigation";
import Round from "./round";
import { overviewService } from "@/services/api/overview.service";

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
    try {
      const metrics = await overviewService.getMetrics();
      if (metrics?.currentRound) {
        return String(metrics.currentRound);
      }
    } catch (error) {
      console.warn("Failed to load overview metrics for current round resolution:", error);
    }

    try {
      const roundsResponse: any = await overviewService.getRounds({ limit: 1, includeCurrent: true });
      const roundsArray = roundsResponse?.data?.rounds || roundsResponse?.rounds;
      if (Array.isArray(roundsArray) && roundsArray.length > 0) {
        return roundsArray[0].roundKey ?? String(roundsArray[0].id);
      }
      if (roundsResponse?.data?.currentRound?.roundKey) {
        return roundsResponse.data.currentRound.roundKey;
      }
      if (roundsResponse?.data?.currentRound?.id) {
        return String(roundsResponse.data.currentRound.id);
      }
      if (roundsResponse?.currentRound?.roundKey) {
        return roundsResponse.currentRound.roundKey;
      }
      if (roundsResponse?.currentRound?.id) {
        return String(roundsResponse.currentRound.id);
      }
    } catch (error) {
      console.warn("Failed to load rounds list for current round resolution:", error);
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
