import React, { useCallback, useEffect, useState } from 'react'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import Row, { RowBetween } from '../Row'
import { TYPE, CloseIcon, ExternalLink } from '../../theme'
import { ButtonPrimary } from '../Button'
import { useActiveWeb3React } from '../../hooks'
import useUnclaimedSWPRBalance from '../../hooks/swpr/useUnclaimedSWPRBalance'
import { useCloseModals, useShowClaimPopup, useToggleModal } from '../../state/application/hooks'
import { transparentize } from 'polished'
import TransactionConfirmationModal, { TransactionErrorContent } from '../TransactionConfirmationModal'
import { ChainId, TokenAmount } from 'dxswap-sdk'
import useClaimCallback from '../../hooks/swpr/useClaimCallback'
import useIsClaimAvailable from '../../hooks/swpr/useIsClaimAvailable'
import { ExternalLink as ExternalLinkIcon } from 'react-feather'
import { InjectedConnector } from '@web3-react/injected-connector'
import { switchOrAddNetwork } from '../../utils'
import { NETWORK_DETAIL } from '../../constants'
import { ApplicationModal } from '../../state/application/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useNativeCurrencyBalance } from '../../state/wallet/hooks'
import { useClaimTxConfirmedUpdater } from '../../state/claim/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
`

const UpperAutoColumn = styled(AutoColumn)`
  padding: 24px;
  background-color: ${({ theme }) => transparentize(0.45, theme.bg2)};
  backdrop-filter: blur(12px);
`

const BottomAutoColumn = styled(AutoColumn)`
  width: 100%;
  border: 1px solid ${props => props.theme.bg3};
  border-radius: 8px;
  padding: 26px;
