"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import Placeholder from "@/app/shared/placeholder";
import { useValidators } from "@/services/hooks/useOverview";
import ValidatorsSelector from "@/app/shared/validators-selector";

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
        router.replace(`/validator/${autoppia.uid}`);
      }
    }
  }, [validators, validatorsLoading, router]);

  if (validatorsLoading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto bg-transparent">
        <PageHeader
          title="Validators"
          description="Select a validator to view detailed performance metrics"
        />
        <div className="mt-10">
          <Placeholder className="h-64" />
        </div>
      </div>
    );
  }

  if (validatorsError) {
    return (
      <div className="w-full max-w-[1280px] mx-auto bg-transparent">
        <PageHeader
          title="Validators"
          description="Select a validator to view detailed performance metrics"
        />
        <div className="mt-10 bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            ⚠️ Failed to load validators: {validatorsError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-transparent">
      <PageHeader
        title="Validators"
        description="Select a validator to view detailed performance metrics"
      />

      <ValidatorsSelector
        validators={validators}
        loading={validatorsLoading}
        error={validatorsError}
        linkToDetails={true}
      />
    </div>
  );
}

