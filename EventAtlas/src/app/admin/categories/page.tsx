"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#6366f1");

  const fetchCategories = () => {
    fetch("/api/admin/categories").then((r) => r.json()).then((data) => setCategories(data.categories || []));
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    if (!name || !slug) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, color }),
    });
    setName(""); setSlug(""); setColor("#6366f1");
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCategories();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold mb-3">Add Category</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-gray-500">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="block border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="block border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="block h-10 w-16 rounded border" />
          </div>
          <button onClick={addCategory} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left text-gray-500">
            <th className="p-3">Color</th><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Events</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color || "#6366f1" }} /></td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-gray-500">{c.slug}</td>
                <td className="p-3">{c._count?.events || 0}</td>
                <td className="p-3">
                  <button onClick={() => deleteCategory(c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
