export default async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const question = body.question?.trim();

    if (!question || question.length > 10000) {
      return Response.json(
        { error: "Please enter a valid question." },
        { status: 400 }
      );
    }

    const prompt = `
You are Abhi Doubt Solve, an educational AI tutor.
Help students with JEE, NEET and Board exams.
Explain step by step in simple Hindi and English.
Explain formulas and calculations.
Give the correct final answer.

Student question:
${question}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data.error?.message);
      return Response.json(
        { error: "AI service unavailable." },
        { status: 502 }
      );
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return Response.json(
        { error: "No answer received." },
        { status: 502 }
      );
    }

    return Response.json({ answer });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
};
