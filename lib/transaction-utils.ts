import {
  type Connection,
  PublicKey,
  type Transaction,
  type TransactionInstruction,
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token"

export interface TransactionOptions {
  connection: Connection
  fromPublicKey: PublicKey
  toPublicKey: PublicKey
  tokenMint?: PublicKey
  amount: bigint
  priorityFee?: number
}

export async function createSOLTransferInstruction(
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  amount: bigint,
): Promise<TransactionInstruction> {
  return SystemProgram.transfer({
    fromPubkey: fromPublicKey,
    toPubkey: toPublicKey,
    lamports: Number(amount),
  })
}

/**
 * Creates a USDT token transfer instruction with proper error handling
 */
export async function createUSDTTransferInstruction(options: TransactionOptions): Promise<TransactionInstruction> {
  const { connection, fromPublicKey, toPublicKey, tokenMint, amount } = options

  try {
    if (!tokenMint) throw new Error("Token mint required for USDT transfer")

    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(tokenMint, fromPublicKey)
    const toTokenAccount = await getAssociatedTokenAddress(tokenMint, toPublicKey)

    // Verify accounts exist
    const fromAccountInfo = await connection.getAccountInfo(fromTokenAccount)
    if (!fromAccountInfo) {
      throw new Error("Sender token account does not exist. Please ensure you have USDT in your wallet.")
    }

    // Create transfer instruction
    const instruction = createTransferInstruction(fromTokenAccount, toTokenAccount, fromPublicKey, amount)

    return instruction
  } catch (error: any) {
    console.error("[v0] Error creating transfer instruction:", error)
    throw new Error(error.message || "Failed to create transaction instruction")
  }
}

/**
 * Builds a versioned transaction with proper blockhash and fee configuration
 */
export async function buildVersionedTransaction(
  connection: Connection,
  payer: PublicKey,
  instructions: TransactionInstruction[],
): Promise<VersionedTransaction> {
  try {
    const latestBlockhash = await connection.getLatestBlockhash()

    const messageV0 = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)
    return transaction
  } catch (error: any) {
    console.error("[v0] Error building versioned transaction:", error)
    throw new Error("Failed to build transaction: " + error.message)
  }
}

/**
 * Simulates a transaction before sending to catch potential errors early
 */
export async function simulateTransaction(
  connection: Connection,
  transaction: Transaction | VersionedTransaction,
  payer: PublicKey,
): Promise<{ success: boolean; error?: string }> {
  try {
    const simulation = await connection.simulateTransaction(transaction)

    if (simulation.value.err) {
      const errorMessage =
        typeof simulation.value.err === "string" ? simulation.value.err : JSON.stringify(simulation.value.err)
      return {
        success: false,
        error: `Transaction simulation failed: ${errorMessage}`,
      }
    }

    if (simulation.value.logs) {
      const errorLog = simulation.value.logs.find((log) => log.includes("Error"))
      if (errorLog) {
        return {
          success: false,
          error: `Transaction error: ${errorLog}`,
        }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Simulation error:", error)
    return {
      success: false,
      error: error.message || "Transaction simulation failed",
    }
  }
}

export function validatePaymentParams(
  amount: number,
  recipientAddress: string,
  plan: "Pro" | "Pro+",
  billingPeriod: "monthly" | "yearly",
  paymentMethod: "SOL" | "USDT",
): { valid: boolean; error?: string } {
  // Payment amounts for monthly
  let expectedAmount = plan === "Pro" ? 300 : 500
  // Yearly is 10x monthly
  if (billingPeriod === "yearly") {
    expectedAmount = expectedAmount * 10
  }

  if (amount !== expectedAmount) {
    return {
      valid: false,
      error: `Invalid amount. Expected ${expectedAmount} ${paymentMethod} for ${plan} plan (${billingPeriod}), got ${amount} ${paymentMethod}`,
    }
  }

  // Basic address validation
  try {
    new PublicKey(recipientAddress)
  } catch {
    return {
      valid: false,
      error: "Invalid recipient address",
    }
  }

  return { valid: true }
}

/**
 * Parses transaction errors and returns user-friendly messages
 */
export function parseTransactionError(error: any): string {
  if (!error) return "An unknown error occurred"

  const errorMessage = error.message || error.toString()

  if (errorMessage.includes("insufficient lamports")) {
    return "Insufficient SOL for transaction fees. Please add more SOL to your wallet."
  }

  if (errorMessage.includes("token balance")) {
    return "Insufficient token balance. Please ensure you have enough tokens to complete the payment."
  }

  if (errorMessage.includes("account not found")) {
    return "Token account not found. Please ensure your wallet has the required token account."
  }

  if (errorMessage.includes("simulation failed")) {
    return "Transaction validation failed. Please check your wallet balance and try again."
  }

  if (errorMessage.includes("Blockhash not found")) {
    return "Network error. Please try again."
  }

  if (errorMessage.includes("User rejected")) {
    return "Transaction cancelled by user."
  }

  return errorMessage || "Transaction failed. Please try again."
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.floor(sol * LAMPORTS_PER_SOL))
}
