"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizerSchema } from "@/lib/validations";
import { Building2 } from "lucide-react";

export default function OrganizerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(organizerSchema) });

  useEffect(() => {
    fetch("/api/organizer/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          reset(data.profile);
        }
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/organizer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch {
      setMessage("An error occurred.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold">Organizer Profile</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Organization Name *</label>
          <input {...register("name")} className="w-full border rounded-lg px-3 py-2" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name?.message)}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea {...register("description")} rows={3} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input {...register("website")} className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input {...register("email")} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input {...register("phone")} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Facebook</label>
            <input {...register("facebook")} className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Twitter</label>
            <input {...register("twitter")} className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input {...register("instagram")} className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn</label>
            <input {...register("linkedin")} className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
        </div>
        {message && <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>{message}</p>}
        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
