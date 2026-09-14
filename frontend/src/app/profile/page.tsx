"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-lg text-gray-900">{user.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-lg text-gray-900">{user.role}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
