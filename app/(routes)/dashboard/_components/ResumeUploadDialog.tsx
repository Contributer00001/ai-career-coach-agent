"use client";
import React, { useState } from "react";
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

function ResumeUploadDialog({ openResumeUpload, setOpenResumeDialog }: any) {
  const [file, setFile] = useState<any>();
  const [loading,setLoading] = useState(false);
  const router = useRouter();
  const {has} = useAuth()
  const onFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(file.name);
      setFile(file);
    }
  };

  const onUploadAndAnalyze = async() => {
    setLoading(true)
    const recordId = uuidv4();
    const formData = new FormData();
    formData.append("recordId", recordId);
    formData.append("resumeFile", file);
    // formData.append("aiAgentType", '/ai-tools/ai-resume-analyzer');
    // formData.append("userEmail", file);
    //@ts-ignore
    const hasSubscriptionEnabled =await has({plan:'pro'})
    if(!hasSubscriptionEnabled){
      const resultHistory = await axios.get('/api/history')
      const historyList = resultHistory.data;
      const isPresent = await historyList.find((item:any)=>item?.aiAgentType=='/ai-tools/ai-resume-analyzer');
      router.push('/billing')
      if(isPresent){
        return null;
      }
    }

    // send formdata to backend server
    const result = await axios.post('/api/ai-resume-agent',formData);
    console.log(result.data)
    setLoading(false)
    router.push('/ai-tools/ai-resume-analyzer/'+recordId);
    setOpenResumeDialog(false);
  };

  return (
    <Dialog open={openResumeUpload} onOpenChange={setOpenResumeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload resume PDF file</DialogTitle>
          <DialogDescription>
            Please select your resume file (PDF).
          </DialogDescription>

          {/* Moved the interactive block outside the description */}
          <div className="mt-4">
            <label
              htmlFor="resumeUpload"
              className="flex flex-col items-center justify-center p-7 border border-dashed rounded-xl hover:border-slate-100 cursor-pointer"
            >
              <File className="h-10 w-10" />
              {file ? (
                <span className="mt-3 text-blue-600">{file?.name}</span>
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
            {loading ? <Loader2Icon className="animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
            Upload & Analyze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResumeUploadDialog;
