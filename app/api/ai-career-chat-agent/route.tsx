import { inngest } from "@/inngest/client";
import axios from "axios";
import { NextResponse } from "next/server";
import { getRuns } from "@/lib/ai-utils";


export async function POST(req: any) {
  const { userInput } = await req.json();

  const resultIds = await inngest.send({
    name: "AiCareerAgent",
    data: {
      userInput: userInput,
    }
  });
  const runId = resultIds?.ids[0];

  let runStatus;
  while (true) {
    runStatus = await getRuns(runId);
    if (runStatus?.data[0]?.status === 'Completed') 
        break;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return NextResponse.json(runStatus.data?.[0].output?.output[0])
}

