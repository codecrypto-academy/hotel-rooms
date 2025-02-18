// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "forge-std/console.sol";


contract HotelRooms is ERC721, Ownable {
    uint256 public constant TOTAL_ROOMS = 100;
    address private _owner;

    uint256 public totalRoomDays;

    enum RoomType {
        STANDARD,
        DELUXE,
        SUITE
    }


    enum RoomStatus {
        AVAILABLE,
        BOOKED,
        MAINTENANCE,
        USED
    }

     struct RoomDay {
        uint256  roomId;
        uint256  date;
        RoomType  roomType;
        uint256  pricePerNight;
        RoomStatus  status;
    }
    
    // Array to store all room days for pagination
    RoomDay[] private allRoomDays;
    


    
    // Mapping from tokenId to RoomDay
    mapping(uint256 => RoomDay) private _roomDays;
    


    // Mapping to track if a room is booked for a specific date
    mapping(uint256 => mapping(uint256 => bool)) private _isBooked;
    

    
    
    constructor() ERC721("HotelRooms", "HROOM") Ownable(msg.sender) {
        _owner = msg.sender;
    }
    
    function _createTokenId(uint256 roomId, uint256 date) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(roomId, date)));
    }
    
    function mintRoomDays(uint256 roomId, uint256 startDate, uint256 endDate, RoomType roomType, uint256 pricePerNight) external  {
        require(msg.sender == _owner, "Only owner can mint room days");
        require(roomId > 0 && roomId <= TOTAL_ROOMS, "Invalid room number");
        require(startDate <= endDate, "Invalid date range");
        require(startDate >= block.timestamp, "Cannot book past dates");
        
        for (uint256 date = startDate; date <= endDate; date += 1 days) {
            uint256 tokenId = _createTokenId(roomId, date);
            require(!_isBooked[roomId][date], "Room already booked for this date");
            totalRoomDays++;
            RoomDay memory tmp = RoomDay(roomId, date, roomType, pricePerNight, RoomStatus.AVAILABLE);
            allRoomDays.push(tmp);
            _roomDays[tokenId] = tmp;
            
            _safeMint(msg.sender, tokenId);
        }
    }

    function getAllRoomDays(uint256 offset, uint256 limit) external view returns (RoomDay[] memory) {
        // Calculate the end index ensuring we don't exceed array bounds
        uint256 end = offset + limit;
        if (end > allRoomDays.length) {
            end = allRoomDays.length;
        }
        
        // Calculate actual size of return array
        uint256 size = end - offset;
        RoomDay[] memory result = new RoomDay[](size);
        
        // Copy elements to result array
        for (uint256 i = 0; i < size; i++) {
            result[i] = allRoomDays[offset + i];
        }
        
        return result;
    }
    function transferRoomDay(uint256 tokenId) external payable {
        // require(_exists(tokenId), "Token does not exist"); investigar
        RoomDay memory roomDay = _roomDays[tokenId];
        require(roomDay.status == RoomStatus.AVAILABLE, "Room is not available for transfer");
        require(msg.value >= roomDay.pricePerNight, "Insufficient payment for transfer");
        require(roomDay.date >= block.timestamp, "Cannot transfer expired room days");
        // Update room status to booked
        _roomDays[tokenId].status = RoomStatus.BOOKED;
        

  
        _transfer(_owner, msg.sender, tokenId);
    }

    function getRoomDay(uint256 tokenId) external view returns (uint256 roomId, uint256 date) {
        RoomDay memory roomDay = _roomDays[tokenId];
        require(roomDay.roomId != 0, "Room day not found");
        return (roomDay.roomId, roomDay.date);
    }
    
    function getRoomDayToken(uint256 roomId, uint256 date) external view returns (uint256 tokenId) {
        tokenId = _createTokenId(roomId, date);
        require(_roomDays[tokenId].roomId != 0, "Room day not found");
        return tokenId;
    }
    
    function isRoomBooked(uint256 roomId, uint256 date) external view returns (RoomStatus) {
        return _roomDays[_createTokenId(roomId, date)].status;
    }
    
    function setPricePerNight(uint256 roomId, uint256 date, uint256 pricePerNight) external onlyOwner  {
        require(!_isBooked[roomId][date], "Room is already booked");
        require(roomId > 0 && roomId <= TOTAL_ROOMS, "Invalid room number");
        require(date > 0, "Invalid date");
        require(pricePerNight > 0, "Invalid price per night");
        _roomDays[_createTokenId(roomId, date)].pricePerNight = pricePerNight;
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }
} 