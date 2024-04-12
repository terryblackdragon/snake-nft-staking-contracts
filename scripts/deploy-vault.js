require("@nomicfoundation/hardhat-ethers");
const hre = require("hardhat");
const fs = require("fs");
const fse = require("fs-extra");

const { verify } = require("../utils/verify");
const {
  getAmountInWei,
  developmentChains,
} = require("../utils/helper-scripts");

async function main() {
  const deployNetwork = hre.network.name;
  console.log("DEPLOY_NETWORK=", deployNetwork);
  console.log("DEPLOY_NETWORK_CHAIN_ID=", hre.network.config.chainId)

  // test URI
  //const baseURI = "ipfs://QmUmADmBShjzkMdwBNwrDXcuWZZL7az1znB52R6yGejj1t";
  const baseURI = "ipfs://QmQp2wetEnju3zp6N93igCDjQUDLJJnhCLrXN78Z1opiCA";

  const maxSupply = 10000;
  const mintCost = getAmountInWei(0.01);
  const maxMintAmount = 5;
  console.log("mintCost=", mintCost);

  // 1. Deploy APE NFT contract
  console.log("--- 1 --- APE deployment!");
  const NFTContract = await ethers.getContractFactory("APE");
  console.log("--- 1-1 ---");
  const nftContract = await NFTContract.deploy(
    maxSupply,
    mintCost,
    maxMintAmount
  );

  console.log("--- 1-2 ---");
  await nftContract.deployed();
  // await nftContract.waitForDeployment();

  console.log("--- 1-3 ---");
  const set_tx = await nftContract.setBaseURI(baseURI);
  await set_tx.wait();
  console.log("--- 1-end ---");

  // 2. Deploy APE ERC20 token contract
  console.log("--- 2 --- SAPE deployment!");
  const TokenContract = await ethers.getContractFactory("SAPE");
  console.log("--- 2-1 ---");
  const tokenContract = await TokenContract.deploy();

  console.log("--- 2-2 ---");
  await tokenContract.deployed();
  // await tokenContract.waitForDeployment();
  console.log("--- 2-end ---");
  
  // 3. Deploy NFTStakingVault contract
  console.log("--- 3 --- NFTStakingVault deployment!");
  const Vault = await ethers.getContractFactory("NFTStakingVault");

  console.log("--- 3-1 ---");
  const stakingVault = await Vault.deploy(
    nftContract.address,
    tokenContract.address
  );

  console.log("--- 3-2 ---");
  await stakingVault.deployed();
  // await stakeValue.waitForDeployment();

  console.log("--- 3-3 ---");
  const control_tx = await tokenContract.setController(
    stakingVault.address,
    true
  );
  await control_tx.wait();
  console.log("--- 3-end ---");

  // 4. Show deployed infos
  console.log(
    "****** APE NFT contract deployed at:\n",
    nftContract.address
  );
  console.log(
    "****** APE ERC20 token contract deployed at:\n",
    tokenContract.address
  );
  console.log("****** NFT Staking Vault deployed at:\n", stakingVault.address);
  console.log("****** Network deployed to :\n", deployNetwork);

  // 5. Transfer contracts addresses & ABIs to the front-end
  console.log("--- 5 --- Transfer contracts addresses & ABIs to the front-end!");
  if (fs.existsSync("../front-end/src")) {
    fs.rmSync("../src/artifacts", { recursive: true, force: true });
    fse.copySync("./artifacts/contracts", "../front-end/src/artifacts");
    fs.writeFileSync(
      "../front-end/src/utils/contracts-config.js",
      `
      export const stakingContractAddress = "${stakingVault.address}"
      export const nftContractAddress = "${nftContract.address}"
      export const tokenContractAddress = "${tokenContract.address}"
      export const ownerAddress = "${stakingVault.signer.address}"
      export const networkDeployedTo = "${hre.network.config.chainId}"
    `
    );
  }

  // 6. Verify
  console.log("--- 6 --- Verify!");
  // if (
  //   developmentChains.includes(deployNetwork) &&
  //   hre.config.etherscan.apiKey[deployNetwork]
  // ) {
    // 6.1. Verify NFTStakingVault contract
    console.log("--- 6-1 --- Verify NFTStakingVault contract!");
    console.log("waiting for 6 blocks verification ...");
    await stakingVault.deployTransaction.wait(6);

    const stakeArgs = [nftContract.address, tokenContract.address];
    await verify(stakingVault.address, stakeArgs);

    // 6.2. Verify APE ERC20 token contract
    console.log("--- 6-2 --- Verify APE ERC20 token contract!");
    console.log("waiting for 6 blocks verification ...");
    await tokenContract.deployTransaction.wait(6);

    await verify(tokenContract.address);

    // 6.3. Verify APE NFT contract
    console.log("--- 6-3 --- Verify APE NFT contract!");
    console.log("waiting for 6 blocks verification ...");
    await nftContract.deployTransaction.wait(6);

    const nftArgs = [maxSupply, mintCost, maxMintAmount];
    await verify(nftContract.address, nftArgs);
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
