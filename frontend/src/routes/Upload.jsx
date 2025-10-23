import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadReport } from "../api/reports";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardBody } from "../components/ui/Card";
import Spinner from "../components/Spinner";

export default function Upload() {
  const [file, setFile] = useState(null);
  const nav = useNavigate();
  const mutation = useMutation({
    mutationFn: uploadReport,
    onSuccess: (data) => nav(`/reports/${data.reportId}`),
  });

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <Card className="relative overflow-hidden">
        <CardBody>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Upload Experian XML</h1>
          <p className="mb-6 text-sm text-zinc-600">
            Parse and persist a soft-pull XML. We’ll render a detailed, beautiful report instantly.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (file) mutation.mutate(file);
            }}
            className="space-y-4"
          >
            <Input type="file" accept=".xml" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <div className="flex items-center gap-3">
              <Button disabled={!file || mutation.isPending}>
                {mutation.isPending ? <Spinner label="Uploading..." /> : "Upload & View Report"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => nav("/reports")}>
                Browse Reports
              </Button>
            </div>
          </form>

          {mutation.isError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {mutation.error?.response?.data?.error || "Upload failed"}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="mb-2 text-lg font-semibold">Tips</h2>
          <ul className="list-inside list-disc text-sm text-zinc-600 leading-6">
            <li>Field name must be <code>file</code> if using Postman.</li>
            <li>We support <code>INProfileResponse</code> and generic <code>CreditReport</code>/<code>Report</code>.</li>
            <li>Account numbers are masked; PAN and balances are normalized.</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
