"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

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
  

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      <Sidebar
        setSelectedFile={setSelectedFile}
        setPage={setPage}
        setHighlight={setHighlight}
        setSummary={setSummary}
      />

      <PDFViewer
        page={page}
        highlight={highlight}
        selectedFile={selectedFile}
      />

      <ChatPanel
        setPage={setPage}
        setHighlight={setHighlight}
        selectedFile={selectedFile}
        summary={summary}
      />

    </div>
  );
}