"use server";

import contractABI from '@/lib/abi.json';
import contractAddress from '@/lib/contrato.json';


export async function getContractABI() {
  return contractABI.abi;
}

export async function getContractAddress() {
  return contractAddress.address;
}
