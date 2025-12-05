# Pifflepath API Documentation

Welcome to the Pifflepath blockchain intelligence API. This is a comprehensive guide for developers to integrate Pifflepath into their applications and build powerful blockchain analysis tools.

## 🚀 Quick Start

### Installation

```bash
npm install pifflepath-sdk
# or
yarn add pifflepath-sdk
```

### Basic Usage

```javascript
import { PifflepathAPI } from 'pifflepath-sdk'

const client = new PifflepathAPI({
  apiKey: process.env.PIFFLEPATH_API_KEY,
})

// Get wallet details
const wallet = await client.wallet.getDetails('YourSolanaWalletAddress')
console.log(wallet)
```

## 📋 Table of Contents

- [Authentication](#authentication)
- [Wallet API](#wallet-api)
- [Transaction API](#transaction-api)
- [Token API](#token-api)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Examples](#examples)
- [Support](#support)

## 🔑 Authentication

All API requests require an API key. You can generate one in your [Pifflepath Dashboard](https://v0-webmain-2.vercel.app/dashboard).

Include your API key in the request header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.pifflepath.com/v1/wallet/...
```

Or using the SDK:

```javascript
const client = new PifflepathAPI({
  apiKey: 'your_api_key_here',
})
```

## 💼 Wallet API

### Get Wallet Details

Returns comprehensive information about a specific Solana wallet.

**Endpoint:** `GET /v1/wallet/{address}`

**Parameters:**
- `address` (string, required): The Solana wallet public key

**Example:**

```javascript
const walletDetails = await client.wallet.getDetails('9B5X4b33EsEkZeiMD3ukAe3L2Ug5yYvMcHLsuTmyrZi')

// Response
{
  address: '9B5X4b33EsEkZeiMD3ukAe3L2Ug5yYvMcHLsuTmyrZi',
  balance: 50.5,
  tokens: [
    {
      mint: 'EPjFWaLb3odccccccccccccccccccccccccPEKjyelQ',
      symbol: 'USDC',
      amount: 1000,
      value: 1000.50,
    },
  ],
  transactions: [...],
  lastUpdated: '2024-12-04T10:30:00Z',
}
```

### Get Wallet Transactions

Retrieve transaction history for a wallet.

**Endpoint:** `GET /v1/wallet/{address}/transactions`

**Parameters:**
- `address` (string, required): Wallet address
- `limit` (number, optional, default: 10): Number of transactions to return
- `offset` (number, optional, default: 0): Pagination offset
- `type` (string, optional): Filter by transaction type (send, receive, swap, etc.)

**Example:**

```javascript
const transactions = await client.wallet.getTransactions(
  '9B5X4b33EsEkZeiMD3ukAe3L2Ug5yYvMcHLsuTmyrZi',
  { limit: 50, type: 'swap' }
)
```

## 🔗 Transaction API

### Get Transaction Details

Get detailed information about a specific transaction.

**Endpoint:** `GET /v1/transaction/{signature}`

**Parameters:**
- `signature` (string, required): Transaction signature

**Example:**

```javascript
const tx = await client.transaction.getDetails(
  '5hqCp5rkZFJmKj1F1K2K3K4K5K6K7K8K9K0L1L2L3L4L5L6L7L8L9L'
)

// Response
{
  signature: '5hqCp5rkZFJmKj1F1K2K3K4K5K6K7K8K9K0L1L2L3L4L5L6L7L8L9L',
  blockTime: 1701689400,
  status: 'success',
  accounts: [...],
  instructions: [...],
  fee: 5000,
  signer: '9B5X4b33EsEkZeiMD3ukAe3L2Ug5yYvMcHLsuTmyrZi',
}
```

## 💱 Token API

### Get Token Information

Retrieve details about a specific SPL token.

**Endpoint:** `GET /v1/token/{mint}`

**Parameters:**
- `mint` (string, required): Token mint address

**Example:**

```javascript
const token = await client.token.getInfo('EPjFWaLb3odccccccccccccccccccccccccPEKjyelQ')

// Response
{
  mint: 'EPjFWaLb3odccccccccccccccccccccccccPEKjyelQ',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  supply: 5000000000,
  holders: 250000,
  price: 1.00,
  volume24h: 1500000000,
}
```

### Get Token Holders

Get top holders of a specific token.

**Endpoint:** `GET /v1/token/{mint}/holders`

**Parameters:**
- `mint` (string, required): Token mint address
- `limit` (number, optional, default: 20): Number of holders to return

**Example:**

```javascript
const holders = await client.token.getHolders(
  'EPjFWaLb3odccccccccccccccccccccccccPEKjyelQ',
  { limit: 50 }
)
```

## ⚠️ Error Handling

The API returns standard HTTP status codes and error messages:

```javascript
try {
  const wallet = await client.wallet.getDetails('invalid_address')
} catch (error) {
  if (error.status === 400) {
    console.log('Bad request:', error.message)
  } else if (error.status === 401) {
    console.log('Unauthorized - check your API key')
  } else if (error.status === 429) {
    console.log('Rate limited - please wait before retrying')
  } else if (error.status === 500) {
    console.log('Server error - please try again later')
  }
}
```

## 📊 Rate Limits

Rate limits depend on your plan:

| Plan | Requests/Day | Concurrent | Burst |
|------|-------------|-----------|-------|
| Free | 100 | 1 | 10 |
| Pro | 3,000 | 10 | 100 |
| Pro+ | 10,000 | 50 | 500 |

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 3000
X-RateLimit-Remaining: 2950
X-RateLimit-Reset: 1701776000
```

## 💡 Examples

### Track Whale Movements

```javascript
async function trackWhaleMovements(walletAddress) {
  const transactions = await client.wallet.getTransactions(walletAddress, {
    limit: 100,
    type: 'transfer',
  })

  const largeTransfers = transactions.filter((tx) => tx.amount > 1000000)

  console.log(`Found ${largeTransfers.length} large transfers`)
  return largeTransfers
}
```

### Analyze Token Distribution

```javascript
async function analyzeTokenDistribution(mint) {
  const token = await client.token.getInfo(mint)
  const holders = await client.token.getHolders(mint, { limit: 100 })

  const top10Concentration = holders
    .slice(0, 10)
    .reduce((sum, holder) => sum + holder.percentage, 0)

  console.log(`Top 10 holders own ${top10Concentration.toFixed(2)}% of ${token.symbol}`)
  return { token, holders, concentration: top10Concentration }
}
```

### Monitor Transaction Activity

```javascript
async function monitorActivity(walletAddress, interval = 60000) {
  setInterval(async () => {
    try {
      const wallet = await client.wallet.getDetails(walletAddress)
      console.log(`[${new Date().toISOString()}] Balance: ${wallet.balance} SOL`)

      if (wallet.balance < 1) {
        console.warn(`⚠️ Low balance alert! ${wallet.balance} SOL`)
      }
    } catch (error) {
      console.error('Error checking wallet:', error.message)
    }
  }, interval)
}
```

## 🔍 Additional Resources

- [Dashboard](https://v0-webmain-2.vercel.app/dashboard) - Manage your API keys and view usage
- [Documentation](https://v0-webmain-2.vercel.app/docs) - Full API documentation with interactive testing
- [Status Page](https://status.pifflepath.com) - Real-time API status
- [Blog](https://blog.pifflepath.com) - Latest updates and use cases

## 💬 Support

Need help? We're here for you:

- **Email:** support@pifflepath.com
- **Discord:** [Join our community](https://discord.gg/pifflepath)
- **GitHub Issues:** [Report bugs or suggest features](https://github.com/industralist/pifflepath_api/issues)
- **Documentation:** [Visit our docs](https://v0-webmain-2.vercel.app/docs)

## 📜 License

This SDK is licensed under the MIT License. See the LICENSE file in the repository for details.

---

**Made with ❤️ by the Pifflepath Team**

**Repository:** https://github.com/industralist/pifflepath_api
