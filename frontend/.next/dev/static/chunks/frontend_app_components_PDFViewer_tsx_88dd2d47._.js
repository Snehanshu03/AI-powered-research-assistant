(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/app/components/PDFViewer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PDFViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$pdf$2f$dist$2f$Document$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Document$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-pdf/dist/Document.js [app-client] (ecmascript) <export default as Document>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$pdf$2f$dist$2f$Page$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Page$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-pdf/dist/Page.js [app-client] (ecmascript) <export default as Page>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__pdfjs$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/pdfjs-dist/build/pdf.mjs [app-client] (ecmascript) <export * as pdfjs>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__pdfjs$3e$__["pdfjs"].GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
function PDFViewer({ page, highlight, selectedFile }) {
    _s();
    const [uploadedPdfUrl, setUploadedPdfUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [numPages, setNumPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pdfUrl = selectedFile ? `http://localhost:8000/uploaded_papers/${selectedFile}` : uploadedPdfUrl;
    const onDocumentLoadSuccess = ({ numPages })=>{
        setNumPages(numPages);
    };
    const pdfOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PDFViewer.useMemo[pdfOptions]": ()=>{
            return {
                cMapUrl: "cmaps/",
                cMapPacked: true
            };
        }
    }["PDFViewer.useMemo[pdfOptions]"], []);
    /*
  =============================
  SCROLL TO PAGE (AFTER RENDER)
  =============================
  */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PDFViewer.useEffect": ()=>{
            if (!page || !pdfUrl) return;
            const timer = setTimeout({
                "PDFViewer.useEffect.timer": ()=>{
                    const element = document.querySelector(`[data-page-number="${page}"]`);
                    if (element) {
                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }
                }
            }["PDFViewer.useEffect.timer"], 300);
            return ({
                "PDFViewer.useEffect": ()=>clearTimeout(timer)
            })["PDFViewer.useEffect"];
        }
    }["PDFViewer.useEffect"], [
        page,
        pdfUrl
    ]);
    /*
  =============================
  HIGHLIGHT TEXT (FIXED)
  =============================
  */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PDFViewer.useEffect": ()=>{
            if (!highlight) return;
            const timer = setTimeout({
                "PDFViewer.useEffect.timer": ()=>{
                    const spans = document.querySelectorAll(".react-pdf__Page__textContent span");
                    spans.forEach({
                        "PDFViewer.useEffect.timer": (span)=>{
                            span.style.background = "";
                        }
                    }["PDFViewer.useEffect.timer"]);
                    spans.forEach({
                        "PDFViewer.useEffect.timer": (span)=>{
                            const text = span.textContent?.toLowerCase() || "";
                            const target = highlight.toLowerCase();
                            if (text && text.includes(target)) {
                                span.style.background = "yellow";
                                span.style.borderRadius = "3px";
                            }
                        }
                    }["PDFViewer.useEffect.timer"]);
                }
            }["PDFViewer.useEffect.timer"], 400);
            return ({
                "PDFViewer.useEffect": ()=>clearTimeout(timer)
            })["PDFViewer.useEffect"];
        }
    }["PDFViewer.useEffect"], [
        page,
        highlight
    ]);
    /*
  =============================
  UPLOAD PDF (IMPROVED)
  =============================
  */ const uploadPDF = async (file)=>{
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        await fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formData
        });
        // Refresh sidebar
        window.dispatchEvent(new Event("papersUpdated"));
        // Auto-open uploaded file
        setUploadedPdfUrl(`http://localhost:8000/uploaded_papers/${file.name}`);
        setLoading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "flex-1 bg-[#1e232e] p-6 flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl mb-4 text-white",
                children: "PDF Viewer"
            }, void 0, false, {
                fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "file",
                accept: "application/pdf",
                onChange: (e)=>{
                    if (!e.target.files) return;
                    uploadPDF(e.target.files[0]); // ✅ single file for clarity
                },
                className: "mb-4 text-white"
            }, void 0, false, {
                fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 bg-white rounded overflow-auto p-4 flex justify-center",
                children: [
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-black",
                        children: "Uploading PDF..."
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this),
                    !loading && pdfUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$pdf$2f$dist$2f$Document$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Document$3e$__["Document"], {
                        file: pdfUrl,
                        options: pdfOptions,
                        onLoadSuccess: onDocumentLoadSuccess,
                        children: Array.from(new Array(numPages), (_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                "data-page-number": index + 1,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$pdf$2f$dist$2f$Page$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Page$3e$__["Page"], {
                                    pageNumber: index + 1,
                                    renderTextLayer: true,
                                    renderAnnotationLayer: true
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                                    lineNumber: 150,
                                    columnNumber: 17
                                }, this)
                            }, index, false, {
                                fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                                lineNumber: 149,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                        lineNumber: 143,
                        columnNumber: 11
                    }, this),
                    !loading && !pdfUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center h-full text-black",
                        children: "Upload or select a PDF to begin"
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/components/PDFViewer.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/app/components/PDFViewer.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
_s(PDFViewer, "SI4bbgNpYISFSzsiO2Mk35XVwOE=");
_c = PDFViewer;
var _c;
__turbopack_context__.k.register(_c, "PDFViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/app/components/PDFViewer.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/app/components/PDFViewer.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=frontend_app_components_PDFViewer_tsx_88dd2d47._.js.map