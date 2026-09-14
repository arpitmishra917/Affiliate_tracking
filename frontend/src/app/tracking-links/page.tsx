"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface TrackingLink {
  id: string;
  tracking_code: string;
  offer_id: string;
  status: string;
  created_at: string;
}

export default function TrackingLinksPage() {
  const [links, setLinks] = useState<TrackingLink[]>([]);

  useEffect(() => {
    fetchApi("/tracking-links").then(setLinks).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Tracking Links</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map(link => (
              <tr key={link.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{link.tracking_code}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    link.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {link.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(link.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No tracking links found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
