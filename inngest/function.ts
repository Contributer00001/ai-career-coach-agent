import { HistoryTable } from "@/configs/schema";
import { inngest } from "./client";
import { createAgent, gemini, openai } from "@inngest/agent-kit";
import ImageKit from "imagekit";
import { db } from "@/configs/db";
import { Description } from "@radix-ui/react-dialog";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const AiCareerChatAgent = createAgent({
  name: "AiCareerChatAgent",
  description: "An Ai Agent that answers career relateed query",
  system: `You are a helpful, professional AI Career Coach Agent. Your role is to guide users with questions related to career
    s,including job search advice,interview preparation,resume improvement,skills development, career transitions and industry trends. Always respond with clarity, encouragement and actionable advice tailored to the user' needs.
    If the users ask something unrelated to careers(e.g, topics like health, relationships, coding help,or general trivia),gently inform them that you are a career coach and sugggest relevant career-focused questions instead.`,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});

export const AiResumeAnalyzerAgent = createAgent({
  name: "AiResumeAnalyzerAgent",
  description: "AI Resume Analzyer Agent help to Return Report",
  system: `You are an advanced AI Resume Analyzer Agent.

Your task is to evaluate a candidate's resume and return a detailed analysis in the following structured JSON schema format.

The schema must match the layout and structure of a visual UI that includes overall score, section scores, summary feedback, improvement tips, strengths, and weaknesses.

INPUT:
I will provide a plain text resume.

GOAL:
Output a JSON report as per the schema below. The report should reflect:

- overall_score (0–100)
- overall_feedback (short message e.g. "Excellent", "Needs improvement")
- summary_comment (1–2 sentence evaluation summary)

SECTION SCORES:
Evaluate and score the following sections individually:
- Contact Info
- Experience
- Education
- Skills

Each section should include:
- score (as percentage)
- comment (brief evaluation about that section)
- tips_for_improvement (2–3 tips)
- strengths (1–2 strong points)
- needs_improvement (1–2 weaknesses)

OUTPUT FORMAT (as JSON):
{
  "overall_score": 85,
  "overall_feedback": "Excellent",
  "summary_comment": "Your resume is strong, but there are areas to refine.",
  "sections": {
    "contact_info": {
      "score": 95,
      "comment": "Perfectly structured and complete."
    },
    "experience": {
      "score": 88,
      "comment": "Strong bullet points and impact."
    },
    "education": {
      "score": 78,
      "comment": "Consider adding relevant coursework."
    },
    "skills": {
      "score": 64,
      "comment": "Expand on specific skill proficiencies."
    }
  },
  "tips_for_improvement": [
    "Add more numbers and metrics to your experience section to show impact.",
    "Integrate more industry-specific keywords relevant to your target roles.",
    "Start bullet points with strong action verbs to make your achievements stand out."
  ],
  "strengths": [
    "Clean and professional formatting.",
    "Clear and concise contact information.",
    "Relevant work experience."
  ],
  "needs_improvement": [
    "Skills section lacks detail.",
    "Some experience bullet points could be stronger.",
    "Missing a professional summary/objective."
  ]
}`,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});

