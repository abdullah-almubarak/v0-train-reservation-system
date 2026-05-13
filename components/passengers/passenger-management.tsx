"use client"

import { useState, useEffect } from "react"
import { PassengerService, ReservationService } from "@/lib/services"
import type { User, Reservation } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Users,
  Search,
  User,
  Mail,
  Calendar,
  Ticket,
  Eye,
} from "lucide-react"

export function PassengerManagement() {
  const [passengers, setPassengers] = useState<User[]>([])
  const [filteredPassengers, setFilteredPassengers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPassenger, setSelectedPassenger] = useState<User | null>(null)
  const [passengerReservations, setPassengerReservations] = useState<Reservation[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadPassengers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      setFilteredPassengers(
        passengers.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term)
        )
      )
    } else {
      setFilteredPassengers(passengers)
    }
  }, [passengers, searchTerm])

  const loadPassengers = () => {
    setPassengers(PassengerService.getAllPassengers())
  }

  const viewPassengerDetails = (passenger: User) => {
    setSelectedPassenger(passenger)
    setPassengerReservations(
      ReservationService.getPassengerReservations(passenger.id)
    )
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-[oklch(0.6_0.18_145)] text-white">Confirmed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Passenger Management</h2>
        <p className="text-muted-foreground">View and manage passenger profiles</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Passengers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            All Passengers ({filteredPassengers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPassengers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No passengers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPassengers.map((passenger) => {
                    const reservations = ReservationService.getPassengerReservations(
                      passenger.id
                    )
                    const confirmedCount = reservations.filter(
                      (r) => r.status === "confirmed"
                    ).length

                    return (
                      <TableRow key={passenger.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium">{passenger.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {passenger.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(passenger.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-muted-foreground" />
                            <span>{confirmedCount} active</span>
                            {reservations.length > confirmedCount && (
                              <span className="text-xs text-muted-foreground">
                                ({reservations.length} total)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewPassengerDetails(passenger)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passenger Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Passenger Details</DialogTitle>
          </DialogHeader>

          {selectedPassenger && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold">{selectedPassenger.name}</p>
                  <p className="text-muted-foreground">{selectedPassenger.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since{" "}
                    {new Date(selectedPassenger.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Reservations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Booking History ({passengerReservations.length})
                </h3>
                {passengerReservations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No bookings yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {passengerReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {reservation.trainNumber}
                            </span>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {reservation.origin} → {reservation.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.date} at {reservation.departureTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">SAR {reservation.totalPrice}</p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.seats.length} seat(s)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
