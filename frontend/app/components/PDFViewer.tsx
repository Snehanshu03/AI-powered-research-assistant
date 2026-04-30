"use client";

import { DragEvent, useState, useEffect, useMemo, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PDFViewer({
  page,
  highlight,
  selectedFile,
}: {
  page: number;
  highlight?: string;
  selectedFile?: string | null;
}) {
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const pdfUrl = selectedFile
    ? `${API}/uploaded_papers/${selectedFile}`
    : uploadedPdfUrl;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const pdfOptions = useMemo(() => {
    return {
      cMapUrl: "cmaps/",
      cMapPacked: true,
    };
  }, []);

  // =============================
  // 🔥 SMOOTH SCROLL TO PAGE
  // =============================
  useEffect(() => {
    if (!page || !pdfUrl || !viewerRef.current) return;

    const timer = setTimeout(() => {
      const element = viewerRef.current?.querySelector(
        `[data-page-number="${page}"]`
      );

      if (element && viewerRef.current) {
        viewerRef.current.scrollTo({
          top: (element as HTMLElement).offsetTop - 20,
          behavior: "smooth",
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [page, pdfUrl]);

  // =============================
  // 🔥 HIGHLIGHT TEXT
  // =============================
  useEffect(() => {
    if (!highlight) return;

    const timer = setTimeout(() => {
      const spans = document.querySelectorAll(
        ".react-pdf__Page__textContent span"
      );

      spans.forEach((span) => {
        (span as HTMLElement).style.background = "";
      });

      spans.forEach((span) => {
        const text = span.textContent?.toLowerCase() || "";
        const target = highlight.toLowerCase();

        if (text.includes(target)) {
          (span as HTMLElement).style.background = "yellow";
          (span as HTMLElement).style.borderRadius = "3px";
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [page, highlight]);

  // =============================
  // 📤 UPLOAD PDF (FIXED)
  // =============================
  const uploadPDF = async (file: File) => {
    if (file.type !== "application/pdf") return;
    if (!API) {
      console.error("API URL not defined");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${API}/upload`, {
      method: "POST",
      body: formData,
    });

    window.dispatchEvent(new Event("papersUpdated"));

    setUploadedPdfUrl(
      `${API}/uploaded_papers/${file.name}`
    );

    setLoading(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    uploadPDF(file);
  };

  return (
    <main
      className="h-full min-h-0 overflow-hidden bg-[#1e232e] p-6 flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl text-white">PDF Viewer</h2>

        <div className="flex items-center gap-3">
          <label className="bg-gray-200 px-3 py-1 rounded cursor-pointer text-black text-sm hover:bg-gray-300">
            Choose File
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                if (!e.target.files) return;
                uploadPDF(e.target.files[0]);
              }}
              className="hidden"
            />
          </label>

          <span className="text-sm text-gray-400 max-w-[220px] truncate">
            {selectedFile ||
              uploadedPdfUrl?.split("/").pop() ||
              "No file chosen"}
          </span>
        </div>
      </div>

      {/* VIEWER */}
      <div
        ref={viewerRef}
        className={`relative flex-1 min-h-0 rounded overflow-y-auto p-6 scroll-smooth ${
          isDragging
            ? "bg-cyan-50 ring-2 ring-dashed ring-cyan-500"
            : "bg-white"
        }`}
      >
        {isDragging && (
          <div className="pointer-events-none absolute inset-4 z-10 flex items-center justify-center rounded border-2 border-dashed border-cyan-500 bg-cyan-50/90 text-center text-sm font-medium text-cyan-700">
            Drop a PDF here to upload
          </div>
        )}

        {loading && (
          <div className="text-black">Uploading PDF...</div>
        )}

        {!loading && pdfUrl && (
          <Document
            file={pdfUrl}
            options={pdfOptions}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from({ length: numPages }, (_, index) => (
              <div
                key={index}
                data-page-number={index + 1}
                className="flex justify-center mb-6"
              >
                <Page
                  pageNumber={index + 1}
                  renderTextLayer
                  renderAnnotationLayer
                  className="shadow-md"
                  width={700}
                />
              </div>
            ))}
          </Document>
        )}

        {!loading && !pdfUrl && (
          <div className="flex items-center justify-center h-full text-black">
            Upload or select a PDF to begin
          </div>
        )}
      </div>
    </main>
  );
}