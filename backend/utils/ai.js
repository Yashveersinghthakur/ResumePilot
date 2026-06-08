import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Analyze a resume against a job description and return ATS score + suggestions.
 */
export const analyzeResume = async (
  resumeText,
  jobDescription,
  jobTitle = "",
  company = ""
) => {
  const prompt = `
You are an expert ATS (Applicant Tracking System) and resume coach.

Analyze the following resume against the job description and return a JSON object with this exact structure:
{
  "atsScore": <number 0-100>,
  "matchedKeywords": [<array of strings — keywords from JD found in resume>],
  "missingKeywords": [<array of strings — important JD keywords missing from resume>],
  "suggestions": [<array of 3-6 actionable improvement strings>],
  "skillBreakdown": [
    { "skill": "<skill name>", "percentage": <0-100>, "present": <true|false> }
  ],
  "summary": "<2-3 sentence overall assessment>"
}

Rules:
- Return ONLY valid JSON, no markdown, no extra text.
- skillBreakdown should cover the top 6-8 skills mentioned in the job description.
- atsScore reflects keyword match, formatting quality, and relevance.

Job Title: ${jobTitle}
Company: ${company}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`.trim();

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content.trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("JSON Parse Error:", raw);
    throw new Error("Invalid AI response format");
  }
};

/**
 * Generate a mock interview question based on context.
 */
export const generateInterviewResponse = async (
  messages,
  jobTitle,
  jobDescription,
  difficulty
) => {
  const systemPrompt = `
You are an expert technical interviewer conducting a mock interview for a ${jobTitle} position.
Difficulty level: ${difficulty}.
${jobDescription ? `Job description context: ${jobDescription.slice(0, 500)}` : ""}

Guidelines:
- Ask one question at a time.
- Vary between behavioral, technical, and situational questions.
- After candidate answers, give brief constructive feedback and ask the next question.
- Keep responses concise and professional.
- After 8-10 exchanges, provide an overall performance summary with a score out of 10.
`.trim();

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map(({ role, content }) => ({
      role,
      content,
    })),
  ];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: apiMessages,
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
};

/**
 * Generate a tailored cover letter.
 */
export const generateCoverLetter = async (
  resumeText,
  jobDescription,
  jobTitle,
  company
) => {
  const prompt = `
Write a professional, personalized cover letter for the following:

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription.slice(0, 800)}
Resume Summary: ${resumeText.slice(0, 1000)}

Requirements:
- 3-4 paragraphs, professional tone
- Reference specific skills from both the resume and JD
- Highlight 2-3 quantifiable achievements if present
- End with a strong call to action
- Do NOT use placeholders like [Your Name]
`.trim();

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  return response.choices[0].message.content.trim();
};