"use client"

import { useState, Suspense } from "react"
import { useWeb3 } from "@/context/Web3Context"
import { ethers } from "ethers"
import { getContractABI, getContractAddress } from "@/lib/contract"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  CalendarIcon, ShoppingCart, Clock, Info
} from "lucide-react"
import { useSearchParams } from 'next/navigation'

const roomTypes = [
  { id: "standard", name: "Standard Room", price: "0.08", color: "bg-blue-500" },
  { id: "deluxe", name: "Deluxe Suite", price: "0.15", color: "bg-purple-500" },
  { id: "suite", name: "Presidential Suite", price: "0.35", color: "bg-yellow-500" },
]

function ComprarPageContent() {
    const searchParams = useSearchParams()
    const tokenIdFromUrl = searchParams.get("tokenId") || ""

    const [formData, setFormData] = useState({
        roomId: tokenIdFromUrl,
        roomType: "",
        date: undefined as Date | undefined,
    })
    const [loading, setLoading] = useState(false)
    const { provider, account } = useWeb3()
    const router = useRouter()
    const selectedRoomType = roomTypes.find(rt => rt.id === formData.roomType)

  const handlePurchase = async () => {
    if (!formData.date || !formData.roomType || !formData.roomId) {
      alert("Por favor completa todos los campos")
      return
    }

    if (!provider || !account) {
      router.push("/")
      return
    }

    try {
      setLoading(true)
      const signer = await provider.getSigner()
      const contractAddress = await getContractAddress()
      const abi = await getContractABI()
      const contract = new ethers.Contract(contractAddress, abi, signer)

      const tx = await contract.transferRoomDay(
        BigInt(formData.roomId),
        {
          value: ethers.parseEther(selectedRoomType?.price || "0.08"),
        }
      )

      await tx.wait()
      alert("¬°Habitaci√≥n reservada con √©xito!")
      setFormData({ roomId: "", roomType: "", date: undefined })
    } catch (err) {
      console.error("Error:", err)
      alert("Ocurri√≥ un error al procesar la reserva.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">

      {/* Glassy Card Header */}
      <Card className="border-0 shadow-lg"> 
        <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Comprar Habitaci√≥n
              </h1>
              <p className="text-sm text-slate-600">
                Transferencia directa usando el <strong className="text-blue-700">Token ID</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Compra */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Datos de la Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handlePurchase()
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Token ID */}
              <div className="space-y-1">
                <Label>Token ID</Label>
                <Input
                  type="number"
                  placeholder="Ej: 20250611001"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  El <strong>Token ID exacto</strong> de la habitaci√≥n.
                </p>
              </div>

              {/* Room Type */}
              <div className="space-y-1">
                <Label>Tipo de Habitaci√≥n</Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${type.color}`} />
                          {type.name} - {type.price} ETH
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="space-y-1">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-left h-11">
                      {formData.date ? format(formData.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-4 z-50" align="start">
                    <Calendar
                      mode="single"
                      locale={es}
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date: date! })}
                      className="rounded-md border shadow"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Estimaci√≥n de Precio */}
            {selectedRoomType && (
              <div className="flex items-center justify-between px-4 py-3 rounded-md border bg-blue-50">
                <div>
                  <p className="text-sm text-slate-600">Precio estimado</p>
                  <p className="text-xl font-bold text-blue-700">{selectedRoomType.price} ETH</p>
                </div>
                <Badge className={`${selectedRoomType.color} text-white`}>
                  {selectedRoomType.name}
                </Badge>
              </div>
            )}

            {/* Comprar */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-500"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Comprar Ahora
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ComprarPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-10 text-center">Cargando...</div>}>
      <ComprarPageContent />
    </Suspense>
  )
}
