import { BookingForm } from "@/components/booking/booking-form"

interface BookingPageProps {
  params: Promise<{ scheduleId: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { scheduleId } = await params
  return <BookingForm scheduleId={scheduleId} />
}
