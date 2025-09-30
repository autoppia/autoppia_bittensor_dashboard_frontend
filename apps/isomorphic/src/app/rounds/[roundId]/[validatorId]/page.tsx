import { metaObject } from "@/config/site.config";
import { redirect } from "next/navigation";
import Evaluation from "./evaluation";
import { roundsData } from "@/data/rounds-data";

export const metadata = {
  ...metaObject(),
};

interface PageProps {
  params: Promise<{
    roundId: string;
    validatorId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { roundId, validatorId } = await params;

  if (roundId === "current") {
    redirect(`/rounds/${roundsData[roundsData.length - 1].id}/${validatorId}`);
  }

  return <Evaluation />;
}
