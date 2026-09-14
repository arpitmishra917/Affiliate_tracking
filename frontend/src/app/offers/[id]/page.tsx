"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";

export default function OfferDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [offer, setOffer] = useState<any>(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi(`/offers/${id}`).then(setOffer).catch(console.error);
  }, [id]);

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setError("");
      setGeneratedLink("");
      
      const payload = { offer_id: id };
      const res = await fetchApi("/tracking-links", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      setGeneratedLink(res.url);
    } catch (err: any) {
      setError(err.message || "Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Copied!");
  };

  if (!offer) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{offer.name}</h1>
        <p className="text-gray-600 mb-6">Advertiser: {offer.advertiser_name}</p>

        {["AFFILIATE", "MANAGER"].includes(user?.role || "") && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Generate Tracking Link</h2>
            
            {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}

            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Tracking Link"}
            </button>

            {generatedLink && (
              <div className="mt-6 p-4 bg-gray-50 border rounded">
                <p className="text-sm text-gray-500 mb-2">Your Tracking Link:</p>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedLink}
                    className="flex-1 px-3 py-2 border rounded bg-white"
                  />
                  <button 
                    onClick={copyLink}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Edit Offer</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const target = e.target as any;
                const payload = {
                  name: target.name.value,
                  advertiser_name: target.advertiser_name.value,
                  destination_url: target.destination_url.value
                };
                await fetchApi(`/offers/${id}`, {
                  method: "PATCH",
                  body: JSON.stringify(payload)
                });
                alert("Updated successfully!");
                fetchApi(`/offers/${id}`).then(setOffer);
              } catch (err: any) {
                alert(err.message);
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Name</label>
                <input required type="text" name="name" className="w-full border p-2 rounded" defaultValue={offer.name} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Advertiser</label>
                <input required type="text" name="advertiser_name" className="w-full border p-2 rounded" defaultValue={offer.advertiser_name} />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Destination URL</label>
                <input required type="url" name="destination_url" className="w-full border p-2 rounded" defaultValue={offer.destination_url} />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  offer.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  Status: {offer.status}
                </span>
                
                <div className="space-x-2">
                  <button type="button" onClick={async () => {
                    try {
                      await fetchApi(`/offers/${id}/${offer.status === "ACTIVE" ? "deactivate" : "activate"}`, { method: "POST" });
                      fetchApi(`/offers/${id}`).then(setOffer);
                    } catch (err: any) { alert(err.message); }
                  }} className="text-gray-600 bg-gray-200 px-4 py-2 rounded">
                    Toggle Status
                  </button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
