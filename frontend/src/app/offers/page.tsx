"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Offer {
  id: string;
  name: string;
  advertiser_name: string;
  status: string;
  destination_url: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    advertiser_name: "", 
    destination_url: "",
    click_id_parameter: "click_id",
    sub_id_parameter: "sub_id"
  });

  useEffect(() => {
    fetchApi("/offers").then(setOffers).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, status: "ACTIVE" };
      const newOffer = await fetchApi("/offers", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setOffers([...offers, newOffer]);
      setShowModal(false);
      setFormData({ name: "", advertiser_name: "", destination_url: "", click_id_parameter: "click_id", sub_id_parameter: "sub_id" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Offers</h1>
        {user?.role === "ADMIN" && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700"
          >
            + New Offer
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advertiser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map(offer => (
              <tr key={offer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{offer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.advertiser_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    offer.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.role === "AFFILIATE" ? (
                    <Link href={`/offers/${offer.id}`} className="text-blue-600 hover:text-blue-900">
                      Get Link
                    </Link>
                  ) : (
                    <Link href={`/offers/${offer.id}`} className="text-gray-600 hover:text-gray-900">
                      View
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No offers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Offer</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Name</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Advertiser</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.advertiser_name} onChange={e => setFormData({...formData, advertiser_name: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Destination URL</label>
                <input required type="url" placeholder="https://..." className="w-full border p-2 rounded" value={formData.destination_url} onChange={e => setFormData({...formData, destination_url: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
