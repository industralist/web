"use client";

import { useEffect, useState } from "react";
import { Plus, Trash } from "lucide-react";

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("api_keys") || "[]");
    setKeys(stored);
  }, []);

  const createKey = () => {
    const newKey = crypto.randomUUID();
    const updated = [...keys, newKey];
    setKeys(updated);
    localStorage.setItem("api_keys", JSON.stringify(updated));
  };

  const deleteKey = (key: string) => {
    const updated = keys.filter((k) => k !== key);
    setKeys(updated);
    localStorage.setItem("api_keys", JSON.stringify(updated));
  };

  return (
    <div className="p-8 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/5 transition-all">
      <h2 className="text-2xl font-bold mb-6">API Keys</h2>

      <button
        onClick={createKey}
        className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg mb-6 font-medium hover:opacity-90">
        <Plus className="w-4 h-4" />
        Create New API Key
      </button>

      {keys.length === 0 ? (
        <p className="text-gray-400">No API keys created yet.</p>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between bg-black/30 border border-white/10 px-4 py-3 rounded-lg">
              <span className="font-mono text-gray-300">{key}</span>
              <button
                onClick={() => deleteKey(key)}
                className="text-red-400 hover:text-red-500">
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
