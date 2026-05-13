// ========================================
// DATA ACCESS LAYER - Repository Pattern
// ========================================

import type { User, TrainSchedule, Reservation, Seat, SearchFilters, BookingRequest, RegisterData } from "../types"
import { initialUsers, initialSchedules, initialReservations, generateSeatsForSchedule } from "./mock-data"

// In-memory data store (simulating database)
class DataStore {
  private users: User[] = [...initialUsers]
  private schedules: TrainSchedule[] = [...initialSchedules]
  private reservations: Reservation[] = [...initialReservations]
  private seatCache: Map<string, Seat[]> = new Map()

  // ========================================
  // USER REPOSITORY
  // ========================================

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  createUser(data: RegisterData): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || "passenger",
      createdAt: new Date(),
    }
    this.users.push(newUser)
    return newUser
  }

  getAllUsers(): User[] {
    return [...this.users]
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return undefined
    this.users[index] = { ...this.users[index], ...updates }
    return this.users[index]
  }

  // ========================================
  // TRAIN SCHEDULE REPOSITORY
  // ========================================

  getAllSchedules(): TrainSchedule[] {
    return [...this.schedules]
  }

  findScheduleById(id: string): TrainSchedule | undefined {
    return this.schedules.find((s) => s.id === id)
  }

  searchSchedules(filters: SearchFilters): TrainSchedule[] {
    return this.schedules.filter((schedule) => {
      if (filters.origin && schedule.origin.toLowerCase() !== filters.origin.toLowerCase()) {
        return false
      }
      if (filters.destination && schedule.destination.toLowerCase() !== filters.destination.toLowerCase()) {
        return false
      }
      if (filters.date && schedule.date !== filters.date) {
        return false
      }
      return schedule.status === "scheduled"
    })
  }

  createSchedule(data: Omit<TrainSchedule, "id">): TrainSchedule {
    const newSchedule: TrainSchedule = {
      ...data,
      id: `schedule-${Date.now()}`,
    }
    this.schedules.push(newSchedule)
    return newSchedule
  }

  updateSchedule(id: string, updates: Partial<TrainSchedule>): TrainSchedule | undefined {
    const index = this.schedules.findIndex((s) => s.id === id)
    if (index === -1) return undefined
    this.schedules[index] = { ...this.schedules[index], ...updates }
    // Clear seat cache for this schedule
    this.seatCache.delete(id)
    return this.schedules[index]
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex((s) => s.id === id)
    if (index === -1) return false
    this.schedules.splice(index, 1)
    this.seatCache.delete(id)
    return true
  }

  // ========================================
  // SEAT REPOSITORY
  // ========================================

  getSeatsForSchedule(scheduleId: string): Seat[] {
    // Check cache first
    if (this.seatCache.has(scheduleId)) {
      return this.seatCache.get(scheduleId)!
    }

    const schedule = this.findScheduleById(scheduleId)
    if (!schedule) return []

    // Get reserved seats from reservations
    const reservedSeats = this.reservations
      .filter((r) => r.scheduleId === scheduleId && r.status === "confirmed")
      .flatMap((r) => r.seats)

    const seats = generateSeatsForSchedule(scheduleId, schedule.totalSeats, reservedSeats)
    this.seatCache.set(scheduleId, seats)
    return seats
  }

  updateSeatReservation(scheduleId: string, seatNumbers: string[], reservationId: string, reserved: boolean): void {
    const seats = this.getSeatsForSchedule(scheduleId)
    seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.isReserved = reserved
        seat.reservationId = reserved ? reservationId : undefined
      }
    })
    this.seatCache.set(scheduleId, seats)

    // Update available seats count
    const schedule = this.findScheduleById(scheduleId)
    if (schedule) {
      const reservedCount = seats.filter((s) => s.isReserved).length
      this.updateSchedule(scheduleId, { availableSeats: schedule.totalSeats - reservedCount })
    }
  }

  // ========================================
  // RESERVATION REPOSITORY
  // ========================================

  getAllReservations(): Reservation[] {
    return [...this.reservations]
  }

  findReservationById(id: string): Reservation | undefined {
    return this.reservations.find((r) => r.id === id)
  }

  findReservationsByPassenger(passengerId: string): Reservation[] {
    return this.reservations.filter((r) => r.passengerId === passengerId)
  }

  findReservationsBySchedule(scheduleId: string): Reservation[] {
    return this.reservations.filter((r) => r.scheduleId === scheduleId)
  }

  createReservation(request: BookingRequest): Reservation | null {
    const schedule = this.findScheduleById(request.scheduleId)
    if (!schedule) return null

    // Check if seats are available
    const seats = this.getSeatsForSchedule(request.scheduleId)
    const requestedSeats = seats.filter((s) => request.seats.includes(s.seatNumber))
    if (requestedSeats.some((s) => s.isReserved)) {
      return null // Some seats are already reserved
    }

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      passengerId: request.passengerId,
      passengerName: request.passengerName,
      passengerEmail: request.passengerEmail,
      scheduleId: request.scheduleId,
      trainNumber: schedule.trainNumber,
      origin: schedule.origin,
      destination: schedule.destination,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      date: schedule.date,
      seats: request.seats,
      totalPrice: request.seats.length * schedule.pricePerSeat,
      status: "confirmed",
      createdAt: new Date(),
    }

    this.reservations.push(reservation)
    this.updateSeatReservation(request.scheduleId, request.seats, reservation.id, true)
    return reservation
  }

  cancelReservation(id: string): boolean {
    const reservation = this.findReservationById(id)
    if (!reservation) return false

    reservation.status = "cancelled"
    this.updateSeatReservation(reservation.scheduleId, reservation.seats, id, false)
    return true
  }

  updateReservation(id: string, updates: Partial<Reservation>): Reservation | undefined {
    const index = this.reservations.findIndex((r) => r.id === id)
    if (index === -1) return undefined
    this.reservations[index] = { ...this.reservations[index], ...updates }
    return this.reservations[index]
  }

  // ========================================
  // REPORTING FUNCTIONS
  // ========================================

  getReservationStats() {
    const total = this.reservations.length
    const confirmed = this.reservations.filter((r) => r.status === "confirmed").length
    const cancelled = this.reservations.filter((r) => r.status === "cancelled").length
    const totalRevenue = this.reservations
      .filter((r) => r.status === "confirmed")
      .reduce((sum, r) => sum + r.totalPrice, 0)

    return { total, confirmed, cancelled, totalRevenue }
  }

  getScheduleStats() {
    const total = this.schedules.length
    const scheduled = this.schedules.filter((s) => s.status === "scheduled").length
    const totalCapacity = this.schedules.reduce((sum, s) => sum + s.totalSeats, 0)
    const totalBooked = this.schedules.reduce((sum, s) => sum + (s.totalSeats - s.availableSeats), 0)
    const occupancyRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0

    return { total, scheduled, totalCapacity, totalBooked, occupancyRate }
  }
}

// Singleton instance
export const dataStore = new DataStore()
