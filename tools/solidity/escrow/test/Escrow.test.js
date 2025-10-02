const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let Escrow;
  let escrow;
  let owner;
  let payee;
  let arbiter;

  beforeEach(async function () {
    [owner, payee, arbiter] = await ethers.getSigners();
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(payee.address, arbiter.address);
    await escrow.deployed();
  });

  it("should set the correct payer, payee, and arbiter", async function () {
    expect(await escrow.payer()).to.equal(owner.address);
    expect(await escrow.payee()).to.equal(payee.address);
    expect(await escrow.arbiter()).to.equal(arbiter.address);
  });

  it("should allow the payer to deposit funds", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    await escrow.deposit({ value: depositAmount });
    expect(await escrow.amount()).to.equal(depositAmount);
  });

  it("should allow the arbiter to release funds to the payee", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    await escrow.deposit({ value: depositAmount });

    await expect(() => escrow.connect(arbiter).release())
      .to.changeEtherBalance(payee, depositAmount);

    expect(await escrow.amount()).to.equal(0);
  });

  it("should not allow non-arbiter to release funds", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    await escrow.deposit({ value: depositAmount });

    await expect(escrow.connect(owner).release()).to.be.revertedWith("revert");
    await expect(escrow.connect(payee).release()).to.be.revertedWith("revert");
  });
});
