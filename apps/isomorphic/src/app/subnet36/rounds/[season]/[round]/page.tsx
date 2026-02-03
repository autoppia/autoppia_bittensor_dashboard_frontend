import { metaObject } from "@/config/site.config";
import { notFound } from "next/navigation";
import Round from "./round";

export const dynamic = "force-dynamic";

export const metadata = {
  ...metaObject(),
};

interface PageProps {
  params: Promise<{
    season: string;
    round: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { season, round } = await params;
  
  // Validate that season and round are numbers
  const seasonNum = parseInt(season, 10);
  const roundNum = parseInt(round, 10);
  
  if (isNaN(seasonNum) || isNaN(roundNum) || seasonNum < 1 || roundNum < 1) {
    notFound();
  }

  return <Round />;
}
