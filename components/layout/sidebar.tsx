"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  Ticket,
  Users,
  BarChart3,
  Settings,
  Train,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["passenger", "staff", "manager"],
  },
  {
    title: "Search Trips",
    href: "/search",
    icon: Search,
    roles: ["passenger", "staff", "manager"],
  },
  {
    title: "My Reservations",
    href: "/reservations",
    icon: Ticket,
    roles: ["passenger"],
  },
  {
    title: "All Reservations",
    href: "/manage-reservations",
    icon: Ticket,
    roles: ["staff", "manager"],
  },
  {
    title: "Schedules",
    href: "/schedules",
    icon: CalendarDays,
    roles: ["staff", "manager"],
  },
  {
    title: "Passengers",
    href: "/passengers",
    icon: Users,
    roles: ["staff", "manager"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["manager"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
            <Train className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
