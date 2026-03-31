"use client";

import React, { useState } from "react";
import { assignRoleByEmail } from "@/app/actions/auth";

export default function DevSetupPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Expert");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await assignRoleByEmail(email, role);
      if (res.success) {
        setMessage(`✅ ${res.message}. Please log out and log in again with this email.`);
      } else {
        setMessage(`❌ Error: ${res.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Dev Tools: Role Setup</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Use this internal tool to assign specific roles to accounts during development.
          In production, this will be handled by the Admin/Center dashboards.
        </p>

        <form onSubmit={handleAssignRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">User Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Expert@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Target Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
            >
              <option value="admin">Admin (System Owner)</option>
              <option value="center">Center</option>
              <option value="Expert">Expert</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign Role"}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm ${message.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
