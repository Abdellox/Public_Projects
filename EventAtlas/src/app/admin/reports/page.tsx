"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Clock } from "lucide-react";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);

  const fetchReports = () => {
    fetch("/api/admin/reports").then((r) => r.json()).then((data) => setReports(data.reports || []));
  };

  useEffect(() => { fetchReports(); }, []);

  const resolveReport = async (reportId: string) => {
    await fetch("/api/admin/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status: "RESOLVED" }),
    });
    fetchReports();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Event Reports</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-gray-500">
              <th className="p-3">Event</th>
              <th className="p-3">Reporter</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{r.event?.title || "—"}</td>
                <td className="p-3">{r.user?.email || "—"}</td>
                <td className="p-3 max-w-xs truncate">{r.reason}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    r.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>{r.status}</span>
                </td>
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {r.status !== "RESOLVED" && (
                    <button onClick={() => resolveReport(r.id)} className="text-green-600 hover:text-green-800 inline-flex items-center gap-1 text-xs">
                      <CheckCircle className="h-3 w-3" /> Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && <p className="text-center text-gray-500 py-8">No reports.</p>}
      </div>
    </div>
  );
}
