"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TrainService } from "@/lib/services"
import { cities } from "@/lib/data/mock-data"
import type { TrainSchedule } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Train,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  Users,
  Banknote,
} from "lucide-react"

export function TrainSearch() {
  const router = useRouter()
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [results, setResults] = useState<TrainSchedule[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    setIsSearching(true)
    setHasSearched(true)

    // Simulate search delay
    setTimeout(() => {
      const searchResults = TrainService.searchSchedules({
        origin: origin || undefined,
        destination: destination || undefined,
        date: date || undefined,
      })
      setResults(searchResults)
      setIsSearching(false)
    }, 300)
  }

  const handleBookNow = (scheduleId: string) => {
    router.push(`/book/${scheduleId}`)
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

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Search Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="origin">From</Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger id="origin">
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full" disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {results.length} {results.length === 1 ? "Trip" : "Trips"} Found
            </h2>
            {results.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Select a trip to book your seats
              </p>
            )}
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Train className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No trips found matching your criteria
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((schedule) => (
                <Card
                  key={schedule.id}
                  className="overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Train Info */}
                      <div className="flex-1 p-4 lg:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Train className="w-4 h-4 text-primary" />
                              <span className="font-semibold">
                                {schedule.trainName}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {schedule.trainNumber}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(schedule.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <Badge
                            variant={
                              schedule.status === "scheduled"
                                ? "default"
                                : schedule.status === "delayed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {schedule.status}
                          </Badge>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {formatTime(schedule.departureTime)}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {schedule.origin}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Clock className="w-3 h-3" />
                              {calculateDuration(
                                schedule.departureTime,
                                schedule.arrivalTime
                              )}
                            </div>
                            <div className="w-full flex items-center gap-2">
                              <div className="flex-1 h-0.5 bg-border"></div>
                              <ArrowRight className="w-4 h-4 text-primary" />
                              <div className="flex-1 h-0.5 bg-border"></div>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {formatTime(schedule.arrivalTime)}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {schedule.destination}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Section */}
                      <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 p-4 lg:p-6 bg-muted/30 lg:min-w-[200px] border-t lg:border-t-0 lg:border-l">
                        <div className="flex flex-col items-start lg:items-center">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <Banknote className="w-4 h-4" />
                            <span>per seat</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            SAR {schedule.pricePerSeat}
                          </p>
                        </div>

                        <div className="flex flex-col items-end lg:items-center gap-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span
                              className={
                                schedule.availableSeats < 10
                                  ? "text-destructive font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {schedule.availableSeats} seats left
                            </span>
                          </div>
                          <Button
                            onClick={() => handleBookNow(schedule.id)}
                            disabled={schedule.availableSeats === 0}
                            className="min-w-[120px]"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
