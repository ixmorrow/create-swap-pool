import { airdropTokens, createATA, kryptMint, ScroogeCoinMint, airdropLamps, airdropPDA, airdropProgramId, getATA } from "./createTokens";
import { Numberu64, TokenSwap, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout } from "@solana/spl-token-swap"
import * as Web3 from '@solana/web3.js'
import { Buffer } from 'buffer';
import * as borsh from "@project-serum/borsh";
import { PoolConfig, CurveType } from "@project-serum/spl-token-swap"
import { createMint, ACCOUNT_SIZE, getMinimumBalanceForRentExemptAccount, MintLayout } from "@solana/spl-token";
import {
    Layout,
    struct,
    Structure,
    u8,
    nu64,
    blob,
    union,
  } from 'buffer-layout';

  export const PROGRAM_ID = new Web3.PublicKey(
    'SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8',
  );

  export const LATEST_VERSION = 2;

  export const UTILS_TOKEN_PROGRAM_ID = new Web3.PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  );
  
  export function getProgramVersion(programId: Web3.PublicKey): number {
    return PROGRAM_ID.equals(programId) ? LATEST_VERSION : 1;
    }


export const createInitSwapInstruction = (
    tokenSwapAccount: Web3.PublicKey,
    authority: Web3.PublicKey,
    tokenAccountA: Web3.PublicKey,
    tokenAccountB: Web3.PublicKey,
    tokenPool: Web3.PublicKey,
    feeAccount: Web3.PublicKey,
    tokenAccountPool: Web3.PublicKey,
    tokenProgramId: Web3.PublicKey,
    swapProgramId: Web3.PublicKey,
    nonce: number,
    config: PoolConfig,
  ): Web3.TransactionInstruction => {
    const keys = [
      { pubkey: tokenSwapAccount, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: false, isWritable: false },
      { pubkey: tokenAccountA, isSigner: false, isWritable: false },
      { pubkey: tokenAccountB, isSigner: false, isWritable: false },
      { pubkey: tokenPool, isSigner: false, isWritable: true },
      { pubkey: feeAccount, isSigner: false, isWritable: false },
      { pubkey: tokenAccountPool, isSigner: false, isWritable: true },
      { pubkey: tokenProgramId, isSigner: false, isWritable: false },
    ];
  
    let data = Buffer.alloc(1024);
    if (getProgramVersion(swapProgramId) === LATEST_VERSION) {
      const commandDataLayout = getCreateInitSwapInstructionV2Layout(config);
      const { fees, ...rest } = config;
  
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 0, // InitializeSwap instruction
          nonce,
          ...fees,
          ...rest,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    } else {
      const commandDataLayout = struct([
        u8('instruction'),
        u8('nonce'),
        u8('curveType'),
        nu64('tradeFeeNumerator'),
        nu64('tradeFeeDenominator'),
        nu64('ownerTradeFeeNumerator'),
        nu64('ownerTradeFeeDenominator'),
        nu64('ownerWithdrawFeeNumerator'),
        nu64('ownerWithdrawFeeDenominator'),
        blob(16, 'padding'),
      ]);
  
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 0, // InitializeSwap instruction
          nonce,
          curveType: config.curveType,
          tradeFeeNumerator: config.fees.tradeFeeNumerator,
          tradeFeeDenominator: config.fees.tradeFeeDenominator,
          ownerTradeFeeNumerator: config.fees.ownerTradeFeeNumerator,
          ownerTradeFeeDenominator: config.fees.ownerTradeFeeDenominator,
          ownerWithdrawFeeNumerator: config.fees.ownerWithdrawFeeNumerator,
          ownerWithdrawFeeDenominator: config.fees.ownerWithdrawFeeDenominator,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
  
    return new Web3.TransactionInstruction({
      keys,
      programId: swapProgramId,
      data,
    });
  };

  export function getCreateInitSwapInstructionV2Layout(config: PoolConfig): Structure {
    const fields = [
    u8('instruction'),
    u8('nonce'),
    nu64('tradeFeeNumerator'),
    nu64('tradeFeeDenominator'),
    nu64('ownerTradeFeeNumerator'),
    nu64('ownerTradeFeeDenominator'),
    nu64('ownerWithdrawFeeNumerator'),
    nu64('ownerWithdrawFeeDenominator'),
    nu64('hostFeeNumerator'),
    nu64('hostFeeDenominator'),
    u8('curveType'),
  ] as any[];

  if (config.curveType === CurveType.ConstantProductWithOffset) {
    fields.push(nu64('token_b_offset'));
    fields.push(blob(24, 'padding'));
  } else if (config.curveType === CurveType.ConstantPrice) {
    fields.push(nu64('token_b_price'));
    fields.push(blob(24, 'padding'));
  } else {
    fields.push(blob(32, 'padding'));
  }

  return struct(fields);
}