// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UtilsDate.sol";
import "../lib/forge-std/src/console.sol";

contract HotelRooms is ERC721, Ownable {
    uint256 public constant TOTAL_ROOMS = 100;
    address private _owner;

    uint256 public totalRoomDays;

    struct Total {
        uint256 year;
        uint256 month;
        uint256 day;
        RoomStatus status;
        RoomType roomType;
        uint256 count;
    }

    Total[] private totals;
    // totales por dia, por mes , por tipo de habitacion
    // por statu
    enum RoomType {
        STANDARD,
        DELUXE,
        SUITE,
        ALL
    }

    enum RoomStatus {
        AVAILABLE,
        BOOKED,
        MAINTENANCE,
        USED,
        ALL
    }

    struct RoomDay {
        uint256 roomId;
        uint256 date;
        uint256 year;
        uint256 month;
        uint256 day;
        RoomType roomType;
        uint256 pricePerNight;
        RoomStatus status;
        uint256 tokenId;
        address owner;
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

        function _createTokenId(
        uint256 roomId,
        uint256 date
    ) internal pure returns (uint256) {
        (uint256 year, uint256 month, uint256 day) = UtilsDate.timestampToDate(
            date
        );
        return (year * 10000 + month * 100 + day)*1000 + roomId;
    
    }

    function _addTotal(
        uint256 year,
        uint256 month,
        uint256 day,
        RoomStatus status,
        RoomType roomType
    ) internal {
        bool found = false;
        for (uint i = 0; i < totals.length; i++) {
            if (
                totals[i].year == year &&
                totals[i].month == month &&
                totals[i].day == day &&
                totals[i].status == status &&
                totals[i].roomType == roomType
            ) {
                totals[i].count++;
                found = true;
                break;
            }
        }

        if (!found) {
            Total memory newTotal = Total(
                year,
                month,
                day,
                status,
                roomType,
                1
            );
            totals.push(newTotal);
        }
    }
    function _acumulateTotal(
        uint256 date,
        RoomType roomType,
        RoomStatus status
    ) internal {
        (uint256 year, uint256 month, uint256 day) = UtilsDate.timestampToDate(
            date
        );

        _addTotal(year, month, day, status, roomType);
        //_addTotal(year, month, day, RoomStatus.ALL, RoomType.ALL);
        //_addTotal(year, month, 0, RoomStatus.ALL, RoomType.ALL);
        //_addTotal(year, 0, 0, RoomStatus.ALL, RoomType.ALL);
        //_addTotal(0, 0, 0, RoomStatus.ALL, RoomType.ALL);
    }

    function getTotals() external view returns (Total[] memory) {
        return totals;
    }

    function mintRoomDays(
        uint256 roomId,
        uint256 startDate,
        uint256 endDate,
        RoomType roomType,
        uint256 pricePerNight
    ) external {
        require(msg.sender == _owner, "Only owner can mint room days");
        require(roomId > 0 && roomId <= TOTAL_ROOMS, "Invalid room number");
        require(startDate <= endDate, "Invalid date range");
        require(startDate >= block.timestamp, "Cannot book past dates");
        
        for (uint256 date = startDate; date <= endDate; date += 1 days) {
            uint256 tokenId = _createTokenId(roomId, date);
            require(
                !_isBooked[roomId][date],
                "Room already booked for this date"
            );
            totalRoomDays++;
            (uint256 year, uint256 month, uint256 day) = UtilsDate.timestampToDate(
                date
            );
            RoomDay memory tmp = RoomDay(
                roomId,
                date,
                year,
                month,
                day,
                roomType,
                pricePerNight,
                RoomStatus.AVAILABLE,
                tokenId,
                msg.sender
            );
            allRoomDays.push(tmp);
           _acumulateTotal(date, roomType, RoomStatus.AVAILABLE);
            _roomDays[tokenId] = tmp;

            _safeMint(msg.sender, tokenId);
        }
    }

    function getAllRoomDays(
        uint256 offset,
        uint256 limit
    ) external view returns (RoomDay[] memory) {
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
        require(
            roomDay.status == RoomStatus.AVAILABLE,
            "Room is not available for transfer"
        );
        require(
            msg.value >= roomDay.pricePerNight,
            "Insufficient payment for transfer"
        );
        require(
            roomDay.date >= block.timestamp,
            "Cannot transfer expired room days"
        );
        // Update room status to booked
        _roomDays[tokenId].status = RoomStatus.BOOKED;
        _roomDays[tokenId].owner = msg.sender;
        _acumulateTotal(roomDay.date, roomDay.roomType, RoomStatus.BOOKED);
        _transfer(_owner, msg.sender, tokenId);
    }

    function getRoomDay(
        uint256 tokenId
    ) external view returns (uint256 roomId, uint256 date) {
        RoomDay memory roomDay = _roomDays[tokenId];
        require(roomDay.roomId != 0, "Room day not found");
        return (roomDay.roomId, roomDay.date);
    }

     function getRoomDayFilter(
        address owner,
        RoomStatus status,
        RoomType roomType,
        uint256 year,
        uint256 month,
        uint256 day
    ) external view returns (RoomDay[] memory) {
        RoomDay[] memory result = new RoomDay[](allRoomDays.length);
        uint256 index = 0;
        for (uint256 i = 0; i < allRoomDays.length; i++) {
            if ((owner == address(0) || allRoomDays[i].owner == owner) && 
                (allRoomDays[i].status == status || status == RoomStatus.ALL) && 
                (allRoomDays[i].roomType == roomType || roomType == RoomType.ALL) &&
                (year == 0 || allRoomDays[i].year == year) &&
                (month == 0 || allRoomDays[i].month == month) &&
                (day == 0 || allRoomDays[i].day == day)
            ) {
                result[index++] = allRoomDays[i];
                }

        }
        // Create a new array with the exact size needed
        RoomDay[] memory finalResult = new RoomDay[](index);
        // Copy only the valid elements
        for (uint256 i = 0; i < index; i++) {
            finalResult[i] = result[i];
        }
        return finalResult;
    }

    function setToUsed(uint256 tokenId) external  {
        require(_roomDays[tokenId].roomId != 0, "Room day not found");
        RoomDay memory roomDay = _roomDays[tokenId];
        require(roomDay.status == RoomStatus.BOOKED, "Room is not booked");
        require(roomDay.owner == msg.sender, "You are not the owner of this room");
        _roomDays[tokenId].status = RoomStatus.USED;
        _acumulateTotal(roomDay.date, roomDay.roomType, RoomStatus.USED);
        _transfer(msg.sender, _owner, tokenId);
    }

    function getRoomDayToken(
        uint256 roomId,
        uint256 date
    ) external view returns (uint256 tokenId) {
        tokenId = _createTokenId(roomId, date);
        require(_roomDays[tokenId].roomId != 0, "Room day not found");
        return tokenId;
    }

    function isRoomBooked(
        uint256 roomId,
        uint256 date
    ) external view returns (RoomStatus) {
        return _roomDays[_createTokenId(roomId, date)].status;
    }

    function setPricePerNight(
        uint256 roomId,
        uint256 date,
        uint256 pricePerNight
    ) external onlyOwner {
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
