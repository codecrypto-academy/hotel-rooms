// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UtilsDate.sol";

contract HotelRooms is ERC721, Ownable {
    uint256 public constant TOTAL_ROOMS = 100;

    uint256 public totalRoomDays;

    struct Total {
        uint256 year;
        uint256 month;
        uint256 day;
        RoomStatus status;
        RoomType roomType;
        int256 count;
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
      
    }

    function _createTokenId(
        uint256 roomId,
        uint256 date
    ) internal pure returns (uint256) {
        (uint256 year, uint256 month, uint256 day) = UtilsDate.timestampToDate(
            date
        );
        return (year * 10000 + month * 100 + day) * 1000 + roomId;
    }

    function _addTotal(
        uint256 year,
        uint256 month,
        uint256 day,
        RoomStatus status,
        RoomType roomType,
        int256 count
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
                totals[i].count = totals[i].count + count;
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
        RoomStatus status,
        int256 count
    ) internal {
        (uint256 year, uint256 month, uint256 day) = UtilsDate.timestampToDate(
            date
        );

        _addTotal(year, month, day, status, roomType, count);
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
    ) public onlyOwner {
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
            (uint256 year, uint256 month, uint256 day) = UtilsDate
                .timestampToDate(date);
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
            _acumulateTotal(date, roomType, RoomStatus.AVAILABLE, 1);
            _roomDays[tokenId] = tmp;

            _isBooked[roomId][date] = true;
            _mint(msg.sender, tokenId);
        }
    }

    function mintMultipleRoomDays(
        uint256 roomIdStart,
        uint256 roomIdEnd,
        uint256 startDate,
        uint256 endDate,
        RoomType roomType,
        uint256 pricePerNight
    ) external onlyOwner {
        for (uint256 roomId = roomIdStart; roomId <= roomIdEnd; roomId++) {
            mintRoomDays(
                roomId,
                startDate,
                endDate,
                roomType,
                pricePerNight
            );
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

    function mintRoomDaysMultiple(
        uint256[] calldata tokenIds
    ) external payable {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            this.transferRoomDay(tokenIds[i]);
        }
    }

    function transferRoomDay(uint256 tokenId) public payable {
        
        RoomDay memory roomDay = _roomDays[tokenId];
        require(
            roomDay.status == RoomStatus.AVAILABLE,
            "Room is not available for transfer"
        );
        
        require(
            roomDay.date >= block.timestamp,
            "Cannot transfer expired room days"
        );
        // Find and update the room day in the array
        for (uint256 i = 0; i < allRoomDays.length; i++) {
            if (allRoomDays[i].tokenId == tokenId) {
                allRoomDays[i].status = RoomStatus.BOOKED;
                allRoomDays[i].owner = msg.sender;
                break;
            }
        }
        // Update room status to booked
        roomDay.status = RoomStatus.BOOKED;
        roomDay.owner = msg.sender;

        _acumulateTotal(
            roomDay.date,
            roomDay.roomType,
            RoomStatus.AVAILABLE,
            -1
        );
        _acumulateTotal(roomDay.date, roomDay.roomType, RoomStatus.BOOKED, 1);
        _transfer(owner(), msg.sender, tokenId);
    }

    function transferRoomDayMultiple(
        uint256[] calldata tokenIds
    ) external payable {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            transferRoomDay(tokenIds[i]);
        }
    }

    function getRoomDay(
        uint256 tokenId
    ) external view returns (uint256 roomId, uint256 date) {
        RoomDay memory roomDay = _roomDays[tokenId];
        require(roomDay.roomId != 0, "Room day not found");
        return (roomDay.roomId, roomDay.date);
    }

    function getRoomsBetweenDates(
        uint256 dateFrom,
        uint256 dateTo
    ) external view returns (RoomDay[] memory) {
        RoomDay[] memory result = new RoomDay[](allRoomDays.length);
        uint256 index = 0;
        for (uint256 i = 0; i < allRoomDays.length; i++) {
            if (
                allRoomDays[i].date >= dateFrom && allRoomDays[i].date <= dateTo
            ) {
                result[index++] = allRoomDays[i];
            }
        }
        return result;
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
            if (
                (owner == address(0) || allRoomDays[i].owner == owner) &&
                (allRoomDays[i].status == status || status == RoomStatus.ALL) &&
                (allRoomDays[i].roomType == roomType ||
                    roomType == RoomType.ALL) &&
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

    function setToUsed(uint256 tokenId) external {
        require(_roomDays[tokenId].roomId != 0, "Room day not found");
        RoomDay memory roomDay = _roomDays[tokenId];
        // Search in allRoomDays to get the most up-to-date data
        
        // require(roomDay.status == RoomStatus.BOOKED, "Room is not booked");
        // require(
        //     roomDay.owner == msg.sender,
        //     "You are not the owner of this room"
        // );
        _roomDays[tokenId].status = RoomStatus.USED;
        // Update status in allRoomDays array
        for (uint256 i = 0; i < allRoomDays.length; i++) {
            if (allRoomDays[i].tokenId == tokenId) {
                allRoomDays[i].status = RoomStatus.USED;
                allRoomDays[i].owner = owner();
                break;
            }
        }
        _acumulateTotal(roomDay.date, roomDay.roomType, RoomStatus.BOOKED, -1);
        _acumulateTotal(roomDay.date, roomDay.roomType, RoomStatus.USED, 1);
        _transfer(msg.sender, owner(), tokenId);
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
    function getAllData() external view returns (RoomDay[] memory, Total[] memory) {
        return (allRoomDays, totals);
    }
    function misTokens() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < allRoomDays.length; i++) {
            if (allRoomDays[i].owner == msg.sender) {
                count++;
            }
        }
        uint256[] memory tokenIds = new uint256[](count);
        for (uint256 i = 0; i < allRoomDays.length; i++) {
            if (allRoomDays[i].owner == msg.sender) {
                tokenIds[count] = allRoomDays[i].tokenId;
                count++;
            }
        }
        return tokenIds;
    }

}
