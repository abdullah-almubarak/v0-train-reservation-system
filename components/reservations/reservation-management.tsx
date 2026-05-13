"use client"

import { useState, useEffect } from "react"
import { ReservationService, TrainService } from "@/lib/services"
import type { Reservation, Seat } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Search,
  Train,
  MapPin,
  Calendar,
  User,
  Mail,
  ArrowRightLeft,
  XCircle,
  Armchair,
  AlertCircle,
} from "lucide-react"

export function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Seat reassignment state
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([])
  const [seatToReassign, setSeatToReassign] = useState("")
  const [newSeat, setNewSeat] = useState("")
  const [reassignError, setReassignError] = useState("")

  useEffect(() => {
    loadReservations()
  }, [])

  useEffect(() => {
    filterReservations()
  }, [reservations, searchTerm, statusFilter])

  const loadReservations = () => {
    setReservations(ReservationService.getAllReservations())
  }

  const filterReservations = () => {
    let filtered = reservations

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.passengerName.toLowerCase().includes(term) ||
          r.passengerEmail.toLowerCase().includes(term) ||
          r.trainNumber.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    setFilteredReservations(filtered)
  }

  const handleCancel = (id: string) => {
    ReservationService.cancelReservation(id)
    loadReservations()
  }

  const openReassignDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    const seats = TrainService.getSeatsForSchedule(reservation.scheduleId)
    setAvailableSeats(seats.filter((s) => !s.isReserved))
    setSeatToReassign("")
    setNewSeat("")
    setReassignError("")
    setReassignDialogOpen(true)
  }

  const handleReassign = () => {
    if (!selectedReservation || !seatToReassign || !newSeat) {
      setReassignError("Please select both the old and new seat")
      return
    }

    const result = ReservationService.reassignSeat(
      selectedReservation.id,
      seatToReassign,
      newSeat
    )

    if ("error" in result) {
      setReassignError(result.error)
    } else {
      setReassignDialogOpen(false)
      loadReservations()
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reservation Management</h2>
        <p className="text-muted-foreground">
          View and manage all passenger reservations
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ticket ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            All Reservations ({filteredReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reservations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-mono text-xs">
                        {reservation.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {reservation.passengerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reservation.passengerEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Train className="w-3 h-3 text-primary" />
                          <span className="text-sm">{reservation.trainNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {reservation.origin} → {reservation.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{reservation.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {reservation.seats.map((seat) => (
                            <Badge key={seat} variant="outline" className="text-xs">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        SAR {reservation.totalPrice}
                      </TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell className="text-right">
                        {reservation.status === "confirmed" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReassignDialog(reservation)}
                              title="Reassign seat"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Cancel reservation"
                                >
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel Reservation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this
                                    reservation for {reservation.passengerName}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancel(reservation.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancel Reservation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seat Reassignment Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Seat</DialogTitle>
            <DialogDescription>
              Move passenger to a different seat on the same train
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedReservation.passengerName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReservation.trainNumber}: {selectedReservation.origin} →{" "}
                  {selectedReservation.destination}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Seat</label>
                <Select value={seatToReassign} onValueChange={setSeatToReassign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seat to move" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedReservation.seats.map((seat) => (
                      <SelectItem key={seat} value={seat}>
                        Seat {seat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Seat</label>
                <Select value={newSeat} onValueChange={setNewSeat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new seat" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeats.map((seat) => (
                      <SelectItem key={seat.id} value={seat.seatNumber}>
                        Seat {seat.seatNumber} ({seat.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reassignError && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  {reassignError}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReassign}>Reassign Seat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
