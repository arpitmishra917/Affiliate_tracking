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
  const [subId, setSubId] = useState("");
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
      
      const payload = { offer_id: id, sub_id: subId || null };
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

        {user?.role === "AFFILIATE" && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Generate Tracking Link</h2>
            
            {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Reference (Sub ID) - Optional
              </label>
              <input
                type="text"
                placeholder="e.g. RAJ458"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                value={subId}
                onChange={(e) => setSubId(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Do not enter full phone numbers, government IDs, passwords, or other sensitive information.
              </p>
            </div>

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
      </div>
    </DashboardLayout>
  );
}
