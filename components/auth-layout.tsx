"use client"

import type React from "react"

import { AppSidebar } from "./app-sidebar"
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Mobile sidebar toggle - only visible on small screens */}
          <div className="md:hidden flex items-center gap-2 p-4 border-b border-border">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">Menu</span>
          </div>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
