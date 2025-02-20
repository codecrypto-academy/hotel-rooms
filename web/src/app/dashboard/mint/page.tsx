"use client";

import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { getContractABI, getContractAddress } from "@/lib/contract";
import { useRouter } from "next/navigation";
enum RoomType {
  STANDARD,
  DELUXE,
  SUITE,
}

export default function MintPage() {
  const { provider, account } = useWeb3();
  const router = useRouter();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    roomIdStart: "",
    roomIdEnd: "",
    price: "",
    roomType: RoomType.STANDARD,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account) return;

    try {
      const signer = provider.getSigner();
      const contractAddress = await getContractAddress();
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const startTimestamp = new Date(formData.startDate).getTime() / 1000;
      const endTimestamp = new Date(formData.endDate).getTime() / 1000;

      const tx = await contract.mintRoomDays(
        formData.roomIdStart,
        startTimestamp,
        endTimestamp,
        formData.roomType,
        ethers.parseEther(formData.price)
      );

      await tx.wait();
      alert("Habitación minteada con éxito!");
    } catch (error) {
      console.error("Error al mintear:", error);
      alert("Error al mintear la habitación");
    }
  };

  return (
    <div className="container max-w-xl mx-auto mt-5 bg-white rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mintear Habitaciones</h1>
      <p className="text-gray-600 mb-6">
        Genera tokens para fechas específicas y asigna precios para habitaciones.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Desde
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-gold focus:ring-gold"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Hasta
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-gold focus:ring-gold"
            required
          />
        </div>

        {/* Room ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room ID Inicio
          </label>
          <input
            type="number"
            value={formData.roomIdStart}
            onChange={(e) =>
              setFormData({ ...formData, roomIdStart: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-gold focus:ring-gold"
            required
          />
        </div>

        {/* Price per Night */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio por noche (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-gold focus:ring-gold"
            required
          />
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Habitación
          </label>
          <select
            value={formData.roomType}
            onChange={(e) =>
              setFormData({ ...formData, roomType: Number(e.target.value) })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-gold focus:ring-gold"
            required
          >
            <option value={RoomType.STANDARD}>Standard</option>
            <option value={RoomType.DELUXE}>Deluxe</option>
            <option value={RoomType.SUITE}>Suite</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gold hover:bg-goldHover text-white 
                     font-medium py-2 px-4 rounded-md transition"
        >
          Mintear
        </Button>
      </form>
    </div>
  );
}
