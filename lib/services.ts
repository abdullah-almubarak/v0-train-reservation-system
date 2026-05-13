"use client"

// ========================================
// BUSINESS LOGIC LAYER - Services
// ========================================

import { dataStore } from "./data/store"
import type { 
  User, 
  TrainSchedule, 
  Reservation, 
  Seat, 
  SearchFilters, 
  BookingRequest, 
  LoginCredentials, 
  RegisterData 
} from "./types"

// ========================================
// AUTHENTICATION SERVICE
// ========================================

export const AuthService = {
  login(credentials: LoginCredentials): User | null {
    const user = dataStore.findUserByEmail(credentials.email)
    if (!user) return null
    if (user.password !== credentials.password) return null
    return user
  },

  register(data: RegisterData): User | { error: string } {
    const existing = dataStore.findUserByEmail(data.email)
    if (existing) {
      return { error: "Email already registered" }
    }
    return dataStore.createUser(data)
  },

  validateSession(userId: string): User | null {
    return dataStore.findUserById(userId) || null
  },
}

// ========================================
// TRAIN MANAGEMENT SERVICE
// ========================================

export const TrainService = {
  getAllSchedules(): TrainSchedule[] {
    return dataStore.getAllSchedules()
  },

  searchSchedules(filters: SearchFilters): TrainSchedule[] {
    return dataStore.searchSchedules(filters)
  },

  getScheduleById(id: string): TrainSchedule | undefined {
    return dataStore.findScheduleById(id)
  },

  createSchedule(data: Omit<TrainSchedule, "id">): TrainSchedule {
    return dataStore.createSchedule(data)
  },

  updateSchedule(id: string, updates: Partial<TrainSchedule>): TrainSchedule | undefined {
    return dataStore.updateSchedule(id, updates)
  },

  deleteSchedule(id: string): boolean {
    return dataStore.deleteSchedule(id)
  },

  getSeatsForSchedule(scheduleId: string): Seat[] {
    return dataStore.getSeatsForSchedule(scheduleId)
  },
}

// ========================================
// RESERVATION SERVICE
// ========================================

export const ReservationService = {
  getAllReservations(): Reservation[] {
    return dataStore.getAllReservations()
  },

  getReservationById(id: string): Reservation | undefined {
    return dataStore.findReservationById(id)
  },

  getPassengerReservations(passengerId: string): Reservation[] {
    return dataStore.findReservationsByPassenger(passengerId)
  },

  createReservation(request: BookingRequest): Reservation | { error: string } {
    const schedule = dataStore.findScheduleById(request.scheduleId)
    if (!schedule) {
      return { error: "Schedule not found" }
    }

    if (request.seats.length === 0) {
      return { error: "No seats selected" }
    }

    if (request.seats.length > schedule.availableSeats) {
      return { error: "Not enough seats available" }
    }

    const reservation = dataStore.createReservation(request)
    if (!reservation) {
      return { error: "Some seats are already reserved" }
    }

    return reservation
  },

  cancelReservation(id: string): boolean {
    return dataStore.cancelReservation(id)
  },

  updateReservation(id: string, updates: Partial<Reservation>): Reservation | undefined {
    return dataStore.updateReservation(id, updates)
  },

  reassignSeat(reservationId: string, oldSeat: string, newSeat: string): Reservation | { error: string } {
    const reservation = dataStore.findReservationById(reservationId)
    if (!reservation) {
      return { error: "Reservation not found" }
    }

    const seats = dataStore.getSeatsForSchedule(reservation.scheduleId)
    const newSeatObj = seats.find(s => s.seatNumber === newSeat)
    
    if (!newSeatObj) {
      return { error: "Seat not found" }
    }

    if (newSeatObj.isReserved) {
      return { error: "Seat is already reserved" }
    }

    // Update seats in reservation
    const updatedSeats = reservation.seats.map(s => s === oldSeat ? newSeat : s)
    
    // Release old seat
    dataStore.updateSeatReservation(reservation.scheduleId, [oldSeat], reservationId, false)
    
    // Reserve new seat
    dataStore.updateSeatReservation(reservation.scheduleId, [newSeat], reservationId, true)
    
    return dataStore.updateReservation(reservationId, { seats: updatedSeats })!
  },
}

// ========================================
// REPORTING SERVICE
// ========================================

export const ReportingService = {
  getReservationStats() {
    return dataStore.getReservationStats()
  },

  getScheduleStats() {
    return dataStore.getScheduleStats()
  },

  getRevenueByRoute() {
    const reservations = dataStore.getAllReservations().filter(r => r.status === "confirmed")
    const routeMap = new Map<string, number>()

    reservations.forEach((r) => {
      const route = `${r.origin} - ${r.destination}`
      routeMap.set(route, (routeMap.get(route) || 0) + r.totalPrice)
    })

    return Array.from(routeMap.entries()).map(([route, revenue]) => ({ route, revenue }))
  },

  getBookingsByDate() {
    const reservations = dataStore.getAllReservations().filter(r => r.status === "confirmed")
    const dateMap = new Map<string, number>()

    reservations.forEach((r) => {
      dateMap.set(r.date, (dateMap.get(r.date) || 0) + 1)
    })

    return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }))
  },
}

// ========================================
// PASSENGER SERVICE
// ========================================

export const PassengerService = {
  getAllPassengers(): User[] {
    return dataStore.getAllUsers().filter(u => u.role === "passenger")
  },

  getPassengerById(id: string): User | undefined {
    const user = dataStore.findUserById(id)
    return user?.role === "passenger" ? user : undefined
  },

  updatePassenger(id: string, updates: Partial<User>): User | undefined {
    return dataStore.updateUser(id, updates)
  },
}
