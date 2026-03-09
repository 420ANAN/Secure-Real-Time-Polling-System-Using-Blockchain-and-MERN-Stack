const hre = require("hardhat");

async function main() {
    const PollingSystem = await hre.ethers.getContractFactory("PollingSystem");
    const pollingSystem = await PollingSystem.deploy();

    await pollingSystem.waitForDeployment();

    console.log(
        `PollingSystem deployed to ${pollingSystem.target}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
