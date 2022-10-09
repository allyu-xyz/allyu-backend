const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

// soup, ice cream, potato, rice, beans, gum, meat, fish, clams, bread 
const CODE_HASHES = ["0xe59a0f0df1c0a4ab0624a10fea5c1fb7495dec2bc3b288de26330b8861d30a8c", "0x9dc5260589df9cbacaef550296bb005c11c0ccd593a4d44256af82cc7159ceed", "0x9e159dfcfe557cc1ca6c716e87af98fdcb94cd8c832386d0429b2b7bec02754f", "0x5c26f52d908dd3893cc2a917b88293344c4ccd2dc32c30123af8678009327d52", "0xe246129de4a8a291c1d772650ceca0ebb56dd9996b985e6ce3e45a2e515cc577", "0x99848ba970ddbba92090c2be4b2cbe1cb9a55b04158224240aedf62261c9c05c", "0xb967753c19613e062485b5d3e4b4b3e7a74793da103cd3a3e40324e42da4c2b6", "0xccbb54497b232adce5e531c014c310cc4b758a5d9176e773724b7d55ff0e1f73", "0x3de630ced51a59a3a4b89f2b66455ef7d38fe1bf90508ea83f7226f698449724", "0xeb1593ebe3e66efa0ef3a93b6dcf8f1664816058dcf034003073959c679471ff"]

const word = "phone"
const WORD_HASH = "0xa26a4aa0033ce9c1a976b4b97996be5c85aedf21a307cbe89fc61a7201c4c78d"

