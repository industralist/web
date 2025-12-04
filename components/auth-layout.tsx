"use client"

import type React from "react"

import { AppSidebar } from "./app-sidebar"
import { SidebarProvider } from "./ui/sidebar"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}