const AIRoadmapGeneratorAgent = createAgent({
  name: "AIRoadmapGeneratorAgent",
  description: "Generate Detailed Tree-Like Flow Roadmap",
  system: `
You are an expert AI roadmap generator.

Generate a learning roadmap in a React Flow compatible JSON format with the following requirements:

STRUCTURE:
- Follow a vertical tree layout.
- Nodes must have proper x/y spacing to prevent overlap.
- Start from fundamental topics and go to advanced.
- Use consistent vertical spacing (e.g., y += 250 for next row).
- Use horizontal offsets (e.g., x ± 250, ±300) for branching topics (specializations).

NODE FORMAT:
Each node must include:
- A unique 'id' (as a string)
- 'type': set to 'turbo'
- 'position': x/y values that form a tree (no overlapping!)
- 'data':
  - 'title': 2–4 words topic title
  - 'description': 1–2 lines explaining what the step covers
  - 'link': helpful learning resource

Example:
{
  'id': '1',
  'type': 'turbo',
  'position': { 'x': 0, 'y': 0 },
  'data': {
    'title': 'Learn HTML',
    'description': 'Understand HTML basics like tags and structure.',
    'link': 'https://developer.mozilla.org/en-US/docs/Web/HTML'
  }
}

EDGE FORMAT:
Each edge must include:
- A unique 'id' (e.g., 'e1-2')
- A valid 'source' node id
- A valid 'target' node id

Example:
{
  'id': 'e1-2',
  'source': '1',
  'target': '2'
}

FINAL JSON OUTPUT FORMAT:
Respond with a single valid JSON object with:

{
  'roadmapTitle': 'Your Roadmap Title',
  'description': '3–5 line summary of what this roadmap teaches and who it is for.',
  'duration': 'e.g., 12 weeks, 3 months',
  'initialNodes': [ ... ],
  'initialEdges': [ ... ]
}

USER INPUT: {{ insert user input here, e.g., 'Frontend Developer' }}
`

,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});

export const AiCareerAgent = inngest.createFunction(
  { id: "AiCareerAgent" },
  { event: "AiCareerAgent" },
  async ({ event, step }) => {
    const { userInput } = await event?.data;
    const result = await AiCareerChatAgent.run(userInput);
    return result;
  }
);

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL!,
});

export const AiResumeAgent = inngest.createFunction(
  { id: "AiResumeAgent" },
  { event: "AiResumeAgent" },
  async ({ event, step }) => {
    const { recordId, base64ResumeFile, pdfText, aiAgentType, userEmail } =
      await event.data;
    //Upload to file storage

    const uploadFileUrl = await step.run("uploadImage", async () => {
      const imageKitFile = await imagekit.upload({
        file: base64ResumeFile,
        fileName: `${Date.now()}.pdf`,
        isPublished: true,
      });

      return imageKitFile.url;
    });
    // return {
    //   status: "success",
    //   url: uploadImageUrl,
    //   recordId,
    // };

    const aiResumeReport = await AiResumeAnalyzerAgent.run(pdfText);
    //@ts-ignore
    const rawContent = aiResumeReport.output[0].content;
    const rawContentJson = rawContent.replace("```json", "").replace("```", "");
    const parseJson = JSON.parse(rawContentJson);
    // return parseJson;

    //Save to DB
    const saveToDb = await step.run("SaveToDb", async () => {
      const result = await db.insert(HistoryTable).values({
        recordId: recordId,
        content: parseJson,
        aiAgentType: aiAgentType,
        createdAt: new Date().toString(),
        userEmail: userEmail,
        metaData: uploadFileUrl,
      });
      console.log(result);
      return parseJson;
    });
  }
);

export const AIRoadmapAgent = inngest.createFunction(
  { id: "AiRoadMapAgent" },
  { event: "AiRoadMapAgent" },
  async ({ event, step }) => {
    const { roadmapId, userInput, userEmail } = await event.data;

    const roadmapResult = await AIRoadmapGeneratorAgent.run(
      "UserInput:" + userInput
    );
    //@ts-ignore
    const rawContent = roadmapResult.output[0].content;
    const rawContentJson = rawContent.replace("```json", "").replace("```", "");
    const parseJson = JSON.parse(rawContentJson);
    //Save to db
    const saveToDb = await step.run("SaveToDb", async () => {
      const result = await db.insert(HistoryTable).values({
        recordId: roadmapId,
        content: parseJson,
        aiAgentType: "/ai-tools/ai-roadmap-agent",
        createdAt: new Date().toString(),
        userEmail: userEmail,
        metaData: userInput,
      });
      console.log(result);
      return parseJson;
    });
    return {
      output: [saveToDb],
    };
  }
);
