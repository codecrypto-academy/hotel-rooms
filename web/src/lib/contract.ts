"use server";

import fs from "fs";
import path from "path";
import contractABI from '@/lib/abi.json';


export async function getContractABI() {
  return contractABI.abi;
}

export async function getContractAddress() {
  const contractAddress = fs.readFileSync(path.join(process.cwd(),  'src', 'lib', 'contrato.json'), 'utf8').toString();
  return contractAddress.trim();
}
