const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    try {
        console.log("Verifying Contract!")
        run("verify:verify", {
            address: contractAddress,
            constructorArgs: args,
        })
    } catch (e) {
        if (e.message.ToLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
    console.log("Contract Verified!!!!")
    console.log("------------------------------------------")
}

module.exports = verify
