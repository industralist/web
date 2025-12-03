"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

export function usePlanUpgrade() {
  const { connected, publicKey, sendTransaction, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  const connection = new Connection(
    `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
    "confirmed"
  );

  const merchantAddress = new PublicKey(
    `${process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION}`
  );

  const upgradePlan = useCallback(
    async (plan: "Pro" | "Pro+") => {
      try {
        if (!connected) {
          await connect();
          return;
        }

        setLoading(true);
        setSuccessPlan(null);

        const price = plan === "Pro" ? 0.1 : 0.2;
        const lamports = price * 1_000_000_000;

        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey!,
            toPubkey: merchantAddress,
            lamports,
          })
        );

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, "confirmed");

        // Persist plan
        localStorage.setItem("user_plan", plan);
        setSuccessPlan(plan);
      } catch (err) {
        console.error("Payment upgrade error:", err);
      } finally {
        setLoading(false);
      }
    },
    [connected, connect, publicKey, sendTransaction, connection]
  );

  return {
    upgradePlan,
    loading,
    successPlan,
    connected,
  };
}
