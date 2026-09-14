"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface Click {
  id: string;
  click_id: string;
  sub_id: string | null;
  clicked_at: string;
  ip_address: string | null;
}

export default function ClicksPage() {
  const [clicks, setClicks] = useState<Click[]>([]);

  useEffect(() => {
    fetchApi("/clicks").then(res => setClicks(res.data || res)).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Clicks</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clicks.map(click => (
              <tr key={click.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px]">{click.click_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{click.sub_id || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(click.clicked_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{click.ip_address || "Unknown"}</td>
              </tr>
            ))}
            {clicks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No clicks recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