describe("FundMe", function () {
    let cryptoMoney, mockDai, deployer
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        cryptoMoney = await ethers.getContract("CryptoMoney")
        mockDai = await ethers.getContract("ERC20Mock")
    })

    describe("constructor", function () {
        it("sets up the constructor", async () => {
            const nextBillId = await cryptoMoney.getNextBillId()
            assert.equal("1", nextBillId.toString())
            const daiContract = await cryptoMoney.getDaiContract()
            assert.equal(daiContract, mockDai.address)
            const fee = await cryptoMoney.getFeePerBill()
            assert.equal(fee.toString(), ethers.utils.parseEther("0.0001"))
        })
    })

    describe("requestBills", function () {
        it("reverts if fee is not enough", async () => {
            await expect(cryptoMoney.requestBills("10", "10")).to.be.revertedWith("CryptoMoney__FeeNotMet")
            await expect(cryptoMoney.requestBills("10", "10", {value: 1000})).to.be.revertedWith("CryptoMoney__FeeNotMet")
        })
        it("does not revert if enough eth is sent as a fee", async () => {
            await cryptoMoney.requestBills("10", "10", {value: ethers.utils.parseEther(".2")})
        })
        it("sets up request object correctly", async () => {
            await cryptoMoney.requestBills("20", "10", {value: ethers.utils.parseEther(".2")})
            const request = await cryptoMoney.getOneRequest("0")
            assert.equal(request.amountPerBill.toString(), "20")
            assert.equal(request.billCount.toString(), "10")
            assert.equal(request.isIssued, false)
            assert.equal(request.requester, deployer)
        })
        it("emits NewRequest event", async () => {
            await expect(cryptoMoney.requestBills("20", "10", {value: ethers.utils.parseEther(".2")})).to.emit(cryptoMoney, "NewRequest").withArgs("0", deployer, "20", "10");
        })
        it("increments the request id", async () => {
            await cryptoMoney.requestBills("10", "10", {value: ethers.utils.parseEther(".2")})
            const requestId = await cryptoMoney.getNextRequestId()
            assert.equal(requestId, "1")
        })
    })

    describe("issueBills", async () => {
        beforeEach(async () => {
            await cryptoMoney.requestBills("20", "10", {value: ethers.utils.parseEther(".2")})
        })
        it("reverts if called by someone who isn't the owner", async () => {
            const accounts = await ethers.getSigners()
            await expect(cryptoMoney.connect(accounts[1]).issueBills("0", CODE_HASHES)).to.be.revertedWith("Ownable: caller is not the owner")
        })
        it("makes bill objects", async () => {
            await cryptoMoney.issueBills("0", CODE_HASHES)
            let bill = await cryptoMoney.getOneBillFromBillId("0")
            assert.equal(bill.id.toString(), "1")
            assert.equal(bill.value.toString(), "20")
            assert.equal(bill.wordHash, "0x0000000000000000000000000000000000000000000000000000000000000000")
            assert.equal(bill.codeHash, "0xe59a0f0df1c0a4ab0624a10fea5c1fb7495dec2bc3b288de26330b8861d30a8c")
            assert.equal(bill.isFunded, false)
            assert.equal(bill.isRedeemed, false)
            bill = await cryptoMoney.getOneBillFromBillId("1")
            assert.equal(bill.id.toString(), "2")
        })
        it("sets the request is issued to true", async () => {
            await cryptoMoney.issueBills("0", CODE_HASHES)
            const request = await cryptoMoney.getOneRequest("0")
            assert.equal(request.isIssued, true)
        })
    })

    describe("fund", function () {
        it("rejects if no allowance", async () => {
            await cryptoMoney.requestBills("20", "10", {value: ethers.utils.parseEther(".2")})
            await cryptoMoney.issueBills("0", CODE_HASHES)
            await expect(cryptoMoney.fund("1", "20", "0xa26a4aa0033ce9c1a976b4b97996be5c85aedf21a307cbe89fc61a7201c4c78d")).to.be.revertedWith("CryptoMoney__NotApproved()")
        })
        

        beforeEach(async () => {
            await cryptoMoney.requestBills("20", "10", {value: ethers.utils.parseEther(".2")})
            await cryptoMoney.issueBills("0", CODE_HASHES)
            const tx = await mockDai.mint(deployer, "100")
            await mockDai.approve(cryptoMoney.address, "20")
            await cryptoMoney.fund("0", "20", WORD_HASH)
        })

        it("updates the word hash and is funded in the bill object", async () => {
            let bill = await cryptoMoney.getOneBillFromBillId("0")
            assert.equal(bill.wordHash.toString(), WORD_HASH)
            assert.equal(bill.isFunded, true)
        })

        it("transfer the dai", async () => {
            const balance = await mockDai.balanceOf(cryptoMoney.address)
            assert(balance.toString(), "20")
        })

        it("emits BillFunded event", async () => {
            await mockDai.approve(cryptoMoney.address, "20")
            await expect(cryptoMoney.fund("1", "20", WORD_HASH)).to.emit(cryptoMoney, "BillFunded").withArgs("1", deployer, "20")
        })
    })

    describe("verifyWord", async () => {
        it("verify word function works", async () => {
            await cryptoMoney.requestBills("20", "10", {value: ethers.utils.parseEther(".2")})
            await cryptoMoney.issueBills("0", CODE_HASHES)
            await mockDai.mint(deployer, "100")
            await mockDai.approve(cryptoMoney.address, "20")
            await cryptoMoney.fund("0", "20", WORD_HASH)
            await assert(cryptoMoney.verifyWord("0", "phone"))
        })
    })

    describe("redeem", async () => {
        beforeEach(async () => {
            await cryptoMoney.requestBills("20", "10", {value: ethers.utils.parseEther(".2")})
            await cryptoMoney.issueBills("0", CODE_HASHES)
            await mockDai.mint(deployer, "100")
            await mockDai.approve(cryptoMoney.address, "20")
            await cryptoMoney.fund("0", "20", WORD_HASH)
        })

        it("reverts if invalid code", async () => {
            await expect(cryptoMoney.redeem("0", "hello", "phone", deployer)).to.be.revertedWith("CryptoMoney__InvalidCode")
        })

        it("reverts if invalid word", async () => {
            await expect(cryptoMoney.redeem("0", "soup", "socks", deployer)).to.be.revertedWith("CryptoMoney__InvalidWord()")
        })

        it("updates the value and is redeemed in the bill object", async () => {
            await cryptoMoney.redeem("0", "soup", "phone", deployer)
            let bill = await cryptoMoney.getOneBillFromBillId("0")
            assert.equal(bill.value.toString(), "0")
            assert.equal(bill.isRedeemed, true)
        })

        it("transfer DAI", async () => {
            await cryptoMoney.redeem("0", "soup", "phone", deployer)
            const balance = await mockDai.balanceOf(deployer)
            assert(balance.toString(), "20")
        })
        it("emits Bill Redeemed event", async () => {
            await expect(cryptoMoney.redeem("0", "soup", "phone", deployer)).to.emit(cryptoMoney, "BillRedeemed")
        })
    })
})
