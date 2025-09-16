const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(deployer.address, deployer.address); // Placeholder payee and arbiter

  await escrow.deployed();

  console.log("Escrow deployed to:", escrow.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
