"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState, Suspense } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";

function AffiliatesContent() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const managerId = searchParams.get("manager_id");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", password: "", manager_id: "" });
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    let url = "/affiliates";
    if (managerId) url += `?manager_id=${managerId}`;
    fetchApi(url).then(setAffiliates).catch(console.error);
    if (user?.role === "ADMIN") {
      fetchApi("/users").then(data => {
        setManagers(data.filter((u: any) => u.role === "MANAGER"));
      }).catch(console.error);
    }
  }, [user, managerId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name: formData.name, email: formData.email, phone: formData.phone, address: formData.address };
      if (formData.password) payload.password = formData.password;
      if (user?.role === "ADMIN") {
        payload.manager_id = formData.manager_id;
      }
      
      const newAff = await fetchApi("/affiliates", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setAffiliates([...affiliates, newAff]);
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "", manager_id: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Affiliates</h1>
        {["ADMIN", "MANAGER"].includes(user?.role || "") && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700"
          >
            + New Affiliate
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {affiliates.map(aff => (
              <tr key={aff.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href={`/affiliates/${aff.id}`} className="text-blue-600 hover:underline">
                    {aff.affiliate_code}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{aff.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aff.user?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aff.user?.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    aff.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {aff.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(aff.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {affiliates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No affiliates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Affiliate</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Name</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Email</label>
                <input required type="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Password</label>
                <input type="password" placeholder="Leave blank to use default 'password123'" className="w-full border p-2 rounded" value={formData.password || ""} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Phone</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Address</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              {user?.role === "ADMIN" && (
                <div className="mb-4">
                  <label className="block text-sm mb-1">Assign to Manager</label>
                  <select required className="w-full border p-2 rounded" value={formData.manager_id} onChange={e => setFormData({...formData, manager_id: e.target.value})}>
                    <option value="">Select a manager...</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function AffiliatesPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading affiliates...</div>}>
        <AffiliatesContent />
      </Suspense>
    </DashboardLayout>
  );
}
