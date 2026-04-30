"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";

const PDFViewer = dynamic(
  () => import("./components/PDFViewer"),
  { ssr: false }
);

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [highlight, setHighlight] = useState("");
  const [summary, setSummary] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  // =============================
  // 🔥 AUTO SUMMARY FETCH (FIXED)
  // =============================
  useEffect(() => {
    if (!selectedFile) return;
    if (!API) {
      console.error("API URL not defined");
      return;
    }

    let isMounted = true;

    const fetchSummary = async () => {
      try {
        const res = await fetch(
          `${API}/summarize/${encodeURIComponent(selectedFile)}`
        );

        if (!res.ok) {
          if (isMounted) setSummary("Failed to load summary");
          return;
        }

        const data = await res.json();
        if (isMounted) setSummary(data.summary);

      } catch (err) {
        console.error("Summary fetch failed:", err);
        if (isMounted) setSummary("Error loading summary");
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [selectedFile, API]);

  return (
    <div className="flex h-screen w-screen bg-[#1e252b] text-white overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        setSelectedFile={setSelectedFile}
        setPage={setPage}
        setHighlight={setHighlight}
      />

      {/* PDF Viewer */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 p-6">
        <div className="bg-white rounded-lg h-full min-h-0 overflow-hidden flex flex-col">
          <PDFViewer
            page={page}
            highlight={highlight}
            selectedFile={selectedFile}
          />
        </div>
      </main>

      {/* Right Panel */}
      <aside className="w-[420px] p-4 flex flex-col bg-[#1e252b] border-l border-[#333e48]">
        <ChatPanel
          setPage={setPage}
          setHighlight={setHighlight}
          selectedFile={selectedFile}
          summary={summary}
        />
      </aside>

    </div>
  );
}