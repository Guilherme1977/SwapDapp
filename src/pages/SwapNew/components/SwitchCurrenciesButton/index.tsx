import styled, { keyframes } from 'styled-components'

import { ReactComponent as TwoArrowsSVG } from '../../../../assets/images/swap-icon.svg'
import { ReactComponent as DownArrowSVG } from '../../../../assets/swapbox/swap-arrow.svg'

type SwitchCurrenciesButtonProps = {
  loading: boolean
  onClick: () => void
}

export function SwitchCurrenciesButton({ loading, onClick }: SwitchCurrenciesButtonProps) {
  return <StyledButton onClick={onClick}>{loading ? <RotatingArrows /> : <DownArrowSVG />}</StyledButton>
}

// TODO: PULL OUT THE CONSTANTS

const StyledButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 84px;
  z-index: 1;
  transform: translateX(-50%);
  background: #06060a;
  border-radius: 12px;
  border: 1px solid #0c0c14;
  box-shadow: 0px 0px 42px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(11px);
  cursor: pointer;
`

const Rotation = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const RotatingArrows = styled(TwoArrowsSVG)`
  animation: ${Rotation} 2s linear infinite;
`
