"use client";
import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { getContractABI, getContractAddress } from "@/lib/contract";

enum RoomType {
  STANDARD,
  DELUXE,
  SUITE,
}

export default function MintPage() {
  const { provider, account } = useWeb3();
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
    //const balance = await provider.getBalance(account);
    //console.log(balance);
    try {
      const signer = await provider.getSigner();
      const contractAddress = await getContractAddress();
      console.log("direccion del contrato",contractAddress);
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
      console.log(tx);

      await tx.wait();
      alert("Habitación minteada con éxito!");
    } catch (error) {
      console.error("Error al mintear:", error);
      alert("Error al mintear la habitación");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label className="block mb-2">Fecha Desde</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Fecha Hasta</label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Room ID Inicio</label>
        <input
          type="number"
          value={formData.roomIdStart}
          onChange={(e) =>
            setFormData({ ...formData, roomIdStart: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Precio por noche (ETH)</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Tipo de Habitación</label>
        <select
          value={formData.roomType}
          onChange={(e) =>
            setFormData({ ...formData, roomType: Number(e.target.value) })
          }
          className="w-full p-2 border rounded"
        >
          <option value={RoomType.STANDARD}>Standard</option>
          <option value={RoomType.DELUXE}>Deluxe</option>
          <option value={RoomType.SUITE}>Suite</option>
        </select>
      </div>
      <Button type="submit">Mintear Habitación</Button>
    </form>
  );
}
