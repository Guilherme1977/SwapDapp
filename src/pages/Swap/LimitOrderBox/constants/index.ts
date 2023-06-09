import { ChainId } from '@swapr/sdk'
/**
 * List of supported chainId
 * At the moment, only Ethereum and Gnosis are supported as CoW API is the
 */
export const supportedChainIdList = [ChainId.MAINNET, ChainId.GNOSIS]

export const invalidChars = ['-', '+', 'e']

export const GET_QUOTE_EXPIRY_MINUTES = 20

export const SELL_LIMIT_PRICE_PERCENTAGE = 1.01

export const BUY_LIMIT_PRICE_PERCENTAGE = 0.99
