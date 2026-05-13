// ========================================
// DOMAIN TYPES - Data Layer
// ========================================

export type UserRole = "passenger" | "staff" | "manager"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  createdAt: Date
}

export interface TrainSchedule {
  id: string
  trainNumber: string
  trainName: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  date: string
  totalSeats: number
  availableSeats: number
  pricePerSeat: number
  status: "scheduled" | "delayed" | "cancelled" | "completed"
}

export interface Seat {
  id: string
  seatNumber: string
  carriage: number
  isReserved: boolean
  reservationId?: string
  type: "window" | "aisle" | "middle"
}

export interface Reservation {
  id: string
  passengerId: string
  passengerName: string
  passengerEmail: string
  scheduleId: string
  trainNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  date: string
  seats: string[]
  totalPrice: number
  status: "confirmed" | "cancelled" | "completed"
  createdAt: Date
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface SearchFilters {
  origin?: string
  destination?: string
  date?: string
}

export interface BookingRequest {
  scheduleId: string
  seats: string[]
  passengerId: string
  passengerName: string
  passengerEmail: string
}

// ========================================
// AUTH TYPES
// ========================================

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: UserRole
}
