"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createTokens_1 = require("./createTokens");
const spl_token_swap_1 = require("@solana/spl-token-swap");
const Web3 = __importStar(require("@solana/web3.js"));
const spl_token_1 = require("@solana/spl-token");
const consts_1 = require("./consts");
const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);
// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret);
function deposit() {
    return __awaiter(this, void 0, void 0, function* () {
        const sourceA = yield (0, createTokens_1.getATA)(createTokens_1.kryptMint, wallet.publicKey);
        const sourceB = yield (0, createTokens_1.getATA)(createTokens_1.ScroogeCoinMint, wallet.publicKey);
        const tx = new Web3.Transaction();
        const airdropAIX = yield (0, createTokens_1.airdropTokens)(20e9, wallet.publicKey, sourceA, createTokens_1.kryptMint, createTokens_1.airdropPDA);
        tx.add(airdropAIX);
        const airdropBIX = yield (0, createTokens_1.airdropTokens)(20e9, wallet.publicKey, sourceB, createTokens_1.ScroogeCoinMint, createTokens_1.airdropPDA);
        tx.add(airdropBIX);
        const depositIx = yield spl_token_swap_1.TokenSwap.depositAllTokenTypesInstruction(consts_1.token_swap_state_account, consts_1.swap_authority, wallet.publicKey, sourceA, sourceB, consts_1.pool_krypt_account, consts_1.pool_scrooge_account, consts_1.pool_mint, consts_1.token_account_pool, spl_token_swap_1.TOKEN_SWAP_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, 5e9, 10e9, 10e9);
        tx.add(depositIx);
        console.log("sending tx");
        let txid = yield Web3.sendAndConfirmTransaction(connection, tx, [wallet], {
            skipPreflight: true,
            preflightCommitment: "confirmed",
        });
        console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    });
}
deposit();
