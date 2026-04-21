"use client";

import { useState, useEffect } from "react";

export default function Sidebar({
  setSelectedFile,
  setPage,
  setHighlight,
}: {
  setSelectedFile: (file: string) => void;
  setPage: (p: number) => void;
  setHighlight: (text: string) => void;
}) {
  const [papers, setPapers] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // =============================
  // FETCH PAPERS (REUSABLE)
  // =============================
  const fetchPapers = async () => {
    if (!API) {
      console.error("API URL not defined");
      return;
    }

    try {
      const res = await fetch(`${API}/papers`);

      if (!res.ok) {
        console.error("Failed to fetch papers:", res.status);
        return;
      }

      const data = await res.json();
      setPapers(data.papers || []);
    } catch (err) {
      console.error("Backend not reachable:", err);
    }
  };

  // =============================
  // INITIAL LOAD
  // =============================
  useEffect(() => {
    fetchPapers();
  }, []);

  // =============================
  // AUTO REFRESH AFTER UPLOAD
  // =============================
  useEffect(() => {
    const handleUpdate = () => fetchPapers();

    window.addEventListener("papersUpdated", handleUpdate);
    return () => window.removeEventListener("papersUpdated", handleUpdate);
  }, []);

  return (
    <aside className="w-64 bg-[#171c22] flex flex-col border-r border-[#333e48]">

      {/* HEADER */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-[#26a69a] rounded-sm flex items-center justify-center text-white">
          ⚡
        </div>
        <h1 className="font-bold text-lg text-white">Research AI</h1>
      </div>

      {/* REFRESH BUTTON */}
      <div className="px-4 pb-2">
        <button
          onClick={fetchPapers}
          className="w-full bg-[#26a69a] hover:bg-[#1f8b81] text-white font-medium py-2 px-4 rounded-md transition"
        >
          Refresh
        </button>
      </div>

      {/* FILE LIST */}
      <div className="flex-1 overflow-y-auto mt-2 px-2 space-y-1">

        {papers.length === 0 && (
          <div className="text-sm text-gray-500 px-3 py-2">
            No papers found
          </div>
        )}

        {papers.map((paper, i) => (
          <div
            key={i}
            onClick={() => {
              setSelectedFile(paper);
              setPage(1);
              setHighlight("");
              setActive(paper);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition group ${
              active === paper
                ? "bg-[#26a69a]/10 text-[#26a69a] border border-[#26a69a]/30"
                : "text-gray-400 hover:bg-[#2d3741] hover:text-white"
            }`}
          >
            {/* FILE NAME */}
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="truncate text-sm">{paper}</span>
            </div>

            {/* DELETE BUTTON */}
            <button
              onClick={async (e) => {
                e.stopPropagation();

                if (!confirm("Delete this paper?")) return;

                if (!API) return;

                try {
                  const res = await fetch(
                    `${API}/delete/${encodeURIComponent(paper)}`,
                    { method: "DELETE" }
                  );

                  if (!res.ok) {
                    console.error("Delete failed:", res.status);
                    return;
                  }

                  await fetchPapers();

                  // reset UI if active file deleted
                  if (active === paper) {
                    setSelectedFile("");
                    setPage(1);
                    setHighlight("");
                    setActive(null);
                  }

                } catch (err) {
                  console.error("Delete failed:", err);
                }
              }}
              className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 text-xs transition"
            >
              ✕
            </button>
          </div>
        ))}

      </div>
    </aside>
  );
}