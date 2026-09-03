"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = () => {
    fetch(`/api/admin/users?page=${page}&search=${search}`).then((r) => r.json()).then((data) => setUsers(data.users || []));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const updateRole = async (userId: string, role: string) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Joined</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.name || "—"}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.role === "ADMIN" ? "bg-red-100 text-red-700" :
                    u.role === "ORGANIZER" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>{u.role}</span>
                </td>
                <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="USER">User</option>
                    <option value="ORGANIZER">Organizer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2 mt-4 justify-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded text-sm">Prev</button>
          <span className="px-3 py-1 text-sm">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-100 rounded text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}
