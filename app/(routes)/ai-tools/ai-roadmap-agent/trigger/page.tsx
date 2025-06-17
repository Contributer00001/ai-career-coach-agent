"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import axios from "axios";

export default function TriggerRoadmapGeneration() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isGenerating = useRef(false);

  useEffect(() => {
    const roadmapId = searchParams.get("roadmapId");
    const input = searchParams.get("input");

    if (!roadmapId || !input) return;

    if (isGenerating.current) return; // Prevent double triggering
    isGenerating.current = true;

    const generate = async () => {
      try {
        await axios.post("/api/ai-roadmap-agent", {
          roadmapId,
          userInput: input,
        });
        router.push(`/ai-tools/ai-roadmap-agent/${roadmapId}`);
      } catch (err) {
        console.error("Failed to resume roadmap:", err);
        router.push("/dashboard"); // fallback if error
      } finally {
        isGenerating.current = false;
      }
    };

    generate();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-lg">
      Generating your roadmap...
    </div>
  );
}
