"use client"

import { AuthProvider } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  )
}
