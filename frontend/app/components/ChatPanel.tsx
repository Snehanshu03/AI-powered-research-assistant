"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";

interface Source {
  text: string;
  page: number;
  filename: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  suggestions?: string[];
}

// ✅ Helper creators (clean typing)
const createUserMessage = (content: string): Message => ({
  role: "user",
  content,
});

const createAssistantMessage = (content: string): Message => ({
  role: "assistant",
  content,
});

export default function ChatPanel({
  setPage,
  setHighlight,
  selectedFile,
  summary,
}: {
  setPage: (p: number) => void;
  setHighlight: (text: string) => void;
  selectedFile?: string | null;
  summary?: string;
}) {
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [searchMode, setSearchMode] = useState<"current" | "all">("current");
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const messages = selectedFile ? chatHistory[selectedFile] || [] : [];

  const updateMessages = (newMessages: Message[]) => {
    if (!selectedFile) return;
    setChatHistory((prev) => ({
      ...prev,
      [selectedFile]: newMessages,
    }));
  };

  // =============================
  // SEND MESSAGE
  // =============================
  const sendMessage = async (customQuery?: string) => {
    const queryText = customQuery || input;

    if (!queryText.trim()) return;

    if (searchMode === "current" && !selectedFile) {
      alert("Please select a paper first");
      return;
    }

    const userMessage = createUserMessage(queryText);
    const newMessages = [...messages, userMessage];

    updateMessages(newMessages);
    setInput("");
    setLoading(true);

    // placeholder assistant message
    updateMessages([...newMessages, createAssistantMessage("")]);

    const payload = {
      query: queryText,
      history: newMessages,
      filename: searchMode === "current" ? selectedFile : null,
    };

    try {
      // 🔹 STREAMING RESPONSE
      const response = await fetch("http://localhost:8000/ask-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fullText += decoder.decode(value);

        updateMessages([
          ...newMessages,
          createAssistantMessage(fullText),
        ]);
      }

      // 🔹 FETCH SOURCES + SUGGESTIONS
      const sourceResponse = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (sourceResponse.ok) {
        const data = await sourceResponse.json();

        updateMessages([
          ...newMessages,
          {
            role: "assistant",
            content: fullText,
            sources: data.sources,
            suggestions: data.suggestions,
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // RESET INPUT ON FILE CHANGE
  // =============================
  useEffect(() => {
    setInput("");
  }, [selectedFile]);

  return (
    <aside className="w-96 bg-[#1a212e] border-l border-[#282e39] p-4 flex flex-col h-full">

      {/* HEADER */}
      <div className="mb-2 flex justify-between text-xs text-gray-400">
        <span>{selectedFile || "No paper selected"}</span>

        {summary && (
          <button
            onClick={() => setShowSummary(true)}
            className="text-cyan-400 hover:underline"
          >
            View Summary
          </button>
        )}
      </div>

      {/* SEARCH MODE */}
      <div className="flex gap-2 mb-3 text-xs">
        <button
          disabled={!selectedFile}
          onClick={() => setSearchMode("current")}
          className={`px-3 py-1 rounded ${
            searchMode === "current"
              ? "bg-cyan-600 text-white"
              : "bg-[#102022] border border-[#282e39] text-gray-300"
          } ${!selectedFile ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Current Paper
        </button>

        <button
          onClick={() => setSearchMode("all")}
          className={`px-3 py-1 rounded ${
            searchMode === "all"
              ? "bg-cyan-600 text-white"
              : "bg-[#102022] border border-[#282e39] text-gray-300"
          }`}
        >
          All Papers
        </button>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.role === "user"
                  ? "bg-cyan-600"
                  : "bg-[#102022] border border-[#282e39] prose prose-invert text-sm"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>

              {/* SOURCES */}
              {msg.sources && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-gray-400">Sources</div>

                  {msg.sources.map((src, idx) => (
                    <div key={idx} className="text-xs border p-2 rounded">
                      <div
                        onClick={() => {
                          setPage(src.page);
                          setHighlight(src.text);
                        }}
                        className="cursor-pointer hover:bg-[#0f1720] p-1 rounded"
                      >
                        <div className="text-cyan-400">{src.filename}</div>
                        <div className="text-gray-400">Page {src.page}</div>
                        <div className="text-gray-500 line-clamp-2">{src.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 🔥 SUGGESTIONS */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-gray-400">
                    Suggested Questions
                  </div>

                  {msg.suggestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(q)}
                      className="block text-left text-xs text-cyan-400 hover:underline"
                    >
                      • {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && <div className="text-gray-400 text-sm">Thinking...</div>}
      </div>

      {/* INPUT */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 rounded bg-[#102022] border border-[#282e39]"
          placeholder="Ask something..."
        />

        <button
          onClick={() => sendMessage()}
          className="bg-cyan-500 px-4 rounded hover:bg-cyan-600"
        >
          Send
        </button>
      </div>

      {/* SUMMARY DRAWER */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowSummary(false)} />

          <div className="w-96 bg-[#1a212e] border-l border-[#282e39] p-4 flex flex-col">
            <div className="flex justify-between mb-3">
              <h2 className="text-cyan-400 text-sm">Paper Summary</h2>
              <button onClick={() => setShowSummary(false)}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">
              {summary}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}