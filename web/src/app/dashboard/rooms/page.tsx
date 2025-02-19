import { RoomsTable } from "@/components/rooms-table"

export default function RoomsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Hotel Rooms</h1>
      <RoomsTable />
    </div>
  )
} 