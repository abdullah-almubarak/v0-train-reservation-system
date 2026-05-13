"use client"

import { useState, useMemo } from "react"
import type { Seat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Armchair, Square } from "lucide-react"

interface SeatSelectionProps {
  seats: Seat[]
  selectedSeats: string[]
  onSeatToggle: (seatNumber: string) => void
  maxSeats?: number
}

export function SeatSelection({
  seats,
  selectedSeats,
  onSeatToggle,
  maxSeats = 6,
}: SeatSelectionProps) {
  // Group seats by carriage
  const seatsByCarriage = useMemo(() => {
    const grouped = new Map<number, Seat[]>()
    seats.forEach((seat) => {
      const existing = grouped.get(seat.carriage) || []
      grouped.set(seat.carriage, [...existing, seat])
    })
    return grouped
  }, [seats])

  const handleSeatClick = (seat: Seat) => {
    if (seat.isReserved) return
    
    if (selectedSeats.includes(seat.seatNumber)) {
      onSeatToggle(seat.seatNumber)
    } else if (selectedSeats.length < maxSeats) {
      onSeatToggle(seat.seatNumber)
    }
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border-2 bg-[oklch(0.6_0.18_145_/_0.2)] border-[oklch(0.6_0.18_145_/_0.5)]" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border-2 bg-primary text-primary-foreground flex items-center justify-center">
                <Armchair className="w-4 h-4" />
              </div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border-2 bg-muted border-muted-foreground/30 opacity-60" />
              <span className="text-sm">Reserved</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>W = Window</span>
              <span>|</span>
              <span>A = Aisle</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carriages */}
      {Array.from(seatsByCarriage.entries()).map(([carriage, carriageSeats]) => (
        <Card key={carriage}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Carriage {carriage}</span>
              <Badge variant="secondary">
                {carriageSeats.filter((s) => !s.isReserved).length} available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[300px]">
                {/* Train carriage visual */}
                <div className="relative bg-muted/50 rounded-lg p-4 border">
                  {/* Train front indicator */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    Front
                  </div>

                  {/* Seats grid - 4 seats per row (2 + aisle + 2) */}
                  <div className="mt-4 space-y-2">
                    {Array.from({ length: Math.ceil(carriageSeats.length / 4) }).map((_, rowIndex) => {
                      const rowSeats = carriageSeats.slice(rowIndex * 4, (rowIndex + 1) * 4)
                      return (
                        <div key={rowIndex} className="flex items-center justify-center gap-1">
                          {/* Left seats (Window + Aisle) */}
                          <div className="flex gap-1">
                            {rowSeats.slice(0, 2).map((seat) => (
                              <SeatButton
                                key={seat.id}
                                seat={seat}
                                isSelected={selectedSeats.includes(seat.seatNumber)}
                                onClick={() => handleSeatClick(seat)}
                              />
                            ))}
                          </div>

                          {/* Aisle */}
                          <div className="w-8 flex items-center justify-center">
                            <div className="w-0.5 h-8 bg-border" />
                          </div>

                          {/* Right seats (Aisle + Window) */}
                          <div className="flex gap-1">
                            {rowSeats.slice(2, 4).map((seat) => (
                              <SeatButton
                                key={seat.id}
                                seat={seat}
                                isSelected={selectedSeats.includes(seat.seatNumber)}
                                onClick={() => handleSeatClick(seat)}
                              />
                            ))}
                          </div>

                          {/* Row number */}
                          <div className="w-8 text-center text-xs text-muted-foreground">
                            {rowIndex + 1}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Train back indicator */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-muted-foreground/20 text-muted-foreground text-xs rounded-full">
                    Back
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedSeats.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Selected Seats</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSeats.map((seat) => (
                    <Badge key={seat} variant="default">
                      {seat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {selectedSeats.length} of {maxSeats} max
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface SeatButtonProps {
  seat: Seat
  isSelected: boolean
  onClick: () => void
}

function SeatButton({ seat, isSelected, onClick }: SeatButtonProps) {
  const getSeatTypeLabel = (type: string) => {
    switch (type) {
      case "window":
        return "W"
      case "aisle":
        return "A"
      default:
        return "M"
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={seat.isReserved}
      className={cn(
        "relative w-10 h-10 rounded border-2 flex flex-col items-center justify-center transition-all",
        seat.isReserved
          ? "bg-muted border-muted-foreground/30 cursor-not-allowed opacity-60"
          : isSelected
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-[oklch(0.6_0.18_145_/_0.2)] border-[oklch(0.6_0.18_145_/_0.5)] hover:bg-[oklch(0.6_0.18_145_/_0.4)] cursor-pointer"
      )}
      title={`Seat ${seat.seatNumber} (${seat.type})`}
    >
      <span className="text-xs font-medium">{seat.seatNumber}</span>
      <span className="text-[8px] opacity-70">{getSeatTypeLabel(seat.type)}</span>
    </button>
  )
}
