"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import { useValidators } from "@/services/hooks/useOverview";
import ValidatorsSelector from "@/app/shared/validators-selector";
import {
  ValidatorsSelectorPlaceholder,
  ValidatorCardsPlaceholder,
  PerformanceAnalyticsPlaceholder,
  SummaryPlaceholder,
} from "@/components/placeholders/validator-placeholders";

interface ValidatorPerformance {
  id: string;
  uid: number;
  name: string;
  icon: string;
  hotkey: string | null;
}

export default function ValidatorsPage() {
  const router = useRouter();
  
  const {
    data: validatorsData,
    loading: validatorsLoading,
    error: validatorsError,
  } = useValidators({ limit: 100 });

  const validators: ValidatorPerformance[] = React.useMemo(() => {
    if (!validatorsData?.data?.validators) return [];
    return validatorsData.data.validators.map((v: any) => ({
      id: `validator-${v.validatorUid}`,
      uid: v.validatorUid,
      name: v.name || `Validator ${v.validatorUid}`,
      icon: v.icon || "/validators/Other.png",
      hotkey: v.hotkey || null,
    }));
  }, [validatorsData]);

  // Find Autoppia validator and redirect to its details
  useEffect(() => {
    if (!validatorsLoading && validators.length > 0) {
      // Try to find Autoppia by name (case-insensitive)
      const autoppia = validators.find(
        (v) => v.name.toLowerCase().includes("autoppia")
      );
      
      if (autoppia) {
        router.push(`/validator/${autoppia.uid}`);
      } else if (validators.length > 0) {
        // Fallback to first validator if Autoppia not found
        router.push(`/validator/${validators[0].uid}`);
      }
    }
  }, [validators, validatorsLoading, router]);

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-transparent">
      <PageHeader
        title="Validators"
        description="Select a validator to view detailed performance metrics"
      />

      {/* Validators Selector */}
      {validatorsLoading ? (
        <ValidatorsSelectorPlaceholder />
      ) : (
        <ValidatorsSelector
          validators={validators}
          loading={validatorsLoading}
          error={validatorsError}
          linkToDetails={true}
        />
      )}

      {/* Show loading placeholders while redirecting */}
      <div className="mt-8">
        <ValidatorCardsPlaceholder />
        <PerformanceAnalyticsPlaceholder />
        <SummaryPlaceholder />
      </div>
    </div>
  );
}

