"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Key, Copy, Trash2, Plus, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface ApiKey {
  id: string
  name: string
  created_at: string
  last_used_at?: string | null
}

export default function ApiKeysPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [creatingKey, setCreatingKey] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [fetchingKeys, setFetchingKeys] = useState(true)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchKeys()
    }
  }, [user])

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/api-keys/list", {
        headers: { "x-user-id": user?.id || "" },
      })
      const data = await res.json()
      setKeys(data.keys || [])
    } catch (error) {
      console.error("Error fetching keys:", error)
      toast.error("Failed to load API keys")
    } finally {
      setFetchingKeys(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name")
      return
    }

    setCreatingKey(true)
    try {
      const res = await fetch("/api/api-keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, name: newKeyName }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("API key created successfully!")
        setGeneratedKey(data.apiKey)
        setNewKeyName("")
        fetchKeys()
      } else {
        toast.error(data.error || "Failed to create API key")
      }
    } catch (error) {
      console.error("Error creating key:", error)
      toast.error("Failed to create API key")
    } finally {
      setCreatingKey(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return

    try {
      const res = await fetch("/api/api-keys/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, userId: user?.id }),
      })

      if (res.ok) {
        toast.success("API key deleted")
        fetchKeys()
      } else {
        toast.error("Failed to delete API key")
      }
    } catch (error) {
      console.error("Error deleting key:", error)
      toast.error("Failed to delete API key")
    }
  }

  const copyToClipboard = (text: string, label = "Copied") => {
    navigator.clipboard.writeText(text)
    toast.success(label)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-4xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">
          Create and manage your API keys for accessing Pifflepath's blockchain intelligence APIs.
        </p>
      </motion.div>

      {/* Create New Key Dialog */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 px-6 py-2">
              <Plus className="w-4 h-4" />
              Create New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Key Name (e.g., "Production API")</label>
                <Input
                  placeholder="Descriptive name for this API key..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !creatingKey && handleCreateKey()}
                  disabled={creatingKey}
                  autoFocus
                />
              </div>

              {/* Generated Key Display */}
              {generatedKey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-gradient-to-b from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Key created successfully!</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Your API Key (save this securely):</p>
                    <div className="flex gap-2">
                      <code className="flex-1 text-xs bg-background p-3 rounded font-mono break-all border border-border">
                        {generatedKey}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedKey, "Key copied to clipboard!")}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleCreateKey} disabled={creatingKey || !newKeyName.trim()} className="flex-1">
                  {creatingKey ? "Creating..." : "Create API Key"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (generatedKey) {
                      setGeneratedKey(null)
                      setNewKeyName("")
                      setDialogOpen(false)
                      fetchKeys()
                    }
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
      >
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 dark:text-amber-400">
          <p className="font-medium">Keep your API keys secure</p>
          <p className="text-xs opacity-90">
            Treat API keys like passwords. Never commit them to version control or share them publicly.
          </p>
        </div>
      </motion.div>

      {/* API Keys List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your API Keys ({keys.length})</h2>

          {fetchingKeys ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No API keys yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first API key to start using the Pifflepath API.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key, index) => (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{key.name}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Active</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created{" "}
                      {new Date(key.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {key.last_used_at ? (
                        <> • Last used {new Date(key.last_used_at).toLocaleDateString()}</>
                      ) : (
                        <> • Never used</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(key.id, "Key ID copied!")}
                      title="Copy Key ID"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete API key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Usage Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Using Your API Key</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-2">Include your API key in the Authorization header:</p>
              <div className="bg-background p-3 rounded border border-border font-mono text-xs overflow-x-auto">
                <code className="text-foreground/70">Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Example cURL request:</p>
              <div className="bg-background p-3 rounded border border-border font-mono text-xs overflow-x-auto">
                <code className="text-foreground/70">
                  curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                  https://api.pifflepath.com/v1/wallet/EPjFWaLb3o
                </code>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">API Endpoints</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-mono text-primary text-xs">GET /v1/wallet/:address</p>
              <p className="text-muted-foreground text-xs">Fetch wallet data (balance, tokens, transactions)</p>
            </div>
            <div>
              <p className="font-mono text-primary text-xs">GET /v1/wallet/:address/transactions</p>
              <p className="text-muted-foreground text-xs">Get detailed transaction history</p>
            </div>
            <div>
              <p className="font-mono text-primary text-xs">GET /v1/tokens/trending</p>
              <p className="text-muted-foreground text-xs">Get current token prices and trends</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  )
}
