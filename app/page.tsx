"use client";

import { useState } from "react";

export default function Home() {
  const [company, setCompany] = useState("");
  const [started, setStarted] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState(
    "ما هو نشاط شركتكم وكيف تعمل أنظمتكم بشكل يومي؟"
  );
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const step = Math.min(Math.floor(messages.length / 2) + 1, 7);

  const handleNext = async () => {
    if (!input) return;

    setLoading(true);

    const newMessages = [
      ...messages,
      { role: "assistant", content: question },
      { role: "user", content: input },
    ];

    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: newMessages, company }),
    });

    const data = await res.json();

    if (data.type === "question") {
      setQuestion(data.question);
    } else if (data.type === "report") {
      setReport(data.report);
      setQuestion("");
    }

    setLoading(false);
  };

  // 🔵 START SCREEN
  if (!started) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0b3d3b] text-white">
        <div className="bg-[#0f4f4c] p-8 rounded-2xl w-full max-w-md">
          <h1 className="text-xl mb-4 text-center">
            Enterprise IT Risk Assessment
          </h1>

          <input
            className="w-full p-2 mb-4 text-black"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-green-500 p-2 rounded"
          >
            Start Assessment
          </button>
        </div>
      </main>
    );
  }

  // 🔵 MAIN FLOW
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b3d3b] text-white p-6">
      <div className="w-full max-w-2xl bg-[#0f4f4c] p-8 rounded-2xl">

        {/* Progress */}
        <p className="text-sm text-gray-300 mb-2 text-center">
          Step {step} of 7
        </p>

        {loading && <p className="text-center">Analyzing...</p>}

        {!loading && report && (
          <>
            <h2 className="text-xl mb-4 text-center">Assessment Result</h2>
            <pre className="whitespace-pre-wrap">{report}</pre>

            <p className="mt-6 text-center text-sm text-gray-300">
              We can provide a detailed remediation plan and implementation roadmap.
            </p>
          </>
        )}

        {!loading && !report && (
          <>
            <p className="mb-4 text-center">{question}</p>

            <textarea
              className="w-full p-3 rounded text-black mb-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              onClick={handleNext}
              className="w-full bg-green-500 p-2 rounded"
            >
              Next
            </button>
          </>
        )}
      </div>
    </main>
  );
}