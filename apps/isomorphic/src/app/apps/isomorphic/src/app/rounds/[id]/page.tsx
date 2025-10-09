import { metaObject } from "@/config/site.config";
import { redirect } from "next/navigation";
import Round from "./round";
import { roundsData } from "@/data/rounds-data";

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

  if (id === "current") {
    redirect(`/rounds/${roundsData[roundsData.length - 1].id}`);
  }

  return <Round />;
}
