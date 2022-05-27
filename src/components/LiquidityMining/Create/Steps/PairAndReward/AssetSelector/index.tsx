import { Token, TokenAmount } from '@swapr/sdk'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CloseIcon, TYPE } from '../../../../../../theme'

import { Box, Flex } from 'rebass'
import { SmoothGradientCard } from '../../../../styleds'
import { unwrappedToken } from '../../../../../../utils/wrappedCurrency'
import { Actions, ActionType, CampaignType } from '../../../../../../pages/LiquidityMining/Create'

import NumericalInput from '../../../../../Input/NumericalInput'
import { ButtonPrimary } from '../../../../../Button'
import { useActiveWeb3React } from '../../../../../../hooks'
import { useTokenBalance } from '../../../../../../state/wallet/hooks'
import { useStakingRewardsDistributionFactoryContract } from '../../../../../../hooks/useContract'
import { ApprovalState, useApproveCallback } from '../../../../../../hooks/useApproveCallback'
import { AssetLogo } from './AssetLogo'

const StyledNumericalInput = styled(NumericalInput)<{ value: string }>`
  border: 8px solid;
  border-radius: 8px;
  border: none;
  width: 100%;
  height: 33px;
  font-weight: 400;
  font-size: ${props => (props.value.length > 18 ? '8' : props.value.length > 11 ? '12' : '14')}px;
  line-height: 16px;
  text-transform: uppercase;
  padding-left: 8px;
  padding-right: 8px;
  background-color: ${props => props.theme.dark1};
`

const RelativeContainer = styled.div<{ disabled?: boolean }>`
  position: relative;
  transition: opacity 0.3s ease;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  margin-bottom: 8px;
`
const RelativeDismiss = styled(CloseIcon)`
  position: absolute;
  padding: 0;
  top: -18px;
  right: 7px;

  svg {
    stroke: #464366;
  }
`

interface AssetSelectorProps {
  currency0?: Token | null
  currency1?: Token | null
  campaingType: CampaignType
  customAssetTitle?: React.HTMLProps<HTMLDivElement>['children']
  amount?: TokenAmount
  index?: number
  isReward?: boolean
  handleUserInput?: (value: string) => void
  onResetCurrency?: () => void
  onClick: (event: React.MouseEvent<HTMLElement>) => void
  rawAmount?: string
  setRewardsObject?: React.Dispatch<Actions>
}

