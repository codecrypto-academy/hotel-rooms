'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getContractABI } from '@/lib/contract'
import { ethers } from 'ethers'
import { getContractAddress } from '@/lib/contract'
import { useWeb3 } from '@/context/Web3Context'
import { useRouter } from 'next/navigation'

interface Total {
  year: number
  month: number
  day: number
  status: number
  roomType: number
  count: number
}

const statusMap = {
  0: 'Disponible',
  1: 'Reservado',
  2: 'Mantenimiento',
  3: 'Usado',
  4: 'Todos'
}

const roomTypeMap = {
  0: 'Standard',
  1: 'Deluxe',
  2: 'Suite',
  3: 'Todos'
}

export default function ResumenPage() {
  const [totals, setTotals] = useState<Total[]>([])
  const { provider , account} = useWeb3();
  const router = useRouter();
  useEffect(() => {
    if (!provider || !account) {
      router.push('/');
    }
    const fetchTotals = async () => {
      const contractAddress = await getContractAddress();
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, provider);
      try {
        const result = await contract.getTotals()
        const processedTotals = result.map((item: any) => ({
          year: Number(item.year),
          month: Number(item.month),
          day: Number(item.day),
          status: Number(item.status),
          roomType: Number(item.roomType),
          count: Number(item.count)
        }));

        processedTotals.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          if (a.month !== b.month) return a.month - b.month;
          return a.day - b.day;
        });
       
        setTotals(processedTotals);
      } catch (error) {
        console.error('Error fetching totals:', error)
      }
    }

    fetchTotals()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Habitaciones</CardTitle>
          <CardDescription>
            Vista general de las habitaciones por estado y tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Año</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead>Día</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo de Habitación</TableHead>
                  <TableHead>Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.map((total, index) => (
                  <TableRow key={index}>
                    <TableCell>{total.year}</TableCell>
                    <TableCell>{total.month}</TableCell>
                    <TableCell>{total.day}</TableCell>
                    <TableCell>
                      {total.status === 0 ? 'Disponible' : 
                       total.status === 1 ? 'Reservada' : 
                       total.status === 2 ? 'Mantenimiento' : 
                       total.status === 3 ? 'Ocupada' : 'Desconocido'}
                    </TableCell>
                    <TableCell>
                      {total.roomType === 0 ? 'Standard' :
                       total.roomType === 1 ? 'Deluxe' :
                       total.roomType === 2 ? 'Suite' : 'Desconocido'}
                    </TableCell>
                    <TableCell>{total.count}</TableCell>
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