"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    if (user) {
      fetchApi("/clicks/stats").then(res => {
        setStats({ totalClicks: res.total_clicks });
      }).catch(err => console.error(err));
    }
  }, [user]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Total Clicks</h3>
          <p className="text-3xl font-bold mt-2">{stats ? stats.totalClicks : "..."}</p>
        </div>
        
        {user.role !== "AFFILIATE" && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Role Status</h3>
            <p className="text-xl font-bold mt-2 text-blue-600">{user.role}</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Welcome back, {user.name}</h2>
        <p className="text-gray-600">
          This is your {user.role.toLowerCase()} dashboard. Use the navigation above to manage your affiliate network.
        </p>
      </div>
    </DashboardLayout>
  );
}
