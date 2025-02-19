export enum RoomStatus {
  AVAILABLE,
  BOOKED,
  USED,
  ALL,
}

export enum RoomType {
  STANDARD,
  DELUXE,
  SUITE,
  ALL
}

export interface RoomDay {
  roomId: bigint
  date: bigint
  year: number
  month: number
  day: number
  roomType: RoomType
  pricePerNight: bigint
  status: RoomStatus
  tokenId: bigint
  owner: string
} 