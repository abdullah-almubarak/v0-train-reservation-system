"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { TrainService, ReservationService, ReportingService } from "@/lib/services"
import type { TrainSchedule, Reservation } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Train,
  Ticket,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  CalendarDays,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    reservations: { total: 0, confirmed: 0, cancelled: 0, totalRevenue: 0 },
    schedules: { total: 0, scheduled: 0, totalCapacity: 0, totalBooked: 0, occupancyRate: 0 },
  })
  const [upcomingTrips, setUpcomingTrips] = useState<TrainSchedule[]>([])
  const [myReservations, setMyReservations] = useState<Reservation[]>([])

  useEffect(() => {
    // Load stats
    setStats({
      reservations: ReportingService.getReservationStats(),
      schedules: ReportingService.getScheduleStats(),
    })

    // Load upcoming schedules
    setUpcomingTrips(TrainService.getAllSchedules().slice(0, 3))

    // Load user reservations
    if (user) {
      setMyReservations(
        ReservationService.getPassengerReservations(user.id).filter(
          (r) => r.status === "confirmed"
        )
      )
    }
  }, [user])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const h = parseInt(hours)
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  // Different dashboards based on role
  if (user?.role === "manager") {
    return <ManagerDashboard stats={stats} />
  }

  if (user?.role === "staff") {
    return <StaffDashboard stats={stats} />
  }

  // Passenger dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Ready for your next journey? Search for trips or manage your bookings.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/search" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Search Trips</p>
                <p className="text-sm text-muted-foreground">Find and book trains</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/reservations" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10">
                <Ticket className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="font-semibold">My Reservations</p>
                <p className="text-sm text-muted-foreground">
                  {myReservations.length} active bookings
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/profile" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <p className="font-semibold">Profile</p>
                <p className="text-sm text-muted-foreground">Manage your account</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* My Upcoming Trips */}
      {myReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              My Upcoming Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myReservations.slice(0, 2).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Train className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{reservation.trainNumber}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {reservation.origin} → {reservation.destination}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {reservation.date}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(reservation.departureTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/reservations">View All Reservations</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Train className="w-5 h-5 text-primary" />
            Available Trips
          </CardTitle>
          <CardDescription>Popular routes departing soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTrips.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatTime(schedule.departureTime)}</p>
                    <p className="text-xs text-muted-foreground">{schedule.origin}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatTime(schedule.arrivalTime)}</p>
                    <p className="text-xs text-muted-foreground">{schedule.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-primary">SAR {schedule.pricePerSeat}</p>
                    <p className="text-xs text-muted-foreground">
                      {schedule.availableSeats} seats left
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/book/${schedule.id}`}>Book</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="w-full mt-4">
            <Link href="/search">Search All Trips</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ManagerDashboard({ stats }: { stats: { reservations: { total: number; confirmed: number; cancelled: number; totalRevenue: number }; schedules: { total: number; scheduled: number; totalCapacity: number; totalBooked: number; occupancyRate: number } } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of train operations and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">SAR {stats.reservations.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10">
                <Ticket className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reservations.confirmed}</p>
                <p className="text-sm text-muted-foreground">Active Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10">
                <Train className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.schedules.scheduled}</p>
                <p className="text-sm text-muted-foreground">Active Schedules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-4/10">
                <Users className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.schedules.occupancyRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Seat Occupancy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/schedules" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Manage Schedules</p>
                <p className="text-sm text-muted-foreground">Add, edit, or remove</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/manage-reservations" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10">
                <Ticket className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="font-semibold">View Reservations</p>
                <p className="text-sm text-muted-foreground">All passenger bookings</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/reports" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10">
                <BarChart3 className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <p className="font-semibold">View Reports</p>
                <p className="text-sm text-muted-foreground">Analytics & insights</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Capacity</span>
              <span className="font-medium">{stats.schedules.totalCapacity} seats</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Booked Seats</span>
              <span className="font-medium">{stats.schedules.totalBooked} seats</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${stats.schedules.occupancyRate}%` }}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {stats.schedules.occupancyRate.toFixed(1)}% of total capacity booked
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StaffDashboard({ stats }: { stats: { reservations: { total: number; confirmed: number; cancelled: number; totalRevenue: number }; schedules: { total: number; scheduled: number; totalCapacity: number; totalBooked: number; occupancyRate: number } } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Manage reservations and train schedules
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10">
                <Ticket className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reservations.confirmed}</p>
                <p className="text-sm text-muted-foreground">Active Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10">
                <Train className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.schedules.scheduled}</p>
                <p className="text-sm text-muted-foreground">Active Schedules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/10">
                <Ticket className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reservations.cancelled}</p>
                <p className="text-sm text-muted-foreground">Cancelled Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/manage-reservations" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Reservations</p>
                <p className="text-sm text-muted-foreground">Manage bookings</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/schedules" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10">
                <CalendarDays className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="font-semibold">Schedules</p>
                <p className="text-sm text-muted-foreground">Manage trains</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/passengers" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <p className="font-semibold">Passengers</p>
                <p className="text-sm text-muted-foreground">View profiles</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Link href="/search" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-4/10">
                <Search className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="font-semibold">Search</p>
                <p className="text-sm text-muted-foreground">Find trips</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
