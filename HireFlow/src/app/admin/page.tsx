import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Briefcase, FileText, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [totalUsers, totalCompanies, totalCandidates, totalJobs, totalApplications, statusCounts] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "COMPANY" } }),
    db.user.count({ where: { role: "CANDIDATE" } }),
    db.jobOffer.count(),
    db.application.count(),
    db.application.groupBy({ by: ["status"], _count: true }),
  ]);

  const chartData = [
    { name: "Users", value: totalUsers },
    { name: "Companies", value: totalCompanies },
    { name: "Candidates", value: totalCandidates },
    { name: "Jobs", value: totalJobs },
    { name: "Applications", value: totalApplications },
  ];

  const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

  const pieData = statusCounts.map((s) => ({ name: s.status, value: s._count }));

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-5 gap-4 mb-8">
        {[
          { title: "Users", value: totalUsers, icon: Users },
          { title: "Companies", value: totalCompanies, icon: Building2 },
          { title: "Candidates", value: totalCandidates, icon: Users },
          { title: "Jobs", value: totalJobs, icon: Briefcase },
          { title: "Applications", value: totalApplications, icon: FileText },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Platform Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Applications by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
