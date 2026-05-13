"use client"

import { useState, useEffect } from "react"
import { TrainService } from "@/lib/services"
import { cities } from "@/lib/data/mock-data"
import type { TrainSchedule } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Train,
  Clock,
  MapPin,
  Users,
} from "lucide-react"

export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<TrainSchedule[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<TrainSchedule | null>(null)

  // Form state
  const [trainNumber, setTrainNumber] = useState("")
  const [trainName, setTrainName] = useState("")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [departureTime, setDepartureTime] = useState("")
  const [arrivalTime, setArrivalTime] = useState("")
  const [date, setDate] = useState("")
  const [totalSeats, setTotalSeats] = useState("")
  const [pricePerSeat, setPricePerSeat] = useState("")
  const [status, setStatus] = useState<"scheduled" | "delayed" | "cancelled">("scheduled")

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = () => {
    setSchedules(TrainService.getAllSchedules())
  }

  const resetForm = () => {
    setTrainNumber("")
    setTrainName("")
    setOrigin("")
    setDestination("")
    setDepartureTime("")
    setArrivalTime("")
    setDate("")
    setTotalSeats("")
    setPricePerSeat("")
    setStatus("scheduled")
    setEditingSchedule(null)
  }

  const handleEdit = (schedule: TrainSchedule) => {
    setEditingSchedule(schedule)
    setTrainNumber(schedule.trainNumber)
    setTrainName(schedule.trainName)
    setOrigin(schedule.origin)
    setDestination(schedule.destination)
    setDepartureTime(schedule.departureTime)
    setArrivalTime(schedule.arrivalTime)
    setDate(schedule.date)
    setTotalSeats(schedule.totalSeats.toString())
    setPricePerSeat(schedule.pricePerSeat.toString())
    setStatus(schedule.status as "scheduled" | "delayed" | "cancelled")
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const scheduleData = {
      trainNumber,
      trainName,
      origin,
      destination,
      departureTime,
      arrivalTime,
      date,
      totalSeats: parseInt(totalSeats),
      availableSeats: editingSchedule
        ? editingSchedule.availableSeats
        : parseInt(totalSeats),
      pricePerSeat: parseInt(pricePerSeat),
      status: status as "scheduled" | "delayed" | "cancelled" | "completed",
    }

    if (editingSchedule) {
      TrainService.updateSchedule(editingSchedule.id, scheduleData)
    } else {
      TrainService.createSchedule(scheduleData)
    }

    loadSchedules()
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    TrainService.deleteSchedule(id)
    loadSchedules()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-chart-3 text-white">Scheduled</Badge>
      case "delayed":
        return <Badge variant="destructive">Delayed</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <p className="text-muted-foreground">Manage train schedules and routes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </DialogTitle>
              <DialogDescription>
                {editingSchedule
                  ? "Update the train schedule details"
                  : "Enter the details for the new train schedule"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainNumber">Train Number</Label>
                  <Input
                    id="trainNumber"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    placeholder="e.g., TR-101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainName">Train Name</Label>
                  <Input
                    id="trainName"
                    value={trainName}
                    onChange={(e) => setTrainName(e.target.value)}
                    placeholder="e.g., Riyadh Express"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Select value={origin} onValueChange={setOrigin} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Select value={destination} onValueChange={setDestination} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Arrival</Label>
                  <Input
                    id="arrivalTime"
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSeats">Total Seats</Label>
                  <Input
                    id="totalSeats"
                    type="number"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    placeholder="60"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerSeat">Price (SAR)</Label>
                  <Input
                    id="pricePerSeat"
                    type="number"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    placeholder="250"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v: "scheduled" | "delayed" | "cancelled") => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            All Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Train</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Train className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium">{schedule.trainName}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.trainNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{schedule.origin}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{schedule.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{schedule.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.departureTime} - {schedule.arrivalTime}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span
                          className={
                            schedule.availableSeats < 10
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          {schedule.availableSeats}/{schedule.totalSeats}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>SAR {schedule.pricePerSeat}</TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this schedule? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(schedule.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
