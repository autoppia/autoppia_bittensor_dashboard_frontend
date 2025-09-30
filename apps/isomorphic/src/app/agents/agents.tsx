"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import { Button, Input, Text } from "rizzui";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { minersData } from "@/data/miners-data";

export default function Agents() {
  const [query, setQuery] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSearch = () => {
    const miner = minersData.find(
      (miner) => miner.uid.toString() === query || miner.hotkey === query
    );
    if (miner) {
      router.push(`/agents/${miner.uid}`);
    } else {
      setError("Invalid UID or hotkey");
    }
  };

  return (
    <>
      <PageHeader title="Agents" className="mt-4" />
      <div className="w-full mt-16 md:mt-28 flex flex-col gap-4 md:gap-6 items-center justify-center px-4 md:px-0">
        <Text className="text-xl md:text-3xl font-semibold text-gray-900 text-center">
          Enter UID or hotkey to view agent details
        </Text>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 w-full max-w-2xl">
          <Input
            type="search"
            placeholder="Enter UID or hotkey..."
            prefix={<PiMagnifyingGlassBold className="size-4" />}
            inputClassName="text-gray-900 border-gray-900 placeholder-gray-700"
            errorClassName="text-md"
            className="w-full sm:w-auto sm:flex-1"
            rounded="pill"
            size="lg"
            clearable
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            onClear={() => {
              setQuery("");
              setError("");
            }}
            error={error}
          />
          <Button
            rounded="pill"
            size="lg"
            className="bg-gradient-primary text-white text-base md:text-lg font-semibold w-full sm:w-auto sm:min-w-[120px]"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </>
  );
}
