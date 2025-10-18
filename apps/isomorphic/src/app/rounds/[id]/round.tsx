"use client";

import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
import RoundRecents from "./round-recents";
import RoundResult from "./round-result";
import { LuCircleCheckBig, LuInfo } from "react-icons/lu";
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
    <div
      className={cn(
        "flex items-center px-3 py-1.5 rounded-full",
        round.current
          ? "animate-pulse bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/50"
          : "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow-md shadow-green-500/50"
      )}
    >
      {round.current ? (
        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <span className="text-sm mr-2">
          <LuCircleCheckBig />
        </span>
      )}
      <span className="text-sm">
        {round.current ? "Running" : "Finished"}
      </span>
    </div>
  ) : (
    <div className="flex items-center px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
      <span className="text-sm text-red-600">Round Not Found</span>
    </div>
  );

  const handleOpenGlossary = () =>
    openModal({
      view: <RoundsGlossaryModal />,
      size: "lg",
      customSize: 640,
    });
  
  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <PageHeader title={""} className="mt-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleOpenGlossary}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-100"
          >
            <LuInfo className="h-4 w-4" />
            Glossary
          </button>
          {statusBadge}
        </div>
      </PageHeader>
      
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
      <RoundResult />
    </div>
  );
}
