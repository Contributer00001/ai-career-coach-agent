"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Report from "../_components/Report";

function AiResumeAnalyzer() {
  const { recordid } = useParams();
  const [pdfUrl, setPdfUrl] = useState();
  const [aiReport, setAiReport] = useState();
  useEffect(() => {
    recordid && GetResumeAnalyzerRecord();
  }, [recordid]);
  const GetResumeAnalyzerRecord = async () => {
    const result = await axios.get("/api/history?recordId=" + recordid);
    console.log(result.data);
    setPdfUrl(result.data?.metaData);
    setAiReport(result.data?.content);
  };
  return (
    <div className="flex h-screen">
      {/* Left Column (Report) */}
      <div className="w-full md:w-2/5 border-r overflow-y-auto bg-gray-100 p-4">
        {aiReport ? (
          <Report aiReport={aiReport} />
        ) : (
          <div className="text-gray-500">Loading analysis...</div>
        )}
      </div>

      {/* Right Column (PDF Preview) */}
      <div className="w-full md:w-3/5 p-4 overflow-y-auto">
        <h2 className="font-bold text-2xl mb-5">Resume Preview</h2>
        {pdfUrl ? (
          <iframe
            src={pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
            className="w-full h-[90vh] border-none"
            style={{ border: "none" }}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default AiResumeAnalyzer;
