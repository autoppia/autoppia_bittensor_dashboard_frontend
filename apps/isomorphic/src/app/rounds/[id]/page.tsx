import { metaObject } from "@/config/site.config";
import { redirect } from "next/navigation";
import Round from "./round";

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
    // For now, redirect to a default round ID
    // In a real implementation, you might want to get the current round from API
    redirect(`/rounds/1`);
  }

  return <Round />;
}
