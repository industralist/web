"use client";
import { WalletSearch } from "@/components/wallet-search";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RotatingGlobe } from "@/components/rotating-globe";
import { AnimatedLine } from "@/components/animated-line";
import { NetworkOverview } from "@/components/network-overview";
import { HomeOverview } from "@/components/home-overview";
import { useState } from "react";

export default function Page() {
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <RotatingGlobe />

      <AnimatedLine />

      {/* <Header /> */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-8">
          {!walletAddress && (
            <>
              <NetworkOverview />
              <HomeOverview />
            </>
          )}

          <div className="animate-slide-in">
            <WalletSearch
              onAddressSubmit={(address) => setWalletAddress(address)}
            />
          </div>

          {walletAddress && (
            <div className="animate-fade-in">
              <DashboardLayout walletAddress={walletAddress} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
