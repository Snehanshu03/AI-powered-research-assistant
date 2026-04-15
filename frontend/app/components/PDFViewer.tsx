"use client";

import { useState, useEffect, useMemo } from "react";
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

  const pdfUrl = selectedFile
    ? `http://localhost:8000/uploaded_papers/${selectedFile}`
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

  /*
  =============================
  SCROLL TO PAGE (AFTER RENDER)
  =============================
  */
  useEffect(() => {
    if (!page || !pdfUrl) return;

    const timer = setTimeout(() => {
      const element = document.querySelector(
        `[data-page-number="${page}"]`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [page, pdfUrl]);

  /*
  =============================
  HIGHLIGHT TEXT (FIXED)
  =============================
  */
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

        if (text && text.includes(target)) {
          (span as HTMLElement).style.background = "yellow";
          (span as HTMLElement).style.borderRadius = "3px";
        }
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [page, highlight]);

  /*
  =============================
  UPLOAD PDF (IMPROVED)
  =============================
  */
  const uploadPDF = async (file: File) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    // Refresh sidebar
    window.dispatchEvent(new Event("papersUpdated"));

    // Auto-open uploaded file
    setUploadedPdfUrl(
      `http://localhost:8000/uploaded_papers/${file.name}`
    );

    setLoading(false);
  };

  return (
    <main className="flex-1 bg-[#1e232e] p-6 flex flex-col">
      <h2 className="text-xl mb-4 text-white">PDF Viewer</h2>

      {/* Upload */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (!e.target.files) return;
          uploadPDF(e.target.files[0]); // ✅ single file for clarity
        }}
        className="mb-4 text-white"
      />

      {/* Viewer */}
      <div className="flex-1 bg-white rounded overflow-auto p-4 flex justify-center">

        {loading && (
          <div className="text-black">Uploading PDF...</div>
        )}

        {!loading && pdfUrl && (
          <Document
            file={pdfUrl}
            options={pdfOptions}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div key={index} data-page-number={index + 1}>
                <Page
                  pageNumber={index + 1}
                  renderTextLayer
                  renderAnnotationLayer
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