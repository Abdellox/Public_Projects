"use client";
import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

export default function AdminCountries() {
  const [countries, setCountries] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countrySlug, setCountrySlug] = useState("");
  const [cityName, setCityName] = useState("");
  const [citySlug, setCitySlug] = useState("");

  const fetchData = () => {
    fetch("/api/admin/countries").then((r) => r.json()).then((data) => setCountries(data.countries || []));
  };

  useEffect(() => { fetchData(); }, []);

  const addCountry = async () => {
    if (!countryName || !countryCode || !countrySlug) return;
    await fetch("/api/admin/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: countryName, code: countryCode, slug: countrySlug }),
    });
    setCountryName(""); setCountryCode(""); setCountrySlug("");
    fetchData();
  };

  const addCity = async (countryId: string) => {
    if (!cityName || !citySlug) return;
    await fetch("/api/admin/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cityName, slug: citySlug, countryId }),
    });
    setCityName(""); setCitySlug("");
    fetchData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Countries & Cities</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold mb-3">Add Country</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div><label className="text-xs text-gray-500">Name</label><input value={countryName} onChange={(e) => setCountryName(e.target.value)} className="block border rounded px-3 py-2 text-sm" /></div>
          <div><label className="text-xs text-gray-500">Code (2 letters)</label><input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} className="block border rounded px-3 py-2 text-sm w-20" maxLength={2} /></div>
          <div><label className="text-xs text-gray-500">Slug</label><input value={countrySlug} onChange={(e) => setCountrySlug(e.target.value)} className="block border rounded px-3 py-2 text-sm" /></div>
          <button onClick={addCountry} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-indigo-700"><Plus className="h-4 w-4" /> Add</button>
        </div>
      </div>
      <div className="space-y-3">
        {countries.map((country) => (
          <div key={country.id} className="bg-white rounded-xl shadow overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === country.id ? null : country.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {expanded === country.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="text-lg font-medium">{country.emoji} {country.name}</span>
                <span className="text-sm text-gray-500">({country._count?.cities || 0} cities)</span>
              </div>
            </button>
            {expanded === country.id && (
              <div className="border-t p-4">
                <div className="flex gap-2 mb-3">
                  <input value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder="City name" className="border rounded px-3 py-1 text-sm" />
                  <input value={citySlug} onChange={(e) => setCitySlug(e.target.value)} placeholder="slug" className="border rounded px-3 py-1 text-sm" />
                  <button onClick={() => addCity(country.id)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm hover:bg-indigo-200">Add City</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {country.cities?.map((city: any) => (
                    <span key={city.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">{city.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
