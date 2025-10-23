import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Layout from "./routes/Layout.jsx";
import Upload from "./routes/Upload.jsx";
import ReportsList from "./routes/ReportsList.jsx";
import ReportDetail from "./routes/ReportDetail.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Upload /> },
      { path: "reports", element: <ReportsList /> },
      { path: "reports/:id", element: <ReportDetail /> },
    ],
  },
]);

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
