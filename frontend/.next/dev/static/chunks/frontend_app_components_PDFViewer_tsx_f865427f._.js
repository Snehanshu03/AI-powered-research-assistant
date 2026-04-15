(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/app/components/PDFViewer.tsx [app-client] (ecmascript, next/dynamic entry, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/9e883_bd267577._.js",
  "static/chunks/frontend_app_components_PDFViewer_tsx_88dd2d47._.js",
  {
    "path": "static/chunks/9e883_react-pdf_dist_Page_387926c7._.css",
    "included": [
      "[project]/frontend/node_modules/react-pdf/dist/Page/TextLayer.css [app-client] (css)",
      "[project]/frontend/node_modules/react-pdf/dist/Page/AnnotationLayer.css [app-client] (css)"
    ],
    "moduleChunks": [
      "static/chunks/9e883_react-pdf_dist_Page_TextLayer_css_bad6b30c._.single.css",
      "static/chunks/9e883_react-pdf_dist_Page_AnnotationLayer_css_bad6b30c._.single.css"
    ]
  },
  "static/chunks/frontend_app_components_PDFViewer_tsx_cbc4de81._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/frontend/app/components/PDFViewer.tsx [app-client] (ecmascript, next/dynamic entry)");
    });
});
}),
]);