"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon, SparkleIcon } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function RoadmapGeneratorDialog({ openDialog, setOpenDialog }: any) {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const isGenerating = useRef(false);
  const router = useRouter();
  const { has } = useAuth();

  const generateRoadmap = async (roadmapId: string, input: string) => {
    const result = await axios.post("/api/ai-roadmap-agent", {
      roadmapId,
      userInput: input,
    });

    console.log("✅ Roadmap generated:", result.data);
    router.push(`/ai-tools/ai-roadmap-agent/${roadmapId}`);
    setOpenDialog(false);
  };

  const onGenerate = async () => {
    if (isGenerating.current) return; // Prevent double triggering
    isGenerating.current = true;
    const roadmapId = uuidv4();
    setLoading(true);

    try {
      let hasSubscription = false;
      if (typeof has === "function") {
        hasSubscription = await has({ plan: "pro" });
        console.log("📦 Subscribed?", hasSubscription);
      }

      const resultHistory = await axios.get("/api/history");
      const historyList = resultHistory.data;
      const alreadyUsed = historyList.find(
        (item: any) => item?.aiAgentType === "/ai-tools/ai-roadmap-agent"
      );

      if (!hasSubscription && alreadyUsed) {
        sessionStorage.setItem("roadmap-user-input", userInput);
        sessionStorage.setItem("roadmap-id", roadmapId);
        sessionStorage.setItem("roadmap-intent", "true");
        router.push("/billing");
        return;
      }

      await generateRoadmap(roadmapId, userInput);
    } catch (err) {
      console.error("❌ Roadmap error:", err);
    } finally {
      setLoading(false);
      isGenerating.current = false;
    }
  };

  // After billing redirect → resume
  // useEffect(() => {
  //   const intent = sessionStorage.getItem("roadmap-intent");
  //   const input = sessionStorage.getItem("roadmap-user-input");
  //   const roadmapId = sessionStorage.getItem("roadmap-id");

  //   if (intent && input && roadmapId) {
  //     sessionStorage.removeItem("roadmap-intent");
  //     sessionStorage.removeItem("roadmap-user-input");
  //     sessionStorage.removeItem("roadmap-id");

  //     setLoading(true);
  //     generateRoadmap(roadmapId, input)
  //       .catch((e) => console.error("Resume roadmap after billing error:", e))
  //       .finally(() => setLoading(false));
  //   }
  // }, []);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Position/Skills to Generate Roadmap</DialogTitle>
          <DialogDescription asChild>
            <div>
              <Input
                placeholder="e.g. Full Stack Developer"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpenDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            disabled={loading || !userInput.trim()}
          >
            {loading ? (
              <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <SparkleIcon className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RoadmapGeneratorDialog;