"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", address: "" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [targetManager, setTargetManager] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState("");

  const refreshUsers = () => {
    fetchApi("/users").then(setUsers).catch(console.error);
  }

  useEffect(() => {
    if (user?.role === "ADMIN") {
      refreshUsers();
      fetchApi("/offers").then(setOffers).catch(console.error);
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role: "MANAGER", status: "ACTIVE" };
      await fetchApi("/users/managers", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      refreshUsers();
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", phone: "", address: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { 
        name: editUser.name, 
        email: editUser.email, 
        phone: editUser.phone, 
        address: editUser.address 
      };
      if (editUser.password) {
        payload.password = editUser.password;
      }

      await fetchApi(`/users/${editUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      refreshUsers();
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleStatus = async (u: any) => {
    try {
      if (u.status === "ACTIVE") {
        await fetchApi(`/users/${u.id}/deactivate`, { method: "POST" });
      } else {
        await fetchApi(`/users/${u.id}/activate`, { method: "POST" });
      }
      refreshUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/users/${targetManager.id}/offers/${selectedOfferId}`, {
        method: "POST"
      });
      alert("Offer assigned successfully!");
      setShowOfferModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (user?.role !== "ADMIN") {
    return <DashboardLayout><p>Access Denied</p></DashboardLayout>;
  }

  const managers = users.filter(u => u.role === "MANAGER");

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Managers</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700"
        >
          + New Manager
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {managers.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link href={`/affiliates?manager_id=${u.id}`} className="text-purple-600 hover:text-purple-900">
                    View Affiliates
                  </Link>
                  <button onClick={() => {setEditUser(u); setShowEditModal(true);}} className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button onClick={() => toggleStatus(u)} className="text-gray-600 hover:text-gray-900">
                    {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => {setTargetManager(u); setShowOfferModal(true);}} className="text-green-600 hover:text-green-900">Assign Offer</button>
                </td>
              </tr>
            ))}
            {managers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No managers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Manager</h2>
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
                <input required type="password" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Phone</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Address</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Manager</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Name</label>
                <input required type="text" className="w-full border p-2 rounded" value={editUser.name || ""} onChange={e => setEditUser({...editUser, name: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Email</label>
                <input required type="email" className="w-full border p-2 rounded" value={editUser.email || ""} onChange={e => setEditUser({...editUser, email: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Phone / Contact No.</label>
                <input type="text" className="w-full border p-2 rounded" value={editUser.phone || ""} onChange={e => setEditUser({...editUser, phone: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Address</label>
                <input type="text" className="w-full border p-2 rounded" value={editUser.address || ""} onChange={e => setEditUser({...editUser, address: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">New Password (Leave blank to keep unchanged)</label>
                <input type="password" placeholder="***" className="w-full border p-2 rounded" value={editUser.password || ""} onChange={e => setEditUser({...editUser, password: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOfferModal && targetManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Offer to {targetManager.name}</h2>
            <form onSubmit={handleAssignOffer}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Offer</label>
                <select required className="w-full border p-2 rounded" value={selectedOfferId} onChange={e => setSelectedOfferId(e.target.value)}>
                  <option value="">Select an offer...</option>
                  {offers.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowOfferModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
