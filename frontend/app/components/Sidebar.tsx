"use client";

import { useState, useEffect } from "react";

export default function Sidebar({
  setSelectedFile,
  setPage,
  setHighlight,
  setSummary,
}: {
  setSelectedFile: (file: string) => void;
  setPage: (p: number) => void;
  setHighlight: (text: string) => void;
  setSummary: (text: string) => void;
}) {
  const [papers, setPapers] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // =============================
  // FETCH PAPERS
  // =============================
  const fetchPapers = async () => {
    try {
      const res = await fetch("http://localhost:8000/papers");

      if (!res.ok) {
        console.error("Failed to fetch papers");
        return;
      }

      const data = await res.json();
      setPapers(data.papers);
    } catch (err) {
      console.error("Backend not reachable:", err);
    }
  };

  // =============================
  // INITIAL LOAD
  // =============================
  if (papers.length === 0) {
    fetchPapers();
  }

  // =============================
  // AUTO REFRESH AFTER UPLOAD
  // =============================
  useEffect(() => {
    const handleUpdate = () => fetchPapers();

    window.addEventListener("papersUpdated", handleUpdate);
    return () => window.removeEventListener("papersUpdated", handleUpdate);
  }, []);

  return (
    <aside className="w-64 bg-[#1a212e] border-r border-[#282e39] p-4 flex flex-col">
      
      <h1 className="text-lg font-semibold mb-4 text-white">
        Research AI
      </h1>

      {/* Refresh */}
      <button
        onClick={fetchPapers}
        className="w-full bg-cyan-500 p-2 rounded mb-4 hover:bg-cyan-600 transition"
      >
        Refresh Papers
      </button>

      <div className="text-xs text-gray-400 mb-2">
        Uploaded Papers
      </div>

      {papers.length === 0 && (
        <div className="text-sm text-gray-500">
          Loading papers...
        </div>
      )}

      <div className="space-y-2 overflow-y-auto">
        {papers.map((paper, i) => (
          <div
            key={i}
            onClick={async () => {
              setSelectedFile(paper);
              setPage(1);
              setHighlight("");
              setActive(paper);

              // 🔥 FETCH SUMMARY
              try {
                const res = await fetch(
                  `http://localhost:8000/summarize/${encodeURIComponent(paper)}`
                );

                if (!res.ok) {
                  console.error("Summary fetch failed");
                  return;
                }

                const data = await res.json();
                setSummary(data.summary);
              } catch (err) {
                console.error("Summary fetch failed:", err);
              }
            }}
            className={`p-2 rounded cursor-pointer text-sm transition ${
              active === paper
                ? "bg-cyan-600 text-white"
                : "text-white hover:bg-[#102022]"
            }`}
          >
            <div className="flex justify-between items-center">

              <span className="truncate">{paper}</span>

              {/* 🗑️ DELETE BUTTON */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();

                  if (!confirm("Delete this paper?")) return;

                  try {
                    const res = await fetch(
                      `http://localhost:8000/delete/${encodeURIComponent(paper)}`,
                      { method: "DELETE" }
                    );

                    if (!res.ok) {
                      console.error("Delete failed:", res.status);
                      return;
                    }

                    fetchPapers();

                    // reset if deleting active file
                    if (active === paper) {
                      setSelectedFile("");
                      setSummary("Generating summary...");
                      setPage(1);
                      setHighlight("");
                      setActive(null);
                    }

                  } catch (err) {
                    console.error("Delete failed:", err);
                  }
                }}
                className="text-red-400 text-xs ml-2 hover:text-red-500"
              >
                ✕
              </button>

            </div>
          </div>
        ))}
      </div>

    </aside>
  );
}