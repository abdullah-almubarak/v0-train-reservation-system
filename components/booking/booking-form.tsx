"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { TrainService, ReservationService } from "@/lib/services"
import type { TrainSchedule, Seat } from "@/lib/types"
import { SeatSelection } from "./seat-selection"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Train,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  Users,
  Banknote,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface BookingFormProps {
  scheduleId: string
}

export function BookingForm({ scheduleId }: BookingFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<TrainSchedule | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const scheduleData = TrainService.getScheduleById(scheduleId)
    if (scheduleData) {
      setSchedule(scheduleData)
      setSeats(TrainService.getSeatsForSchedule(scheduleId))
    }
    setIsLoading(false)
  }, [scheduleId])

  const handleSeatToggle = (seatNumber: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    )
    setError("")
  }

  const handleBooking = async () => {
    if (!user || !schedule) return

    if (selectedSeats.length === 0) {
      setError("Please select at least one seat")
      return
    }

    setIsBooking(true)
    setError("")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = ReservationService.createReservation({
      scheduleId: schedule.id,
      seats: selectedSeats,
      passengerId: user.id,
      passengerName: user.name,
      passengerEmail: user.email,
    })

    if ("error" in result) {
      setError(result.error)
      setIsBooking(false)
    } else {
      setSuccess(true)
      setIsBooking(false)
      // Redirect after short delay
      setTimeout(() => {
        router.push("/reservations")
      }, 2000)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const h = parseInt(hours)
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  const calculateDuration = (departure: string, arrival: string) => {
    const [depH, depM] = departure.split(":").map(Number)
    const [arrH, arrM] = arrival.split(":").map(Number)
    const depMinutes = depH * 60 + depM
    const arrMinutes = arrH * 60 + arrM
    const diff = arrMinutes - depMinutes
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!schedule) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-muted-foreground">Schedule not found</p>
          <Button onClick={() => router.push("/search")} className="mt-4">
            Back to Search
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-[oklch(0.6_0.18_145_/_0.2)] flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-[oklch(0.6_0.18_145)]" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
          <p className="text-muted-foreground text-center mb-4">
            Your reservation has been successfully created.
            <br />
            Redirecting to your reservations...
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"}
            </Badge>
            <Badge variant="secondary">
              SAR {selectedSeats.length * schedule.pricePerSeat}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Trip Details */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="w-5 h-5 text-primary" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-lg">{schedule.trainName}</p>
              <Badge variant="secondary" className="mt-1">
                {schedule.trainNumber}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {new Date(schedule.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold">{formatTime(schedule.departureTime)}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {schedule.origin}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center pt-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    {calculateDuration(schedule.departureTime, schedule.arrivalTime)}
                  </div>
                  <div className="w-full flex items-center gap-1">
                    <div className="flex-1 h-0.5 bg-border"></div>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold">{formatTime(schedule.arrivalTime)}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {schedule.destination}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available Seats</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className={schedule.availableSeats < 10 ? "text-destructive font-medium" : ""}>
                  {schedule.availableSeats}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per Seat</span>
              <div className="flex items-center gap-1">
                <Banknote className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">SAR {schedule.pricePerSeat}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Selected Seats</span>
              <span>{selectedSeats.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per Seat</span>
              <span>SAR {schedule.pricePerSeat}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg text-primary">
                SAR {selectedSeats.length * schedule.pricePerSeat}
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || isBooking}
              className="w-full"
              size="lg"
            >
              {isBooking ? "Processing..." : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Seat Selection */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Your Seats</CardTitle>
            <CardDescription>
              Choose up to 6 seats for your journey. Click on available seats to select them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeatSelection
              seats={seats}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              maxSeats={6}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
