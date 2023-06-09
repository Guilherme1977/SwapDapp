import { MenuBar } from '../../../pages/MenuBar'
import { SwapPage } from '../../../pages/SwapPage'
import { TokenMenu } from '../../../pages/TokenMenu'
import { TransactionHelper } from '../../../utils/TransactionHelper'

describe('Swap page smoke tests', () => {
  beforeEach(() => {
    SwapPage.visitSwapPage()
    TransactionHelper.waitForTokenLists()
  })
  it('Should display swap box with 2 inputs and 2 currency selectors [TC-20]', () => {
    SwapPage.getSwapBox().should('be.visible')
    SwapPage.getCurrencySelectors().should('have.length', 2)
    SwapPage.getCurrencySelectors().first().should('contain.text', 'ETH')
    SwapPage.getCurrencySelectors().last().should('contain.text', 'DAI')
  })
  it('Should display token menu after clicking on to token [TC-20]', () => {
    SwapPage.openTokenToSwapMenu()
    TokenMenu.getPicker().should('be.visible')
  })
  it('Should type in numbers into FROM input [TC-21]', () => {
    SwapPage.typeValueFrom('100.32')
    SwapPage.getFromInput().should('contain.value', '100.32')
  })
  it('Should not allow to type not numbers into FROM input [TC-22]', () => {
    SwapPage.typeValueFrom('!#$%^&*(*)_qewruip')
    SwapPage.getFromInput().should('have.value', '')
  })
  it('Should type in numbers into TO input [TC-23]', () => {
    SwapPage.typeValueTo('100.32')
    SwapPage.getToInput().should('contain.value', '100.32')
  })
  it('Should not allow to type not numbers into TO input [TC-24]', () => {
    SwapPage.typeValueTo('!#$%^&*(*)_qewruip')
    SwapPage.getToInput().should('have.value', '')
  })
  it('Should allow to select wrapped eth token as TO input [TC-25]', () => {
    SwapPage.openTokenToSwapMenu().searchAndChooseToken('weth')
    SwapPage.getCurrencySelectors().last().focus().should('contain.text', 'WETH')
  })
  it('Should allow to select wrapped eth token as FROM input [TC-26]', () => {
    SwapPage.getCurrencySelectors().first().click()
    TokenMenu.searchAndChooseToken('weth')
    SwapPage.getCurrencySelectors().first().focus().should('contain.text', 'WETH')
  })
  it('Should allow to select other token as TO input [TC-27]', () => {
    SwapPage.openTokenToSwapMenu().searchAndChooseToken('usdc')
    SwapPage.getCurrencySelectors().last().should('contain.text', 'USDC')
  })
  it('Should allow to select other token as FROM input [TC-28]', () => {
    SwapPage.getCurrencySelectors().first().click()
    TokenMenu.searchAndChooseToken('usdc')
    SwapPage.getCurrencySelectors().first().should('contain.text', 'USDC')
  })
  it('Should switch the currency selectors when choosing the same value [TC-29]', () => {
    cy.wait(1000)
    SwapPage.openTokenToSwapMenu().searchAndChooseToken('weth')
    SwapPage.getCurrencySelectors().first().click({ force: true })
    TokenMenu.searchAndChooseToken('weth')
    SwapPage.getCurrencySelectors().first().should('contain.text', 'WETH')
    SwapPage.getCurrencySelectors().last().should('contain.text', 'ETH')
  })
  it('Should switch token places when using switch button [TC-30]', () => {
    SwapPage.openTokenToSwapMenu().searchAndChooseToken('weth')
    SwapPage.switchTokens()
    SwapPage.getCurrencySelectors().first().should('contain.text', 'WETH')
    SwapPage.getCurrencySelectors().last().should('contain.text', 'ETH')
  })
  it('Should connect button which opens network switcher be displayed instead of confirm button [TC-31]', () => {
    SwapPage.getConfirmButton().should('be.visible').should('contain.text', 'Connect wallet')
    SwapPage.getConfirmButton().click({ force: true })
    SwapPage.getWalletConnectList().scrollIntoView().should('be.visible')
  })
  it('Should display connect button when transaction data is filled [TC-32]', () => {
    SwapPage.openTokenToSwapMenu().searchAndChooseToken('usdc')
    SwapPage.typeValueFrom('100')
    SwapPage.getConfirmButton().should('contain.text', 'Connect wallet')
    SwapPage.getConfirmButton().click({ force: true })

    SwapPage.getWalletConnectList().scrollIntoView().should('be.visible')
    MenuBar.getSwap().click()
  })
  it('Should calculate output based on FROM and display it in TO section [TC-33]', () => {
    SwapPage.openTokenToSwapMenu().searchAndChooseToken('usdc')
    SwapPage.typeValueFrom('100')
    SwapPage.getToInput().should('not.have.value', undefined)
  })
  it('Should calculate output based on TO and display it in FROM section [TC-34]', () => {
    SwapPage.openTokenToSwapMenu().searchAndChooseToken('usdc')
    SwapPage.typeValueTo('100')
    SwapPage.getFromInput().should('not.have.value', undefined)
  })
})
