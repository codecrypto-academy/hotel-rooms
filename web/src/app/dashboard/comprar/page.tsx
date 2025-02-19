'use client'
import { useState } from 'react'
import { useWeb3 } from '@/context/Web3Context'
import { ethers } from 'ethers'
import { getContractABI } from '@/lib/contract'
import { getContractAddress } from '@/lib/contract'
import { useRouter } from 'next/navigation'
export default function ComprarPage() {
  const [roomId, setRoomId] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const { provider, account } = useWeb3();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(provider, account);
        if (!provider || !account) {
          router.push('/')
          return
    }
   
    try {
      setLoading(true)
      
      const signer = await provider.getSigner();

      const contractAddress = await getContractAddress();
      
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, signer);

    
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1; 
      const day = dateObj.getDate();
      
      // Get token ID using year, month, day format
      const tokenId = (year * 10000 + month * 100 + day)*1000 + Number(roomId)    ;
                     
      console.log("Calculated tokenId:", tokenId);
      // Realizar la transferencia del token
      const tx = await contract.transferRoomDay(tokenId, {
        value: ethers.parseEther('12')
      })
      
      await tx.wait()
      
      alert('Habitación reservada con éxito!')
    } catch (error) {
      console.error('Error al comprar la habitación:', error)
      alert('Error al realizar la compra. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Comprar Habitación</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ID de la Habitación
          </label>
          <input
            type="number"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
         
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          Comprar
        </button>
      </form>
    </div>
  )
} 