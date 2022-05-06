import { airdropTokens, createATA, kryptMint, ScroogeCoinMint, airdropLamps, airdropPDA, airdropProgramId, getATA } from "./createTokens";
import { Numberu64, TokenSwap, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout } from "@solana/spl-token-swap"
import * as Web3 from '@solana/web3.js'
import { getAccount, TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";
import { token_swap_state_account, swap_authority, pool_krypt_account, pool_scrooge_account, pool_mint, token_account_pool, fee_account } from "./consts";


const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);

// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret as Uint8Array);


async function deposit(){
    const sourceA = await getATA(kryptMint, wallet.publicKey)
    const sourceB = await getATA(ScroogeCoinMint, wallet.publicKey)

    const tx = new Web3.Transaction()

    // const airdropAIX = await airdropTokens(20, wallet.publicKey, sourceA, kryptMint, airdropPDA)
    // tx.add(airdropAIX)
    // const airdropBIX = await airdropTokens(20, wallet.publicKey, sourceB, ScroogeCoinMint, airdropPDA)
    // tx.add(airdropBIX)

    const depositIx = await TokenSwap.depositAllTokenTypesInstruction(
        token_swap_state_account,
        swap_authority,
        wallet.publicKey,
        sourceA,
        sourceB,
        pool_krypt_account,
        pool_scrooge_account,
        pool_mint,
        token_account_pool,
        TOKEN_SWAP_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        1e2,
        100e9,
        100e9
    )

    tx.add(depositIx)

    console.log("sending tx");
    let txid = await Web3.sendAndConfirmTransaction(connection, tx, [wallet], {
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
}

deposit()