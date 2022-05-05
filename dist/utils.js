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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreateInitSwapInstructionV2Layout = exports.createInitSwapInstruction = exports.getProgramVersion = exports.UTILS_TOKEN_PROGRAM_ID = exports.LATEST_VERSION = exports.PROGRAM_ID = void 0;
const Web3 = __importStar(require("@solana/web3.js"));
const buffer_1 = require("buffer");
const spl_token_swap_1 = require("@project-serum/spl-token-swap");
const buffer_layout_1 = require("buffer-layout");
exports.PROGRAM_ID = new Web3.PublicKey('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8');
exports.LATEST_VERSION = 2;
exports.UTILS_TOKEN_PROGRAM_ID = new Web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
function getProgramVersion(programId) {
    return exports.PROGRAM_ID.equals(programId) ? exports.LATEST_VERSION : 1;
}
exports.getProgramVersion = getProgramVersion;
const createInitSwapInstruction = (tokenSwapAccount, authority, tokenAccountA, tokenAccountB, tokenPool, feeAccount, tokenAccountPool, tokenProgramId, swapProgramId, nonce, config) => {
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
    let data = buffer_1.Buffer.alloc(1024);
    if (getProgramVersion(swapProgramId) === exports.LATEST_VERSION) {
        const commandDataLayout = getCreateInitSwapInstructionV2Layout(config);
        const { fees } = config, rest = __rest(config, ["fees"]);
        const encodeLength = commandDataLayout.encode(Object.assign(Object.assign({ instruction: 0, // InitializeSwap instruction
            nonce }, fees), rest), data);
        data = data.slice(0, encodeLength);
    }
    else {
        const commandDataLayout = (0, buffer_layout_1.struct)([
            (0, buffer_layout_1.u8)('instruction'),
            (0, buffer_layout_1.u8)('nonce'),
            (0, buffer_layout_1.u8)('curveType'),
            (0, buffer_layout_1.nu64)('tradeFeeNumerator'),
            (0, buffer_layout_1.nu64)('tradeFeeDenominator'),
            (0, buffer_layout_1.nu64)('ownerTradeFeeNumerator'),
            (0, buffer_layout_1.nu64)('ownerTradeFeeDenominator'),
            (0, buffer_layout_1.nu64)('ownerWithdrawFeeNumerator'),
            (0, buffer_layout_1.nu64)('ownerWithdrawFeeDenominator'),
            (0, buffer_layout_1.blob)(16, 'padding'),
        ]);
        const encodeLength = commandDataLayout.encode({
            instruction: 0,
            nonce,
            curveType: config.curveType,
            tradeFeeNumerator: config.fees.tradeFeeNumerator,
            tradeFeeDenominator: config.fees.tradeFeeDenominator,
            ownerTradeFeeNumerator: config.fees.ownerTradeFeeNumerator,
            ownerTradeFeeDenominator: config.fees.ownerTradeFeeDenominator,
            ownerWithdrawFeeNumerator: config.fees.ownerWithdrawFeeNumerator,
            ownerWithdrawFeeDenominator: config.fees.ownerWithdrawFeeDenominator,
        }, data);
        data = data.slice(0, encodeLength);
    }
    return new Web3.TransactionInstruction({
        keys,
        programId: swapProgramId,
        data,
    });
};
exports.createInitSwapInstruction = createInitSwapInstruction;
function getCreateInitSwapInstructionV2Layout(config) {
    const fields = [
        (0, buffer_layout_1.u8)('instruction'),
        (0, buffer_layout_1.u8)('nonce'),
        (0, buffer_layout_1.nu64)('tradeFeeNumerator'),
        (0, buffer_layout_1.nu64)('tradeFeeDenominator'),
        (0, buffer_layout_1.nu64)('ownerTradeFeeNumerator'),
        (0, buffer_layout_1.nu64)('ownerTradeFeeDenominator'),
        (0, buffer_layout_1.nu64)('ownerWithdrawFeeNumerator'),
        (0, buffer_layout_1.nu64)('ownerWithdrawFeeDenominator'),
        (0, buffer_layout_1.nu64)('hostFeeNumerator'),
        (0, buffer_layout_1.nu64)('hostFeeDenominator'),
        (0, buffer_layout_1.u8)('curveType'),
    ];
    if (config.curveType === spl_token_swap_1.CurveType.ConstantProductWithOffset) {
        fields.push((0, buffer_layout_1.nu64)('token_b_offset'));
        fields.push((0, buffer_layout_1.blob)(24, 'padding'));
    }
    else if (config.curveType === spl_token_swap_1.CurveType.ConstantPrice) {
        fields.push((0, buffer_layout_1.nu64)('token_b_price'));
        fields.push((0, buffer_layout_1.blob)(24, 'padding'));
    }
    else {
        fields.push((0, buffer_layout_1.blob)(32, 'padding'));
    }
    return (0, buffer_layout_1.struct)(fields);
}
exports.getCreateInitSwapInstructionV2Layout = getCreateInitSwapInstructionV2Layout;
