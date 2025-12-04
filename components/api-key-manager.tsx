"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Trash2, Copy, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  created_at: string
  last_used_at?: string
}

export function ApiKeyManager() {
  const { user } = useAuth()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      fetchApiKeys()
    }
  }, [user])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys/list", {
        headers: { "x-user-id": user?.id! },
      })
      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys)
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
      toast.error("Failed to load API keys")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/api-keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedKey(data.apiKey)
        setNewKeyName("")
        await fetchApiKeys()
        toast.success("API key created successfully")
      } else {
        toast.error("Failed to create API key")
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      toast.error("Error creating API key")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return

    try {
      const response = await fetch("/api/api-keys/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, userId: user?.id }),
      })

      if (response.ok) {
        setKeys(keys.filter((k) => k.id !== keyId))
        toast.success("API key deleted")
      } else {
        toast.error("Failed to delete API key")
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast.error("Error deleting API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-muted-foreground">Manage your API keys for programmatic access</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-orange-600">
              <Plus className="w-4 h-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateKey} disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create API Key"
                )}
              </Button>
            </div>

            {generatedKey && (
              <div className="mt-6 p-4 bg-card-bg border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Your API Key (save this securely):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-background p-2 rounded font-mono break-all">{generatedKey}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedKey)} className="gap-2">
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : keys.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No API keys yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {keys.map((key) => (
            <Card key={key.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold">{key.name}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(key.created_at).toLocaleDateString()}
                  {key.last_used_at && (
                    <>
                      {" | Last used: "}
                      {new Date(key.last_used_at).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteKey(key.id)} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
