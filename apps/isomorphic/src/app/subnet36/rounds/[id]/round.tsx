"use client";

import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import RoundRecents from "./round-recents";
import RoundResult from "./round-result";
import { LuInfo } from "react-icons/lu";
import { useRound } from "@/services/hooks/useRounds";
import { extractRoundIdentifier } from "./round-identifier";
import { useModal } from "@/app/shared/modal-views/use-modal";
import RoundsGlossaryModal from "@/app/shared/modal-views/rounds-glossary-modal";

export default function Round() {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { openModal } = useModal();

  // Get round data from API only
  const { data: round, loading, error } = useRound(roundKey);

  const handleOpenGlossary = () =>
    openModal({
      view: <RoundsGlossaryModal />,
      size: "lg",
      customSize: 1400,
    });
  
  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <PageHeader title={""} className="mt-4" />
      
      {/* Show error message if there's an error, but still render components */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">
            ⚠️ Failed to load round data: {error}
          </p>
        </div>
      )}
      
      {/* Always render components - they will handle their own loading states */}
      <div className="mt-6">
        <RoundRecents />
      </div>
      <RoundResult />
      
      {/* Floating Glossary Button */}
      <button
        type="button"
        onClick={handleOpenGlossary}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg backdrop-blur-sm transition hover:border-gray-400 hover:shadow-xl hover:scale-105"
      >
        <LuInfo className="h-4 w-4" />
        Glossary
      </button>
    </div>
  );
}
