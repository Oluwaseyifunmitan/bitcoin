const bitcoin = require('bitcoinjs-lib');


function stringToHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}


const preImage = "Btrust Builders";


const preImageHex = stringToHex(preImage);


const redeemScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_SHA256, 
    Buffer.from(preImageHex, 'hex'), 
    bitcoin.opcodes.OP_EQUAL 
]);


const redeemScriptHex = redeemScript.toString('hex');

console.log("Redeem Script (hex):", redeemScriptHex);


const redeemScripts= Buffer.from(redeemScriptHex, 'hex');


const p2shAddress = bitcoin.payments.p2sh({ redeem: { output: redeemScripts } }).address;

console.log("P2SH Address:", p2shAddress);

// const bitcoin = require("bitcoinjs-lib");

const network = bitcoin.networks.testnet;

const senderPrivateKey = "cRzPN1kQfDgGttGWtCrEJYS4xsSng8C853oxVxt34uDS6";
const senderAddress = "mjasBHnW6xMxURV48YMzMfqPygbGB3rjGa";
const amountToSend = 10000; // in satoshis
const fee = 1000; // in satoshis

// const p2shAddress = "38LNKapKUo35gKm8oJpoKyNgLX5gcVjivs";

// Create a new transaction builder
const txb = new bitcoin.Psbt({ network });

// Add the input (UTXO) to the PSBT
txb.addInput({
  hash: "d713b2f8644b2e4814322ab9fe78d062945f727888eb598ae784a249ce82ff55",
  index: 0,
});

// Add the output to send bitcoins to the P2SH address
txb.addOutput({
  address: p2shAddress,
  value: amountToSend,
});

// Add the change output (sending remaining funds back to sender)
const keyPair = bitcoin.ECPair.fromWIF(senderPrivateKey, network);
const pubKey = keyPair.publicKey;
const pubKeyHash = bitcoin.crypto.hash160(pubKey);

// Define the redeem script
const newredeemScript= Buffer.from(redeemScriptHex, 'hex');

// const redeemScript = Buffer.from("a80f427472757374204275696c6465727387", "hex");

// Add the input for spending from the P2SH address
txb.addInput({
  hash: txb.data.inputs[0].hash,
  index: 0,
  witnessUtxo: { script: newredeemScript, value: amountToSend },
  newredeemScript,
});

// Sign the PSBT
txb.signInput(0, keyPair);

// Finalize the PSBT
txb.finalizeAllInputs();

// Extract the fully signed transaction
const txHex = txb.extractTransaction().toHex();

console.log("Constructed Transaction Hex:", txHex);
