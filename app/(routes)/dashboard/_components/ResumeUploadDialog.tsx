"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { File, Loader2Icon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function ResumeUploadDialog({
  openResumeUpload,
  setOpenResumeDialog,
}: {
  openResumeUpload: boolean;
  setOpenResumeDialog: (value: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { has } = useAuth();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const onUploadAndAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    const recordId = uuidv4();

    // Safely check subscription
    let hasSubscriptionEnabled = false;
    if (typeof has === "function") {
      hasSubscriptionEnabled = await has({ plan: "pro" });
    }

    if (!hasSubscriptionEnabled) {
      const resultHistory = await axios.get("/api/history");
      const historyList = resultHistory.data;

      const alreadyUsed = historyList.find(
        (item: any) => item?.aiAgentType === "/ai-tools/ai-resume-analyzer"
      );

      if (!alreadyUsed) {
        // Store file in sessionStorage as base64
        sessionStorage.setItem("resume-upload-intent", "true");
        sessionStorage.setItem("resume-record-id", recordId);

        const reader = new FileReader();
        reader.onload = (event) => {
          const fileBase64 = event?.target?.result;
          if (fileBase64 && typeof fileBase64 === "string") {
            sessionStorage.setItem("resume-file-base64", fileBase64);
            sessionStorage.setItem("resume-file-name", file.name);
            router.push("/billing");
          }
        };
        reader.readAsDataURL(file); // Convert file to base64
        return;
      }
    }

    // Direct upload if allowed
    const formData = new FormData();
    formData.append("recordId", recordId);
    formData.append("resumeFile", file);

    try {
      const result = await axios.post("/api/ai-resume-agent", formData);
      console.log("Upload Success:", result.data);
      router.push("/ai-tools/ai-resume-analyzer/" + recordId);
      setOpenResumeDialog(false);
    } catch (err) {
      console.error("Upload Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Resume upload after billing redirect
  useEffect(() => {
    const pending = sessionStorage.getItem("resume-upload-intent");
    const fileBase64 = sessionStorage.getItem("resume-file-base64");
    const fileName = sessionStorage.getItem("resume-file-name");
    const recordId = sessionStorage.getItem("resume-record-id");

    if (pending && fileBase64 && fileName && recordId) {
      sessionStorage.removeItem("resume-upload-intent");
      sessionStorage.removeItem("resume-file-base64");
      sessionStorage.removeItem("resume-file-name");
      sessionStorage.removeItem("resume-record-id");

      const byteString = atob(fileBase64.split(",")[1]);
      const mimeString = fileBase64.split(",")[0].split(":")[1].split(";")[0];

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });

      // Type-safe fallback to support TS environments missing DOM typings
      const safeFile = new (window as any).File([blob], fileName, {
        type: mimeString,
      });

      const formData = new FormData();
      formData.append("recordId", recordId);
      formData.append("resumeFile", safeFile);

      setLoading(true);
      axios
        .post("/api/ai-resume-agent", formData)
        .then(() => {
          router.push("/ai-tools/ai-resume-analyzer/" + recordId);
          setOpenResumeDialog(false);
        })
        .catch((err) => console.error("Resume upload error:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <Dialog open={openResumeUpload} onOpenChange={setOpenResumeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload resume PDF file</DialogTitle>
          <DialogDescription>
            Please select your resume file (PDF).
          </DialogDescription>

          <div className="mt-4">
            <label
              htmlFor="resumeUpload"
              className="flex flex-col items-center justify-center p-7 border border-dashed rounded-xl hover:border-slate-100 cursor-pointer"
            >
              <File className="h-10 w-10" />
              {file ? (
                <span className="mt-3 text-blue-600">{file.name}</span>
              ) : (
                <span className="mt-3 text-sm">Click here to upload</span>
              )}
            </label>
            <input
              type="file"
              id="resumeUpload"
              className="hidden"
              accept="application/pdf"
              onChange={onFileChange}
            />
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenResumeDialog(false)}>
            Cancel
          </Button>
          <Button disabled={!file || loading} onClick={onUploadAndAnalyze}>
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Upload & Analyze
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResumeUploadDialog;
