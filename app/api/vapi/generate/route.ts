import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate reflective journaling prompts for a mental wellness session.
  The wellness focus is ${role}.
  The users experience level with self-reflection is ${level}.
  The areas to explore are: ${techstack}.
  The style of questions should lean towards: ${type} (e.g., supportive, challenging, or open-ended).
  The amount of prompts required is: ${amount}.
  Please return only the journaling prompts, without any additional text.
  The prompts are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
  Return the prompts formatted like this:
  ["Prompt 1", "Prompt 2", "Prompt 3"]

  Thank you! <3`,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
