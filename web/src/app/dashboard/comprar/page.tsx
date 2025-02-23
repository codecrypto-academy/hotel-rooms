"use client";
import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { ethers } from "ethers";
import { getContractABI } from "@/lib/contract";
import { getContractAddress } from "@/lib/contract";
import { useRouter } from "next/navigation";
export default function ComprarPage() {
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { provider, account } = useWeb3();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider || !account) {
      router.push("/");
      return;
    }

    try {
      setLoading(true);
      // const dateTimestamp = Math.floor(new Date(date).getTime() / 1000);

      const signer = await provider.getSigner();
      const contractAddress = await getContractAddress();
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();

      // Get token ID using year, month, day format
      const tokenId =
        (year * 10000 + month * 100 + day) * 1000 + Number(roomId);

      // Realizar la transferencia del token
      const tx = await contract.transferRoomDay(tokenId, {
        value: ethers.parseEther("12"),
      });

      await tx.wait();
      alert("Habitación reservada con éxito!");
    } catch (error) {
      console.error("Error al comprar la habitación:", error);
      alert("Error al realizar la compra. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-5 bg-white rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Comprar Habitación
      </h1>
      <p className="text-gray-600 mb-6">
        Reserva una habitación existente para la fecha deseada.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID de la Habitación
          </label>
          <input
            type="number"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-gold focus:ring-gold"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-gold focus:ring-gold"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gold hover:bg-goldHover text-white 
                     font-medium py-2 px-4 rounded-md transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Procesando..." : "Comprar"}
        </button>
      </form>
    </div>
  );
}
