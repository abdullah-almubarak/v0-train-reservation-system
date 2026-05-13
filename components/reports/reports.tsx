"use client"

import { useEffect, useState } from "react"
import { ReportingService, TrainService, ReservationService } from "@/lib/services"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Ticket,
  Train,
  Users,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export function Reports() {
  const [reservationStats, setReservationStats] = useState({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    totalRevenue: 0,
  })
  const [scheduleStats, setScheduleStats] = useState({
    total: 0,
    scheduled: 0,
    totalCapacity: 0,
    totalBooked: 0,
    occupancyRate: 0,
  })
  const [revenueByRoute, setRevenueByRoute] = useState<{ route: string; revenue: number }[]>([])
  const [bookingsByDate, setBookingsByDate] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    setReservationStats(ReportingService.getReservationStats())
    setScheduleStats(ReportingService.getScheduleStats())
    setRevenueByRoute(ReportingService.getRevenueByRoute())
    setBookingsByDate(ReportingService.getBookingsByDate())
  }, [])

  const pieData = [
    { name: "Confirmed", value: reservationStats.confirmed, color: "oklch(0.6 0.18 145)" },
    { name: "Cancelled", value: reservationStats.cancelled, color: "oklch(0.55 0.22 25)" },
  ]

  const capacityData = [
    { name: "Booked", value: scheduleStats.totalBooked, color: "oklch(0.45 0.15 240)" },
    { name: "Available", value: scheduleStats.totalCapacity - scheduleStats.totalBooked, color: "oklch(0.94 0.01 240)" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Performance metrics and insights for train operations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  SAR {reservationStats.totalRevenue.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold">{reservationStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
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
                <p className="text-2xl font-bold">{scheduleStats.total}</p>
                <p className="text-sm text-muted-foreground">Train Schedules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-4/10">
                <TrendingUp className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduleStats.occupancyRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Route */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Revenue by Route
            </CardTitle>
            <CardDescription>Revenue distribution across different routes</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByRoute.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByRoute}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="route" 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`SAR ${value}`, "Revenue"]}
                    contentStyle={{ 
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="revenue" fill="oklch(0.45 0.15 240)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Booking Status
            </CardTitle>
            <CardDescription>Distribution of booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ 
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Capacity and Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seat Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Seat Capacity Utilization
            </CardTitle>
            <CardDescription>Overview of seat booking vs availability</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} seats`, name]}
                  contentStyle={{ 
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Capacity</span>
                <span className="font-medium">{scheduleStats.totalCapacity} seats</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Currently Booked</span>
                <span className="font-medium">{scheduleStats.totalBooked} seats</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">
                  {scheduleStats.totalCapacity - scheduleStats.totalBooked} seats
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Summary Statistics
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Confirmed Bookings</p>
                <p className="text-2xl font-bold text-[oklch(0.6_0.18_145)]">
                  {reservationStats.confirmed}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Cancelled Bookings</p>
                <p className="text-2xl font-bold text-destructive">
                  {reservationStats.cancelled}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold text-primary">
                  {scheduleStats.scheduled}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Avg Revenue/Booking</p>
                <p className="text-2xl font-bold text-chart-4">
                  SAR {reservationStats.confirmed > 0 
                    ? Math.round(reservationStats.totalRevenue / reservationStats.confirmed)
                    : 0}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Booking Dates</p>
              <div className="flex flex-wrap gap-2">
                {bookingsByDate.map((item) => (
                  <Badge key={item.date} variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.date}: {item.count} bookings
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
