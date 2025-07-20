// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";
import { IPrimusZKTLS, Attestation } from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

contract BilibiliAccountRegistry {
    IPrimusZKTLS public constant PRIMUS_VERIFIER = IPrimusZKTLS(0x1Ad7fD53206fDc3979C672C0466A1c48AF47B431);
    
    struct BilibiliInfo {
        string currentLevel;
        uint256 vipDueDate;
        uint256 verifiedAt;
    }
    
    mapping(address => BilibiliInfo) public walletToBilibiliInfo;
    mapping(address => bool) public isBilibiliVerified;
    
    event BilibiliAccountBound(
        address indexed wallet, 
        string currentLevel, 
        uint256 vipDueDate, 
        uint256 timestamp
    );
    event BilibiliAccountUnbound(address indexed wallet, uint256 timestamp);
    
    error InvalidAttestation();
    error BilibiliAlreadyBound();
    error NotOwner();
    error EmptyBilibiliData();
    error InvalidBilibiliData();
    
    modifier onlyValidAttestation(Attestation calldata attestation) {
        if (!verifyAttestation(attestation)) {
            revert InvalidAttestation();
        }
        _;
    }
    
    function verifyAttestation(Attestation calldata attestation) internal view virtual returns (bool) {
        try PRIMUS_VERIFIER.verifyAttestation(attestation) {
            return true;
        } catch {
            return false;
        }
    }
    
    function _parseBilibiliData(string memory attestationData) internal pure returns (string memory level, uint256 vipDueDate) {
        bytes memory data = bytes(attestationData);
        
        if (data.length == 0) {
            revert EmptyBilibiliData();
        }
        
        // Parse JSON for current_level and vipDueDate
        // Expected format: {"current_level":"6","vipDueDate":"1776700800000"}
        
        // Extract current_level
        string memory levelPattern = '"current_level":"';
        level = _extractJsonValue(attestationData, levelPattern);
        
        // Extract vipDueDate
        string memory vipPattern = '"vipDueDate":"';
        string memory vipDateStr = _extractJsonValue(attestationData, vipPattern);
        
        // Convert vipDueDate string to uint256
        vipDueDate = _stringToUint(vipDateStr);
        
        if (bytes(level).length == 0) {
            revert InvalidBilibiliData();
        }
    }
    
    function _extractJsonValue(string memory data, string memory pattern) internal pure returns (string memory) {
        bytes memory dataBytes = bytes(data);
        bytes memory patternBytes = bytes(pattern);
        
        // Find pattern in data
        for (uint256 i = 0; i <= dataBytes.length - patternBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < patternBytes.length; j++) {
                if (dataBytes[i + j] != patternBytes[j]) {
                    found = false;
                    break;
                }
            }
            
            if (found) {
                // Found pattern, now extract value until next quote
                uint256 valueStart = i + patternBytes.length;
                uint256 valueEnd = valueStart;
                
                // Find closing quote
                while (valueEnd < dataBytes.length && dataBytes[valueEnd] != '"') {
                    valueEnd++;
                }
                
                if (valueEnd > valueStart) {
                    bytes memory valueBytes = new bytes(valueEnd - valueStart);
                    for (uint256 k = 0; k < valueEnd - valueStart; k++) {
                        valueBytes[k] = dataBytes[valueStart + k];
                    }
                    return string(valueBytes);
                }
            }
        }
        
        return "";
    }
    
    function _stringToUint(string memory str) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        uint256 result = 0;
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            uint8 digit = uint8(strBytes[i]);
            if (digit >= 48 && digit <= 57) {
                result = result * 10 + (digit - 48);
            }
        }
        
        return result;
    }
    
    function bindBilibiliAccount(
        Attestation calldata attestation
    ) external onlyValidAttestation(attestation) {
        // Check if wallet is already bound to a Bilibili account
        if (isBilibiliVerified[msg.sender]) {
            revert BilibiliAlreadyBound();
        }
        
        // Parse Bilibili data from attestation
        (string memory currentLevel, uint256 vipDueDate) = _parseBilibiliData(attestation.data);
        
        // Store the Bilibili info
        walletToBilibiliInfo[msg.sender] = BilibiliInfo({
            currentLevel: currentLevel,
            vipDueDate: vipDueDate,
            verifiedAt: block.timestamp
        });
        isBilibiliVerified[msg.sender] = true;
        
        emit BilibiliAccountBound(msg.sender, currentLevel, vipDueDate, block.timestamp);
    }
    
    function unbindBilibiliAccount() external {
        if (!isBilibiliVerified[msg.sender]) {
            revert NotOwner();
        }
        
        // Remove the binding
        delete walletToBilibiliInfo[msg.sender];
        delete isBilibiliVerified[msg.sender];
        
        emit BilibiliAccountUnbound(msg.sender, block.timestamp);
    }
    
    function getBilibiliInfoByWallet(address wallet) external view returns (BilibiliInfo memory) {
        return walletToBilibiliInfo[wallet];
    }
    
    function isWalletBilibiliVerified(address wallet) external view returns (bool) {
        return isBilibiliVerified[wallet];
    }
    
    function getBilibiliLevel(address wallet) external view returns (string memory) {
        return walletToBilibiliInfo[wallet].currentLevel;
    }
    
    function getBilibiliVipDueDate(address wallet) external view returns (uint256) {
        return walletToBilibiliInfo[wallet].vipDueDate;
    }
}