`

const StyledClaimButton = styled(ButtonPrimary)`
  color: ${props => props.theme.white} !important;
  background: linear-gradient(90deg, ${props => props.theme.primary1} -24.77%, #fb52a1 186.93%);
  :disabled {
    opacity: 0.5;
  }
`

const NetworkWarning = styled.div`
  width: 100%;
  background-color: rgba(242, 153, 74, 0.25);
  border-radius: 12px;
  padding: 20px;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  margin-bottom: 12px;
  text-align: center;
  color: #f2994a;
`

const NativeCurrencyWarning = styled.div`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  letter-spacing: 0em;
  margin-bottom: 12px;
  color: ${props => props.theme.red1};
`

const SpacedExternalLinkIcon = styled(ExternalLinkIcon)`
  margin-left: 6px;
`

export default function ClaimModal({
  onDismiss,
  swprBalance
}: {
  onDismiss: () => void
  swprBalance: TokenAmount | undefined
}) {
  const { account, chainId, connector } = useActiveWeb3React()

  const [attempting, setAttempting] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [correctNetwork, setCorrectNetwork] = useState(false)
  const open = useShowClaimPopup()

  const addTransaction = useTransactionAdder()
  const nativeCurrencyBalance = useNativeCurrencyBalance()
  const claimCallback = useClaimCallback(account || undefined)
  const updateClaimTxConfirmed = useClaimTxConfirmedUpdater()
  const { unclaimedBalance } = useUnclaimedSWPRBalance(account || undefined)
  const { available: availableClaim } = useIsClaimAvailable(account || undefined)
  const closeModals = useCloseModals()
  const toggleWalletConnectionModal = useToggleModal(ApplicationModal.WALLET_SWITCHER)

  useEffect(() => {
    setCorrectNetwork(chainId === ChainId.ARBITRUM_ONE)
  }, [chainId])

  const onClaim = useCallback(() => {
    setAttempting(true)
    claimCallback()
      .then(transaction => {
        setHash(transaction.hash)
        addTransaction(transaction, {
          summary: `Claim ${unclaimedBalance?.toFixed(3)} SWPR`
        })
        transaction.wait().then(() => {
          updateClaimTxConfirmed(true)
        })
      })
      .catch(error => {
        setError(true)
        console.log(error)
      })
      .finally(() => {
        setAttempting(false)
      })
  }, [addTransaction, claimCallback, unclaimedBalance, updateClaimTxConfirmed])

  const wrappedOnDismiss = useCallback(() => {
    setAttempting(false)
    setError(false)
    setHash(undefined)
    onDismiss()
  }, [onDismiss])

  const onSwitchToArbitrum = useCallback(() => {
    if (connector instanceof InjectedConnector)
      switchOrAddNetwork(NETWORK_DETAIL[ChainId.ARBITRUM_ONE], account || undefined)
  }, [account, connector])

  const onConnectWallet = useCallback(() => {
    closeModals()
    toggleWalletConnectionModal()
  }, [closeModals, toggleWalletConnectionModal])

  const onClick = useCallback(() => {
    if (!account) {
      onConnectWallet()
    } else if (!correctNetwork && connector instanceof InjectedConnector) {
      onSwitchToArbitrum()
    } else if (availableClaim) {
      onClaim()
    }
  }, [account, availableClaim, connector, correctNetwork, onClaim, onConnectWallet, onSwitchToArbitrum])

  const content = () => {
    if (error) {
      return <TransactionErrorContent onDismiss={wrappedOnDismiss} message="The claim wasn't successful" />
    } else
      return (
        <ContentWrapper gap="lg">
          <UpperAutoColumn gap="16px">
            <RowBetween>
              <TYPE.white fontWeight={500} fontSize="20px" lineHeight="24px" color="text4">
                Your SWPR details
              </TYPE.white>
              <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} />
            </RowBetween>
            <TYPE.white fontWeight={700} fontSize={36}>
              {swprBalance?.toFixed(3) || '0.000'}
            </TYPE.white>
            <TYPE.white fontWeight={600} fontSize="11px" lineHeight="13px" letterSpacing="0.08em" color="text4">
              TOTAL SWPR ON CURRENT NETWORK
            </TYPE.white>
          </UpperAutoColumn>
          <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0' }} justify="center">
            {availableClaim && chainId !== ChainId.ARBITRUM_ONE && (
              <NetworkWarning>
                Receive your SWPR airdrop on Arbitrum One. Please switch network to claim.
              </NetworkWarning>
            )}
            <BottomAutoColumn gap="8px">
              <TYPE.small fontWeight={600} fontSize="11px" lineHeight="13px" letterSpacing="0.08em" color="text5">
                UNCLAIMED SWPR
              </TYPE.small>
              <TYPE.white fontWeight={700} fontSize="22px" lineHeight="27px">
                {unclaimedBalance?.toFixed(3) || '0'} SWPR
              </TYPE.white>
              {chainId === ChainId.ARBITRUM_ONE && nativeCurrencyBalance?.equalTo('0') && (
                <>
                  <NativeCurrencyWarning>
                    You have no Arbitrum ETH to claim your SWPR. Please make sure to transfer enough ETH to Arbitrum
                    using the official bridge in order to complete the transaction.
                  </NativeCurrencyWarning>
                  <ButtonPrimary
                    as="a"
                    href="http://bridge.arbitrum.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    padding="16px 16px"
                  >
                    Arbitrum bridge <SpacedExternalLinkIcon size="12px" />
                  </ButtonPrimary>
                </>
              )}
              <StyledClaimButton
                disabled={
                  (!!account && !availableClaim) ||
                  (chainId === ChainId.ARBITRUM_ONE && nativeCurrencyBalance?.equalTo('0'))
                }
                padding="16px 16px"
                width="100%"
                mt="1rem"
                onClick={onClick}
              >
                {!account ? 'Connect wallet' : correctNetwork ? 'Claim SWPR' : 'Switch to Arbitrum One'}
              </StyledClaimButton>
            </BottomAutoColumn>
            <ExternalLink href="https://daotalk.org/t/swpr-token-and-swapr-guild/3118/">
              <Row justifyContent="center" width="100%">
                <TYPE.small fontSize="13px" fontWeight="400px" lineHeight="16px">
                  Read about the airdrop
                </TYPE.small>
                <ExternalLinkIcon style={{ marginLeft: 3 }} size="12px" />
              </Row>
            </ExternalLink>
          </AutoColumn>
        </ContentWrapper>
      )
  }

  return (
    <TransactionConfirmationModal
      isOpen={open}
      onDismiss={wrappedOnDismiss}
      attemptingTxn={attempting}
      hash={hash}
      content={content}
      pendingText={`Claiming ${unclaimedBalance?.toFixed(3)} SWPR`}
    />
  )
}