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
const API = process.env.NEXT_PUBLIC_API_URL;
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
  const [activeTab, setActiveTab] = useState<"chat" | "summary">("chat");

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

    updateMessages([...newMessages, createAssistantMessage("")]);

    const payload = {
      query: queryText,
      history: newMessages,
      filename: searchMode === "current" ? selectedFile : null,
    };

    try {
      const response = await fetch(`${API}/ask-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const sourceResponse = await fetch("${API}/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  useEffect(() => {
    setInput("");
  }, [selectedFile]);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 🔥 TABS */}
      <div className="bg-[#2d3741] p-1 rounded-lg flex mb-3 shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-1 text-sm rounded ${
            activeTab === "chat"
              ? "bg-[#1e252b] text-white"
              : "text-gray-400"
          }`}
        >
          Chat
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-1 text-sm rounded ${
            activeTab === "summary"
              ? "bg-[#1e252b] text-white"
              : "text-gray-400"
          }`}
        >
          Summary
        </button>
      </div>

      {/* 🔥 CHAT VIEW */}
      {activeTab === "chat" ? (
        <>
          {/* HEADER */}
          <div className="text-xs text-gray-400 mb-2 shrink-0">
            {selectedFile || "No paper selected"}
          </div>

          {/* SEARCH MODE */}
          <div className="flex gap-2 mb-3 text-xs shrink-0">
            <button
              disabled={!selectedFile}
              onClick={() => setSearchMode("current")}
              className={`px-3 py-1 rounded ${
                searchMode === "current"
                  ? "bg-cyan-600 text-white"
                  : "bg-[#102022] border border-[#282e39]"
              }`}
            >
              Current
            </button>

            <button
              onClick={() => setSearchMode("all")}
              className={`px-3 py-1 rounded ${
                searchMode === "all"
                  ? "bg-cyan-600 text-white"
                  : "bg-[#102022] border border-[#282e39]"
              }`}
            >
              All
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-[#26a69a]"
                      : "bg-[#102022] border border-[#282e39]"
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
                        <div
                          key={idx}
                          onClick={() => {
                            setPage(src.page);
                            setHighlight(src.text);
                          }}
                          className="cursor-pointer text-xs border p-2 rounded hover:bg-[#0f1720]"
                        >
                          <div className="text-cyan-400">
                            {src.filename}
                          </div>
                          <div className="text-gray-400">
                            Page {src.page}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SUGGESTIONS */}
                  {msg.suggestions && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(q)}
                          className="block text-xs text-cyan-400 hover:underline"
                        >
                          • {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 text-sm">
                Thinking...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="mt-3 flex gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-2 rounded bg-[#102022] border border-[#282e39]"
              placeholder="Ask something..."
            />

            <button
              onClick={() => sendMessage()}
              className="bg-[#26a69a] px-4 rounded hover:bg-[#1f8b81]"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        /* 🔥 SUMMARY VIEW */
        <div className="flex-1 overflow-y-auto text-sm text-gray-300 whitespace-pre-line p-2">
          {selectedFile
            ? summary || "Loading summary..."
            : "Select a paper"}
        </div>
      )}
    </div>
  );
}