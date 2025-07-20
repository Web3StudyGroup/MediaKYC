// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BilibiliAccountRegistry.sol";

contract DeployBili is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        BilibiliAccountRegistry registry = new BilibiliAccountRegistry();
        
        console.log("BilibiliAccountRegistry deployed at:", address(registry));
        console.log("Primus Verifier address:", address(registry.PRIMUS_VERIFIER()));
        
        vm.stopBroadcast();
    }
}