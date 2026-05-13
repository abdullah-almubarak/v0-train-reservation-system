"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-xl font-semibold">{user.name}</p>
              <Badge variant="secondary" className="mt-1 capitalize">
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={user.name} readOnly className="pl-10 bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={user.email} readOnly className="pl-10 bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  readOnly
                  className="pl-10 bg-muted capitalize"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  readOnly
                  className="pl-10 bg-muted"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Profile editing is disabled in this demo. Contact support for account changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
