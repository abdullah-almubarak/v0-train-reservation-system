// ========================================
// DATABASE LAYER - Mock Data Store
// ========================================

import type { User, TrainSchedule, Reservation, Seat } from "../types"

// Initial Users
export const initialUsers: User[] = [
  {
    id: "user-1",
    email: "passenger@train.com",
    password: "password123",
    name: "Ahmed Al-Fahad",
    role: "passenger",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "user-2",
    email: "staff@train.com",
    password: "password123",
    name: "Mohammed Al-Rashid",
    role: "staff",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "user-3",
    email: "manager@train.com",
    password: "password123",
    name: "Khalid Al-Saud",
    role: "manager",
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "user-4",
    email: "faris@train.com",
    password: "password123",
    name: "Faris Al-Sadoon",
    role: "passenger",
    createdAt: new Date("2024-02-01"),
  },
]

// Train Schedules
export const initialSchedules: TrainSchedule[] = [
  {
    id: "schedule-1",
    trainNumber: "TR-101",
    trainName: "Riyadh Express",
    origin: "Riyadh",
    destination: "Jeddah",
    departureTime: "08:00",
    arrivalTime: "14:30",
    date: "2026-05-15",
    totalSeats: 60,
    availableSeats: 45,
    pricePerSeat: 250,
    status: "scheduled",
  },
  {
    id: "schedule-2",
    trainNumber: "TR-102",
    trainName: "Desert Wind",
    origin: "Jeddah",
    destination: "Riyadh",
    departureTime: "16:00",
    arrivalTime: "22:30",
    date: "2026-05-15",
    totalSeats: 60,
    availableSeats: 38,
    pricePerSeat: 250,
    status: "scheduled",
  },
  {
    id: "schedule-3",
    trainNumber: "TR-201",
    trainName: "Haramain Express",
    origin: "Mecca",
    destination: "Medina",
    departureTime: "10:00",
    arrivalTime: "12:30",
    date: "2026-05-16",
    totalSeats: 80,
    availableSeats: 62,
    pricePerSeat: 180,
    status: "scheduled",
  },
  {
    id: "schedule-4",
    trainNumber: "TR-301",
    trainName: "Eastern Line",
    origin: "Riyadh",
    destination: "Dammam",
    departureTime: "07:30",
    arrivalTime: "11:00",
    date: "2026-05-16",
    totalSeats: 50,
    availableSeats: 35,
    pricePerSeat: 150,
    status: "scheduled",
  },
  {
    id: "schedule-5",
    trainNumber: "TR-401",
    trainName: "North Star",
    origin: "Riyadh",
    destination: "Qassim",
    departureTime: "09:00",
    arrivalTime: "12:00",
    date: "2026-05-17",
    totalSeats: 40,
    availableSeats: 28,
    pricePerSeat: 120,
    status: "scheduled",
  },
  {
    id: "schedule-6",
    trainNumber: "TR-501",
    trainName: "Coastal Runner",
    origin: "Jeddah",
    destination: "Yanbu",
    departureTime: "14:00",
    arrivalTime: "17:30",
    date: "2026-05-17",
    totalSeats: 45,
    availableSeats: 40,
    pricePerSeat: 130,
    status: "scheduled",
  },
]

// Generate seats for a schedule
export function generateSeatsForSchedule(scheduleId: string, totalSeats: number, reservedSeats: string[] = []): Seat[] {
  const seats: Seat[] = []
  const seatsPerCarriage = 20
  const carriages = Math.ceil(totalSeats / seatsPerCarriage)

  for (let c = 1; c <= carriages; c++) {
    const seatsInThisCarriage = Math.min(seatsPerCarriage, totalSeats - (c - 1) * seatsPerCarriage)
    
    for (let s = 1; s <= seatsInThisCarriage; s++) {
      const seatNumber = `${c}${String.fromCharCode(64 + ((s - 1) % 4) + 1)}${Math.ceil(s / 4)}`
      const seatType: "window" | "aisle" | "middle" = 
        s % 4 === 1 || s % 4 === 0 ? "window" : 
        s % 4 === 2 || s % 4 === 3 ? "aisle" : "middle"
      
      seats.push({
        id: `${scheduleId}-seat-${c}-${s}`,
        seatNumber,
        carriage: c,
        isReserved: reservedSeats.includes(seatNumber),
        type: seatType,
      })
    }
  }

  return seats
}

// Initial Reservations
export const initialReservations: Reservation[] = [
  {
    id: "res-1",
    passengerId: "user-1",
    passengerName: "Ahmed Al-Fahad",
    passengerEmail: "passenger@train.com",
    scheduleId: "schedule-1",
    trainNumber: "TR-101",
    origin: "Riyadh",
    destination: "Jeddah",
    departureTime: "08:00",
    arrivalTime: "14:30",
    date: "2026-05-15",
    seats: ["1A1", "1B1"],
    totalPrice: 500,
    status: "confirmed",
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "res-2",
    passengerId: "user-4",
    passengerName: "Faris Al-Sadoon",
    passengerEmail: "faris@train.com",
    scheduleId: "schedule-3",
    trainNumber: "TR-201",
    origin: "Mecca",
    destination: "Medina",
    departureTime: "10:00",
    arrivalTime: "12:30",
    date: "2026-05-16",
    seats: ["2C1"],
    totalPrice: 180,
    status: "confirmed",
    createdAt: new Date("2024-03-05"),
  },
]

// Cities for dropdowns
export const cities = [
  "Riyadh",
  "Jeddah",
  "Mecca",
  "Medina",
  "Dammam",
  "Qassim",
  "Yanbu",
  "Tabuk",
  "Abha",
]
