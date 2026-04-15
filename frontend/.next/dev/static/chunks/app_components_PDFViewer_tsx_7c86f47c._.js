(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/PDFViewer.tsx [app-client] (ecmascript, next/dynamic entry, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_87a34d08._.js",
  "static/chunks/app_components_PDFViewer_tsx_5952804e._.js",
  {
    "path": "static/chunks/node_modules_react-pdf_dist_Page_9ecb989f._.css",
    "included": [
      "[project]/node_modules/react-pdf/dist/Page/TextLayer.css [app-client] (css)",
      "[project]/node_modules/react-pdf/dist/Page/AnnotationLayer.css [app-client] (css)"
    ],
    "moduleChunks": [
      "static/chunks/node_modules_react-pdf_dist_Page_TextLayer_css_bad6b30c._.single.css",
      "static/chunks/node_modules_react-pdf_dist_Page_AnnotationLayer_css_bad6b30c._.single.css"
    ]
  },
  "static/chunks/app_components_PDFViewer_tsx_0d5243c6._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/app/components/PDFViewer.tsx [app-client] (ecmascript, next/dynamic entry)");
    });
});
}),
]);