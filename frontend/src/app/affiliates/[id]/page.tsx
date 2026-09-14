"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AffiliateDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [assignedOffers, setAssignedOffers] = useState<any[]>([]);
  
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "", password: "", status: "" });

  const loadData = () => {
    fetchApi(`/affiliates/${id}`).then(res => {
      setAffiliate(res);
      setEditForm({ 
        name: res.user?.name || "", 
        email: res.user?.email || "", 
        phone: res.user?.phone || "", 
        address: res.user?.address || "",
        password: "",
        status: res.status 
      });
    }).catch(console.error);

    fetchApi(`/affiliates/${id}/offers`).then(setAssignedOffers).catch(console.error);
    
    if (["ADMIN", "MANAGER"].includes(user?.role || "")) {
      fetchApi("/offers").then(setOffers).catch(console.error);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { 
        name: editForm.name, 
        email: editForm.email, 
        phone: editForm.phone, 
        address: editForm.address,
        status: editForm.status
      };
      if (editForm.password) payload.password = editForm.password;

      await fetchApi(`/affiliates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setShowEdit(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/affiliates/${id}/offers/${selectedOfferId}`, {
        method: "POST"
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!affiliate) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Affiliate Details</h1>
          {["ADMIN", "MANAGER"].includes(user?.role || "") && (
            <button onClick={() => setShowEdit(true)} className="text-blue-600 hover:underline">Edit</button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Affiliate Code</label>
            <p className="mt-1 text-lg text-blue-600 font-mono">{affiliate.affiliate_code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{affiliate.user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{affiliate.user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact No.</label>
            <p className="mt-1 text-gray-900">{affiliate.user?.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-gray-900">{affiliate.user?.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                affiliate.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
                {affiliate.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created At</label>
            <p className="mt-1 text-gray-900">{new Date(affiliate.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Assigned Offers</h2>
        <ul className="mb-6 space-y-2">
          {assignedOffers.map((o: any) => (
            <li key={o.id} className="p-3 bg-gray-50 border rounded flex justify-between items-center">
              <span>{o.name} - {o.advertiser_name}</span>
            </li>
          ))}
          {assignedOffers.length === 0 && <p className="text-sm text-gray-500">No offers assigned yet.</p>}
        </ul>

        {["ADMIN", "MANAGER"].includes(user?.role || "") && (
          <form onSubmit={handleAssignOffer} className="flex gap-2">
            <select required className="flex-1 border p-2 rounded" value={selectedOfferId} onChange={e => setSelectedOfferId(e.target.value)}>
              <option value="">Select an offer to assign...</option>
              {offers.filter(o => !assignedOffers.find(ao => ao.id === o.id)).map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Assign</button>
          </form>
        )}
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Affiliate</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Name</label>
                <input required type="text" className="w-full border p-2 rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Email</label>
                <input required type="email" className="w-full border p-2 rounded" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Phone / Contact No.</label>
                <input type="text" className="w-full border p-2 rounded" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Address</label>
                <input type="text" className="w-full border p-2 rounded" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">New Password (Leave blank to keep unchanged)</label>
                <input type="password" placeholder="***" className="w-full border p-2 rounded" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Status</label>
                <select className="w-full border p-2 rounded" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