export default function AssetSelector({
  customAssetTitle,
  currency0,
  currency1,
  campaingType,
  onClick,
  amount,
  onResetCurrency,
  handleUserInput,
  index,
  isReward = false,
  rawAmount,
  setRewardsObject,
}: AssetSelectorProps) {
  const { account } = useActiveWeb3React()
  const userBalance = useTokenBalance(account || undefined, currency0 !== null ? currency0 : undefined)

  const [assetTitle, setAssetTitle] = useState<string | null>(null)
  const [tokenName, setTokenName] = useState<string | undefined>(undefined)

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)

  const rewardMemo = useMemo(() => (currency0 && amount ? amount : undefined), [currency0, amount])

  const stakingRewardsDistributionFactoryContract = useStakingRewardsDistributionFactoryContract()
  const [approvalState, approveCallback] = useApproveCallback(
    rewardMemo,
    stakingRewardsDistributionFactoryContract?.address
  )

  const getApproveButtonMessage = useMemo(() => {
    if (!account) {
      return 'Connect your wallet'
    } else if (userBalance && rewardMemo && rewardMemo.greaterThan('0') && userBalance.lessThan(rewardMemo)) {
      return 'Insufficient balance'
    } else if (approvalState === ApprovalState.APPROVED && rewardMemo && rewardMemo.greaterThan('0')) {
      return 'Approved'
    } else {
      return 'Approve'
    }
  }, [approvalState, account, userBalance, rewardMemo])

  useEffect(() => {
    if (setRewardsObject && rewardMemo && userBalance) {
      setRewardsObject({
        type: ActionType.APPROVALS_CHANGE,
        payload: {
          index: index,
          approval:
            approvalState === ApprovalState.PENDING
              ? ApprovalState.NOT_APPROVED
              : rewardMemo.greaterThan('0') &&
                userBalance.greaterThan(rewardMemo) &&
                approvalState === ApprovalState.APPROVED
              ? ApprovalState.APPROVED
              : (rewardMemo.greaterThan('0') && userBalance?.lessThan(rewardMemo)) ||
                approvalState === ApprovalState.NOT_APPROVED
              ? ApprovalState.NOT_APPROVED
              : ApprovalState.UNKNOWN,
        },
      })
    }

    setAreButtonsDisabled(!!(!account || !rewardMemo || (userBalance && userBalance.lessThan(rewardMemo))))
  }, [account, rewardMemo, userBalance, setRewardsObject, index, approvalState])

  useEffect(() => {
    if (currency0 && currency1) {
      setTokenName('LP PAIR')
      setAssetTitle(`${unwrappedToken(currency0)?.symbol}/${unwrappedToken(currency1)?.symbol}`)
    } else if (currency0) {
      setTokenName(unwrappedToken(currency0)?.name)
      setAssetTitle(unwrappedToken(currency0)?.symbol || null)
    } else {
      setTokenName(undefined)
      setAssetTitle(`SELECT ${campaingType === CampaignType.TOKEN ? 'TOKEN' : 'PAIR'}`)
    }
  }, [currency0, currency1, campaingType])

  const handleDismiss = () => {
    setAssetTitle(null)
    if (onResetCurrency) onResetCurrency()
    setTokenName(undefined)
  }
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isReward && currency0) event.stopPropagation()
    else onClick(event)
  }

  return (
    <Flex flexDirection={'column'} key={index}>
      <SmoothGradientCard
        isToken={true}
        active={currency0 !== undefined}
        paddingBottom={'34px !important'}
        width={'162px'}
        flexDirection={'column-reverse'}
        height={isReward ? '192px' : '150px'}
        onClick={handleClick}
      >
        {isReward && (
          <RelativeDismiss
            onClick={event => {
              event.stopPropagation()
              if (isReward) handleDismiss()
            }}
          />
        )}

        <Flex width="100%" justifyContent="center" alignSelf="end">
          <AssetLogo campaingType={campaingType} currency0={currency0} currency1={currency1} />
          <Flex flexDirection={'column'}>
            {isReward && currency0 && handleUserInput ? (
              <RelativeContainer>
                <StyledNumericalInput value={rawAmount ? rawAmount : ''} onUserInput={handleUserInput} />
              </RelativeContainer>
            ) : (
              //deleted data-testid={title.toLocaleLowerCase().replace(' ', '-') + '-select'}
              <TYPE.largeHeader marginBottom={'4px'} lineHeight="22px" color="lightPurple" fontSize={13}>
                {customAssetTitle && !tokenName ? customAssetTitle : assetTitle}
              </TYPE.largeHeader>
            )}
            {tokenName && (
              <TYPE.small color="purple3" fontSize={10} fontWeight="600" lineHeight="12px">
                {tokenName}
                {isReward && (
                  <span style={{ color: 'white' }}>
                    {tokenName.length <= 21 ? (
                      <>
                        <br></br>
                        {assetTitle}
                      </>
                    ) : (
                      `-${assetTitle}`
                    )}
                  </span>
                )}
              </TYPE.small>
            )}
          </Flex>
        </Flex>
      </SmoothGradientCard>
      {isReward && (
        <Box>
          <ButtonPrimary
            height={'32px'}
            marginTop="16px"
            width={'160px'}
            disabled={areButtonsDisabled || approvalState !== ApprovalState.NOT_APPROVED}
            onClick={approveCallback}
          >
            {getApproveButtonMessage}
          </ButtonPrimary>
        </Box>
      )}
    </Flex>
  )
}
