"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import ApiKeyManager from "@/components/apiKeyManager";
import SubscriptionCard from "@/components/subscriptionCard";

export default function DashboardPage() {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const [currentPlan, setCurrentPlan] = useState("Free");

  useEffect(() => {
    const plan = localStorage.getItem("user_plan") || "Free";
    setCurrentPlan(plan);
  }, []);

  const handleWalletConnect = () => {
    if (!wallet.connected) {
      walletModal.setVisible(true); 
    } else {
      wallet.disconnect();
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center max-w-md p-10 border border-white/10 bg-white/3 rounded-2xl">
          <Wallet className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-4">Connect Your Wallet</h1>

          <p className="text-gray-400 mb-8">
            Access your dashboard, manage API keys, and upgrade your plan.
          </p>

          <button
            onClick={handleWalletConnect}
            className="w-full py-3 rounded-lg cursor-pointer font-medium bg-linear-to-r from-orange-500 to-red-500 hover:opacity-90">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-extrabold mb-6">Dashboard</h1>
        <p className="text-gray-400 text-lg mb-12">
          View your plan, manage API keys, and upgrade anytime.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <SubscriptionCard currentPlan={currentPlan} />
          <div>
            <ApiKeyManager />
          </div>
        </div>
      </section>
    </div>
  );
}
