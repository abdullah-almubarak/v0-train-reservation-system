"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Search,
  Ticket,
  CalendarDays,
  BarChart3,
} from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const navItems = [
    {
      title: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["passenger", "staff", "manager"],
    },
    {
      title: "Search",
      href: "/search",
      icon: Search,
      roles: ["passenger", "staff", "manager"],
    },
    {
      title: "Tickets",
      href: user.role === "passenger" ? "/reservations" : "/manage-reservations",
      icon: Ticket,
      roles: ["passenger", "staff", "manager"],
    },
    {
      title: "Schedule",
      href: "/schedules",
      icon: CalendarDays,
      roles: ["staff", "manager"],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["manager"],
    },
  ].filter((item) => item.roles.includes(user.role))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
