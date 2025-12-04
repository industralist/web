"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  created_at: string
  last_used_at?: string
}

export default function ApiKeysPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [creatingKey, setCreatingKey] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})

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
        // Copy to clipboard
        navigator.clipboard.writeText(data.apiKey)
        toast.success("Key copied to clipboard")
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
    if (!confirm("Are you sure you want to delete this API key?")) return

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
      <div>
        <h1 className="text-4xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground">Create and manage your API keys for accessing the Pifflepath API.</p>
      </div>

      {/* Create New Key */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Create New API Key</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Enter a descriptive name for this key..."
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
          />
          <Button onClick={handleCreateKey} disabled={creatingKey} className="gap-2">
            <Plus className="w-4 h-4" />
            {creatingKey ? "Creating..." : "Create"}
          </Button>
        </div>
      </Card>

      {/* API Keys List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Your API Keys</h2>
        {keys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No API keys yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold">{key.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setVisibleKeys({ ...visibleKeys, [key.id]: !visibleKeys[key.id] })}
                  >
                    {visibleKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(key.id)
                      toast.success("Key ID copied to clipboard")
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Documentation */}
      <Card className="p-6 bg-card-bg/50">
        <h3 className="font-semibold mb-3">How to use your API Key</h3>
        <div className="bg-background p-4 rounded border border-border text-sm font-mono overflow-x-auto">
          <code className="text-foreground/70">
            curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
            https://api.pifflepath.com/v1/wallet/search
          </code>
        </div>
      </Card>
    </main>
  )
}
