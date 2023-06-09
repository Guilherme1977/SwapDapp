import { ChainId } from '@swapr/sdk'

import { getNetworkInfo } from '../../utils/networksList'

export enum BridgeTab {
  BRIDGE = 'bridge',
  COLLECT = 'collect',
  HISTORY = 'history',
  BRIDGE_SWAP = 'bridge swap',
}

export const isNetworkDisabled = (optionChainId: ChainId, selectedNetworkChainId: ChainId) => {
  const { tag } = optionChainId ? getNetworkInfo(optionChainId) : { tag: undefined }
  return selectedNetworkChainId === optionChainId || tag === 'coming soon'
}
