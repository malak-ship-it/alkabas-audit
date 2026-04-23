import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const company = body.company || "Unknown Company";

    const formattedHistory = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
You are a senior enterprise IT architect (CCIE-level), security expert, and MSP pre-sales consultant.

You are auditing the company: ${company}

---

OBJECTIVE:
Identify technical gaps, risks, and opportunities for improvement.

---

STRICT RULES:
- Ask ONLY one question at a time
- NEVER repeat questions
- NEVER jump stages
- NEVER assume missing information

---

AUDIT FLOW (MANDATORY ORDER):

1. Business understanding  
2. Services & operational flow  
3. Systems & applications  
4. Infrastructure  
5. Monitoring  
6. Security  
7. Backup & disaster recovery  

---

COMPLETION RULE:
DO NOT generate a report unless ALL areas above are clearly understood.

---

STYLE:
Every question must uncover:
- a risk
- a dependency
- or an architectural detail

---

OUTPUT (JSON ONLY):

{
  "type": "question",
  "question": "..."
}

OR (ONLY at the end):

{
  "type": "report",
  "report": "Deep audit including risks + Recommended Next Steps"
}

---

CONTEXT:
${formattedHistory}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        type: "question",
        question: "وضح أكثر عن بيئة العمل لديكم",
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);

    return NextResponse.json({
      type: "question",
      question: "حدث خطأ، أعد المحاولة",
    });
  }
}