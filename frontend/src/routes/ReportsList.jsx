import { useQuery } from "@tanstack/react-query";
import { listReports } from "../api/reports";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Spinner from "../components/Spinner";
import Empty from "../components/Empty";
import { inr, n, dt } from "../lib/format";
import { Table, THead, TBody, TR, TH, TD } from "../components/ui/Table";

export default function ReportsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const nav = useNavigate();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["reports", { search, page }],
    queryFn: () => listReports({ search, page, limit: 10 }),
    keepPreviousData: true,
  });

  function exportCSV() {
    const rows = [
      ["Name", "PAN", "Credit Score", "Total Accounts", "Active", "Closed", "Current Balance (INR)", "Created At", "Report ID"],
      ...((data?.items ?? []).map(r => [
        r.basic?.name ?? "",
        r.basic?.pan ?? "",
        r.basic?.creditScore ?? "",
        r.summary?.totalAccounts ?? 0,
        r.summary?.activeAccounts ?? 0,
        r.summary?.closedAccounts ?? 0,
        r.summary?.currentBalanceAmount ?? 0,
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
        r._id
      ]))
    ];
    const csv = rows.map(row => row.map(cell => {
      const s = String(cell ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader
        title="Stored Reports"
        subtitle="Search and open a report. All fields are displayed in a labeled table below."
        right={
          <div className="flex items-center gap-2">
            <Input
              className="w-72"
              placeholder="Search by name or PAN"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={() => { setPage(1); refetch(); }}>
              {isFetching ? <Spinner label="Searching" /> : "Search"}
            </Button>
            <Button variant="ghost" onClick={exportCSV}>Download CSV</Button>
          </div>
        }
      />
      <CardBody>
        {isLoading ? (
          <Spinner label="Loading reports..." />
        ) : isError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
            Failed to load
          </div>
        ) : !data?.items?.length ? (
          <Empty title="No reports found" hint="Try uploading an XML or adjust your search." />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH scope="col">Name</TH>
                  <TH scope="col">PAN</TH>
                  <TH scope="col">Credit Score</TH>
                  <TH scope="col">Accounts (Total / Active / Closed)</TH>
                  <TH scope="col">Current Balance (INR)</TH>
                  <TH scope="col">Created At</TH>
                  <TH scope="col">Action</TH>
                </TR>
              </THead>
              <TBody>
                {data.items.map((r) => (
                  <TR key={r._id}>
                    <TD>{r.basic?.name ?? "-"}</TD>
                    <TD className="font-mono">{r.basic?.pan ?? "-"}</TD>
                    <TD>
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-brand-800">
                        {r.basic?.creditScore ?? "-"}
                      </span>
                    </TD>
                    <TD>
                      {n.format(r.summary?.totalAccounts ?? 0)}{" / "}
                      {n.format(r.summary?.activeAccounts ?? 0)}{" / "}
                      {n.format(r.summary?.closedAccounts ?? 0)}
                    </TD>
                    <TD>{inr.format(r.summary?.currentBalanceAmount ?? 0)}</TD>
                    <TD>{dt(r.createdAt)}</TD>
                    <TD>
                      <Button as={Link} to={`/reports/${r._id}`} className="px-3 py-1 text-xs">
                        View
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <Pager
              page={data.page ?? page}
              limit={data.limit ?? 10}
              total={data.total ?? 0}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
}

function Pager({ page, limit, total, onPrev, onNext }) {
  const isFirst = page <= 1;
  const isLast = page * limit >= total;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-xs text-zinc-500">
        Page {page} / {totalPages} • {total.toLocaleString("en-IN")} total
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-xl border border-zinc-200 bg-white px-3 py-1 text-sm shadow-soft disabled:opacity-50"
          disabled={isFirst}
          onClick={onPrev}
        >
          Prev
        </button>
        <button
          className="rounded-xl border border-zinc-200 bg-white px-3 py-1 text-sm shadow-soft disabled:opacity-50"
          disabled={isLast}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
