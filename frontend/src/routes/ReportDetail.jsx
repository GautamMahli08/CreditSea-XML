import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getReport } from "../api/reports";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Spinner from "../components/Spinner";
import Empty from "../components/Empty";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { inr, n, mask, dt } from "../lib/format";
import { Table, THead, TBody, TR, TH, TD } from "../components/ui/Table";

export default function ReportDetail() {
  const { id } = useParams();
  const { data: r, isLoading, isError } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReport(id),
  });

  if (isLoading) return <Spinner label="Loading report..." />;
  if (isError) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">Failed to load</div>;
  if (!r) return <Empty title="Report not found" />;

  const secured = r.summary?.securedAmount ?? 0;
  const unsecured = r.summary?.unsecuredAmount ?? 0;

  function downloadAccountsCSV() {
    const rows = [
      ["Type","Bank","Account #","Amount Overdue","Current Balance","Status","Secured?"],
      ...(r.accounts ?? []).map(a => [
        a.type ?? "",
        (a.bank ?? "").toString().trim(),
        a.accountNumberMasked ?? "",
        (a.amountOverdue ?? 0),
        (a.currentBalance ?? 0),
        a.status ?? "",
        a.secured ? "Yes" : "No",
      ])
    ];
    const csv = rows.map(row => row.map(cell => {
      const s = String(cell ?? "");
      // Escape quotes and wrap
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
      return s;
    }).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${r._id}_accounts.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button as={Link} to="/reports" variant="ghost">← Back</Button>
        <h1 className="text-2xl font-semibold tracking-tight">Report Detail</h1>
        <Badge color="blue">{r.reference ? `Ref: ${r.reference}` : "No Ref"}</Badge>
      </div>

      {/* Basic Details */}
      <Card>
        <CardHeader title="Basic Details" subtitle="Applicant and report metadata" />
        <CardBody>
          <Table>
            <THead>
              <TR>
                <TH scope="col">Field</TH>
                <TH scope="col">Value</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TH scope="row" className="w-48 font-medium text-zinc-700">Name</TH>
                <TD>{mask(r.basic?.name)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="w-48 font-medium text-zinc-700">Mobile</TH>
                <TD>{mask(r.basic?.mobilePhone)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="w-48 font-medium text-zinc-700">PAN</TH>
                <TD className="font-mono">{mask(r.basic?.pan)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="w-48 font-medium text-zinc-700">Credit Score</TH>
                <TD>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-brand-800">
                    {mask(r.basic?.creditScore)}
                  </span>
                </TD>
              </TR>
              <TR>
                <TH scope="row" className="w-48 font-medium text-zinc-700">Generated At</TH>
                <TD>{dt(r.generatedAt)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="w-48 font-medium text-zinc-700">Report ID</TH>
                <TD className="font-mono">{r._id}</TD>
              </TR>
            </TBody>
          </Table>
        </CardBody>
      </Card>

      {/* Report Summary */}
      <Card>
        <CardHeader title="Report Summary" subtitle="Account counts and balance totals" />
        <CardBody>
          <Table>
            <THead>
              <TR>
                <TH scope="col">Metric</TH>
                <TH scope="col">Value</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TH scope="row" className="w-72 font-medium text-zinc-700">Total number of accounts</TH>
                <TD>{n.format(r.summary?.totalAccounts ?? 0)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="font-medium text-zinc-700">Active accounts</TH>
                <TD>{n.format(r.summary?.activeAccounts ?? 0)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="font-medium text-zinc-700">Closed accounts</TH>
                <TD>{n.format(r.summary?.closedAccounts ?? 0)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="font-medium text-zinc-700">Current balance amount</TH>
                <TD>{inr.format(r.summary?.currentBalanceAmount ?? 0)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="font-medium text-zinc-700">Secured accounts amount</TH>
                <TD>{inr.format(secured)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="font-medium text-zinc-700">Unsecured accounts amount</TH>
                <TD>{inr.format(unsecured)}</TD>
              </TR>
              <TR>
                <TH scope="row" className="font-medium text-zinc-700">Last 7 days credit enquiries</TH>
                <TD>{n.format(r.summary?.last7DaysCreditEnquiries ?? 0)}</TD>
              </TR>
            </TBody>
          </Table>
        </CardBody>
      </Card>

      {/* Credit Accounts */}
      <Card>
        <CardHeader
          title="Credit Accounts"
          subtitle="All tradelines parsed from the XML"
          right={<Button onClick={downloadAccountsCSV}>Download CSV</Button>}
        />
        <CardBody>
          {!r.accounts?.length ? (
            <Empty title="No account data" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH scope="col">Type</TH>
                  <TH scope="col">Bank</TH>
                  <TH scope="col">Account #</TH>
                  <TH scope="col">Amount Overdue</TH>
                  <TH scope="col">Current Balance</TH>
                  <TH scope="col">Status</TH>
                  <TH scope="col">Secured?</TH>
                </TR>
              </THead>
              <TBody>
                {r.accounts.map((a, i) => (
                  <TR key={i}>
                    <TD>{a.type}</TD>
                    <TD className="capitalize">{a.bank}</TD>
                    <TD className="font-mono">{mask(a.accountNumberMasked)}</TD>
                    <TD>{inr.format(a.amountOverdue ?? 0)}</TD>
                    <TD>{inr.format(a.currentBalance ?? 0)}</TD>
                    <TD>
                      {a.status === "OPEN" && <Badge color="green">Open</Badge>}
                      {a.status === "CLOSED" && <Badge>Closed</Badge>}
                      {a.status === "WRITTEN_OFF" && <Badge color="red">Written-off</Badge>}
                      {!["OPEN","CLOSED","WRITTEN_OFF"].includes(a.status || "") && <Badge>{a.status || "-"}</Badge>}
                    </TD>
                    <TD>{a.secured ? <Badge color="blue">Yes</Badge> : <Badge color="amber">No</Badge>}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
