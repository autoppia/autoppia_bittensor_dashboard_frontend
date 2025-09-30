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
      <div className="w-full mt-28 flex flex-col gap-4 items-center justify-center">
        <Text className="text-3xl font-semibold text-gray-900">
          Enter UID or hotkey to view agent details
        </Text>
        <div className="flex items-start gap-2">
          <Input
            type="search"
            placeholder="Enter UID or hotkey..."
            prefix={<PiMagnifyingGlassBold className="size-4" />}
            inputClassName="text-gray-900 border-gray-900 placeholder-gray-700"
            errorClassName="text-md"
            className="w-[600px]"
            rounded="pill"
            size="lg"
            clearable
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
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
            className="bg-gradient-primary text-white text-lg font-semibold"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </>
  );
}
