"use client";

import { PricingTable } from "@clerk/nextjs";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

function Billing() {
  const router = useRouter();

  useEffect(() => {
    const intent = sessionStorage.getItem("roadmap-intent");
    const input = sessionStorage.getItem("roadmap-user-input");
    const roadmapId = sessionStorage.getItem("roadmap-id");

    if (intent && input && roadmapId) {
      sessionStorage.removeItem("roadmap-intent");
      sessionStorage.removeItem("roadmap-user-input");
      sessionStorage.removeItem("roadmap-id");

      // Redirect to resume generation
      router.push(
        `/ai-tools/ai-roadmap-agent/trigger?roadmapId=${roadmapId}&input=${encodeURIComponent(
          input
        )}`
      );
    }
  }, []);

  return (
    <div>
      <h2 className="font-bold text-3xl text-center">Choose Your Plan</h2>
      <p className="text-lg text-center">
        Select a subscription bundle to get all AI Tools access
      </p>
      <div>
        <PricingTable />
      </div>
    </div>
  );
}

export default Billing;
