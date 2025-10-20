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

  const statusBadge = loading ? (
    <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-200 animate-pulse">
      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
      <span className="text-sm text-gray-600">Loading...</span>
    </div>
  ) : error ? (
    <div className="flex items-center px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
      <span className="text-sm text-red-600">API Error</span>
    </div>
  ) : round ? (
    round.current ? (
      <div className="flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-400 shadow-sm shadow-emerald-500/20">
        <div className="h-3 w-3 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
        <span>Running</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 rounded-full border border-blue-400/50 bg-blue-500/10 px-3 py-1.5 text-sm font-semibold text-blue-500 shadow-sm shadow-blue-500/20">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span>Finished</span>
      </div>
    )
  ) : (
    <div className="flex items-center px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
      <span className="text-sm text-red-600">Round Not Found</span>
    </div>
  );

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
      <RoundRecents />
      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleOpenGlossary}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition-all duration-150 hover:shadow-md hover:ring-1 hover:ring-black/10"
        >
          <LuInfo className="h-4 w-4" />
          Glossary
        </button>
        {statusBadge}
      </div>
      <RoundResult />
    </div>
  );
}
