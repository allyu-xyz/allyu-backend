# allyu-backend

This project creates a system that communities can leverage to issue their own trustless paper money backed entirely by crypto deposits. We created a proof of concept set of bills that can be filled by a set amount of DAI and given to a third party who can then verify the physical integrity of the bill and its contents on-chain.

We deployed a smart contract on Ethereum, Optimism, and Polygon that users can request new paper issuance. Once an order is set we create a new set of bills along with a secret code that's hashed into the contract and printed under a tamper-proof seal on the paper bill. At this stage, we considered utilizing Push protocol to send a notification to the user stating that their bills are on the way but there are no Goerli deployments for Push.
