"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ReservationService } from "@/lib/services"
import type { Reservation } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Ticket,
  Train,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  XCircle,
  Armchair,
} from "lucide-react"
import Link from "next/link"

export function MyReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    if (user) {
      loadReservations()
    }
  }, [user])

  const loadReservations = () => {
    if (user) {
      setReservations(ReservationService.getPassengerReservations(user.id))
    }
  }

  const handleCancel = (id: string) => {
    ReservationService.cancelReservation(id)
    loadReservations()
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const h = parseInt(hours)
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-[oklch(0.6_0.18_145)] text-white">Confirmed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const confirmedReservations = reservations.filter((r) => r.status === "confirmed")
  const pastReservations = reservations.filter((r) => r.status !== "confirmed")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Reservations</h2>
          <p className="text-muted-foreground">View and manage your train bookings</p>
        </div>
        <Button asChild>
          <Link href="/search">Book New Trip</Link>
        </Button>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any reservations yet
            </p>
            <Button asChild>
              <Link href="/search">Search for Trips</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Reservations */}
          {confirmedReservations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upcoming Trips</h3>
              <div className="grid gap-4">
                {confirmedReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancel}
                    formatTime={formatTime}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Reservations */}
          {pastReservations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Past Reservations
              </h3>
              <div className="grid gap-4">
                {pastReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancel}
                    formatTime={formatTime}
                    getStatusBadge={getStatusBadge}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface ReservationCardProps {
  reservation: Reservation
  onCancel: (id: string) => void
  formatTime: (time: string) => string
  getStatusBadge: (status: string) => React.ReactNode
  isPast?: boolean
}

function ReservationCard({
  reservation,
  onCancel,
  formatTime,
  getStatusBadge,
  isPast,
}: ReservationCardProps) {
  return (
    <Card className={isPast ? "opacity-70" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Trip Info */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Train className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{reservation.trainNumber}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(reservation.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              {getStatusBadge(reservation.status)}
            </div>

            {/* Route */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold">{formatTime(reservation.departureTime)}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {reservation.origin}
                </div>
              </div>

              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-0.5 bg-border"></div>
                <ArrowRight className="w-4 h-4 text-primary" />
                <div className="flex-1 h-0.5 bg-border"></div>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold">{formatTime(reservation.arrivalTime)}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {reservation.destination}
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="mt-4 flex items-center gap-2">
              <Armchair className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Seats:</span>
              <div className="flex flex-wrap gap-1">
                {reservation.seats.map((seat) => (
                  <Badge key={seat} variant="outline" className="text-xs">
                    {seat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 p-4 lg:p-6 bg-muted/30 lg:min-w-[180px] border-t lg:border-t-0 lg:border-l">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">
                SAR {reservation.totalPrice}
              </p>
            </div>

            {reservation.status === "confirmed" && !isPast && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this reservation? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onCancel(reservation.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Cancel Reservation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
