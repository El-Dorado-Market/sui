import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const mnemonic = process.env.MNEMONIC;
if (!mnemonic) {
	throw new Error("MNEMONIC environment variable not set");
}
const ptbBase64 = process.env.PTB_BASE64;
if (!ptbBase64) {
	throw new Error("PTB_BASE64 environment variable not set");
}
const sender = process.env.SENDER;
if (!sender) {
	throw new Error("SENDER environment variable not set");
}

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
const gasPrice = await client.getReferenceGasPrice();
const estimatedGasBudget = 10000000; // 10M gas units as a conservative estimate

const ptbBytes = Buffer.from(ptbBase64, "hex");
const transaction = Transaction.fromKind(new Uint8Array(ptbBytes)); // ptb_bytes are the Programmable Transaction Bytes returned from the create order response
transaction.setSender(sender);
transaction.setGasPrice(gasPrice);
transaction.setGasBudget(estimatedGasBudget);

const signer = Ed25519Keypair.deriveKeypair(mnemonic);

const result = await client.signAndExecuteTransaction({
	signer: signer,
	transaction: transaction,
	options: { showEffects: true },
});

console.log(JSON.stringify(result, null, 2));
