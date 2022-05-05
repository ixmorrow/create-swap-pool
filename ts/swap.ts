import { airdropTokens, createATA, kryptMint, ScroogeCoinMint, airdropLamps, airdropPDA, airdropProgramId, getATA } from "./createTokens";
import { Numberu64, TokenSwap, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout } from "@solana/spl-token-swap"
import * as Web3 from '@solana/web3.js'
import { PoolConfig, CurveType } from "@project-serum/spl-token-swap"
import { getAccount, ACCOUNT_SIZE, getMint, getMinimumBalanceForRentExemptAccount, createInitializeAccountInstruction, TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";
import { token_swap_state_account, swap_authority, pool_krypt_account, pool_scrooge_account, pool_mint, token_account_pool, fee_account } from "./consts";
import { UTILS_TOKEN_PROGRAM_ID } from "./utils";
import * as borsh from "@project-serum/borsh";

import {
    Layout,
    struct,
    Structure,
    u8,
    nu64,
    blob,
    union,
  } from 'buffer-layout';

const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);

// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret as Uint8Array);


async function swap() {
    const tx = new Web3.Transaction()

    const userSource = await getATA(kryptMint, wallet.publicKey)
    const userDestination = await getATA(ScroogeCoinMint, wallet.publicKey)

    // const airdropIx = await airdropTokens(10, wallet.publicKey, userSource, kryptMint, airdropPDA)
    // tx.add(airdropIx)

    const swapIx = await swapInstruction(
        token_swap_state_account,
        swap_authority,
        wallet.publicKey,
        userSource,
        pool_krypt_account,
        pool_scrooge_account,
        userDestination,
        pool_mint,
        fee_account,
        TOKEN_SWAP_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        5,
        0.5
    )

    tx.add(swapIx)

    console.log("sending tx");
    let txid = await Web3.sendAndConfirmTransaction(connection, tx, [wallet], {
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
}
export const uint64 = (property = 'uint64') => {
    return blob(8, property);
  };

export const swapInstruction = (
    tokenSwap: Web3.PublicKey,
    authority: Web3.PublicKey,
    transferAuthority: Web3.PublicKey,
    userSource: Web3.PublicKey,
    poolSource: Web3.PublicKey,
    poolDestination: Web3.PublicKey,
    userDestination: Web3.PublicKey,
    poolMint: Web3.PublicKey,
    feeAccount: Web3.PublicKey,
    swapProgramId: Web3.PublicKey,
    tokenProgramId: Web3.PublicKey,
    amountIn: number | Numberu64,
    minimumAmountOut: number | Numberu64,
    programOwner?: Web3.PublicKey,
  ): Web3.TransactionInstruction => {
    const IX_DATA_LAYOUT = borsh.struct([
        borsh.u8("instruction"),
        borsh.u32("amountIn"),
        borsh.f64("minimumAmountOut")
    ])
  
    const keys = [
        { pubkey: tokenSwap, isSigner: false, isWritable: false },
        { pubkey: authority, isSigner: false, isWritable: false },
        { pubkey: transferAuthority, isSigner: true, isWritable: false },
        { pubkey: userSource, isSigner: false, isWritable: true },
        { pubkey: poolSource, isSigner: false, isWritable: true },
        { pubkey: poolDestination, isSigner: false, isWritable: true },
        { pubkey: userDestination, isSigner: false, isWritable: true },
        { pubkey: poolMint, isSigner: false, isWritable: true },
        { pubkey: feeAccount, isSigner: false, isWritable: true },
        { pubkey: tokenProgramId, isSigner: false, isWritable: false },
      ]
  
    const payload = {
        instruction: 1,
        amountIn: amountIn,
        minimumAmountOut: minimumAmountOut
    }
    const data = Buffer.alloc(IX_DATA_LAYOUT.span);
    IX_DATA_LAYOUT.encode(payload, data);
  
    return new Web3.TransactionInstruction({
      keys,
      programId: swapProgramId,
      data,
    });
  };

swap()