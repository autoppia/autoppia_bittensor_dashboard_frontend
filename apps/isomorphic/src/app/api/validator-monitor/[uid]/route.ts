import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  process.env.API_URL ||
  "https://api-leaderboard.autoppia.com";
const execFileAsync = promisify(execFile);

async function curlJson(url: string) {
  const { stdout } = await execFileAsync("/usr/bin/curl", ["-s", url], {
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const { uid } = await context.params;
  const validatorUid = Number.parseInt(uid, 10);

  if (!Number.isFinite(validatorUid)) {
    return NextResponse.json(
      { success: false, error: "Invalid validator uid" },
      { status: 400 }
    );
  }

  const seasonRaw = request.nextUrl.searchParams.get("season");
  const season = seasonRaw ? Number.parseInt(seasonRaw, 10) : null;

  const detailsPayload = await curlJson(
    `${API_BASE}/api/v1/validators/${validatorUid}/details`
  ).catch(() => null);

  if (!detailsPayload) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch validator details" },
      { status: 502 }
    );
  }
  const availableRounds = Array.isArray(detailsPayload?.data?.availableRounds)
    ? detailsPayload.data.availableRounds.map((value: unknown) => String(value))
    : [];

  const inferredSeason =
    season ??
    availableRounds
      .map((value: string) => Number.parseInt(value.split("/")[0] ?? "", 10))
      .filter((value: number) => Number.isFinite(value))
      .sort((a: number, b: number) => b - a)[0] ??
    null;

  if (inferredSeason == null) {
    return NextResponse.json({ success: true, season: null, points: [] });
  }

  const seasonRounds = availableRounds
    .filter((value: string) => value.startsWith(`${inferredSeason}/`))
    .map((value: string) => Number.parseInt(value.split("/")[1] ?? "", 10))
    .filter((value: number) => Number.isFinite(value))
    .sort((a: number, b: number) => a - b)
    .slice(0, -1)
    .slice(-8);

  const settled = await Promise.allSettled(
    seasonRounds.map(async (roundInSeason: number) => {
      const roundId = inferredSeason * 10000 + roundInSeason;
      const payload = await curlJson(
        `${API_BASE}/api/v1/agent-runs?validatorId=${encodeURIComponent(`validator-${validatorUid}`)}&roundId=${roundId}&limit=100`
      );
      const runs = Array.isArray(payload?.data?.runs) ? payload.data.runs : [];
      const totalTasks = runs.reduce((sum: number, run: any) => {
        const runTasks = run.totalTasks ?? run.total_tasks ?? 0;
        return sum + (Number.isFinite(runTasks) ? runTasks : 0);
      }, 0);
      const totalAverageCostWeighted = runs.reduce((sum: number, run: any) => {
        const averageCost = run.averageCost ?? run.average_cost ?? null;
        const runTasks = run.totalTasks ?? run.total_tasks ?? 0;
        if (typeof averageCost !== "number" || !Number.isFinite(averageCost)) {
          return sum;
        }
        return sum + averageCost * (Number.isFinite(runTasks) ? runTasks : 0);
      }, 0);
      const estimatedRoundCost = runs.reduce((sum: number, run: any) => {
        const averageCost = run.averageCost ?? run.average_cost ?? null;
        const totalTasks = run.totalTasks ?? run.total_tasks ?? 0;
        if (typeof averageCost !== "number" || !Number.isFinite(averageCost)) {
          return sum;
        }
        return sum + totalTasks * averageCost;
      }, 0);

      return {
        roundInSeason,
        agentRuns: payload?.data?.total ?? runs.length,
        estimatedRoundCost,
        totalTasks,
        averageCostPerTask: totalTasks > 0 ? totalAverageCostWeighted / totalTasks : 0,
      };
    })
  );

  const points = settled
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter((value): value is { roundInSeason: number; agentRuns: number; estimatedRoundCost: number } => value !== null);
  const errors = settled
    .map((result, index) =>
      result.status === "rejected"
        ? {
            roundInSeason: seasonRounds[index],
            message:
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason),
          }
        : null
    )
    .filter((value): value is { roundInSeason: number; message: string } => value !== null);

  return NextResponse.json({
    success: true,
    season: inferredSeason,
    points,
    errors,
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
