import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  activeTabHasPermissions,
  getFirstPermissionRequest,
  getFirstSnapInstallOrUpdateRequest,
  getIsMainnet,
  getOriginOfCurrentTab,
  getTotalUnapprovedCount,
  getUnapprovedTemplatedConfirmations,
  getWeb3ShimUsageStateForOrigin,
  unconfirmedTransactionsCountSelector,
  getInfuraBlocked,
  getShowWhatsNewPopup,
  getSortedAnnouncementsToShow,
  getShowRecoveryPhraseReminder,
  getShowOutdatedBrowserWarning,
  getNewNetworkAdded,
  hasUnsignedQRHardwareTransaction,
  hasUnsignedQRHardwareMessage,
  getNewNftAddedMessage,
  getNewTokensImported,
  getShowPortfolioTooltip,
  getShouldShowSeedPhraseReminder,
  getRemoveNftMessage,
} from '../../selectors';

import {
  closeNotificationPopup,
  hidePortfolioTooltip,
  setConnectedStatusPopoverHasBeenShown,
  setDefaultHomeActiveTabName,
  setWeb3ShimUsageAlertDismissed,
  setAlertEnabledness,
  setRecoveryPhraseReminderHasBeenShown,
  setRecoveryPhraseReminderLastShown,
  setOutdatedBrowserWarningLastShown,
  setNewNetworkAdded,
  setNewNftAddedMessage,
  setRemoveNftMessage,
  setNewTokensImported,
  setRpcTarget,
  removeSnapError,
} from '../../store/actions';
import {
  hideWhatsNewPopup,
  setNewCustomNetworkAdded,
  getPortfolioTooltipWasShownInThisSession,
  setPortfolioTooltipWasShownInThisSession,
} from '../../ducks/app/app';
import { getWeb3ShimUsageAlertEnabledness } from '../../ducks/metamask/metamask';
import { getSwapsFeatureIsLive } from '../../ducks/swaps/swaps';
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import { getIsBrowserDeprecated } from '../../helpers/utils/util';
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../../shared/constants/app';
import {
  AlertTypes,
  Web3ShimUsageAlertStates,
} from '../../../shared/constants/alerts';
import Home from './home.component';

const mapStateToProps = (state) => {
  const { metamask, appState } = state;
  const {
    suggestedAssets,
    seedPhraseBackedUp,
    selectedAddress,
    connectedStatusPopoverHasBeenShown,
    defaultHomeActiveTabName,
    swapsState,
    firstTimeFlowType,
    completedOnboarding,
  } = metamask;
  const { forgottenPassword } = metamask;
  const totalUnapprovedCount = getTotalUnapprovedCount(state);
  const swapsEnabled = getSwapsFeatureIsLive(state);
  const pendingConfirmations = getUnapprovedTemplatedConfirmations(state);

  const envType = getEnvironmentType();
  const isPopup = envType === ENVIRONMENT_TYPE_POPUP;
  const isNotification = envType === ENVIRONMENT_TYPE_NOTIFICATION;

  let firstPermissionsRequest, firstPermissionsRequestId;
  firstPermissionsRequest = getFirstPermissionRequest(state);
  firstPermissionsRequestId = firstPermissionsRequest?.metadata.id || null;

  // TODO: getFirstPermissionRequest should be updated with snap update logic once we hit main extension release
  if (!firstPermissionsRequest) {
    firstPermissionsRequest = getFirstSnapInstallOrUpdateRequest(state);
    firstPermissionsRequestId = firstPermissionsRequest?.metadata.id || null;
  }

  const originOfCurrentTab = getOriginOfCurrentTab(state);
  const shouldShowWeb3ShimUsageNotification =
    isPopup &&
    getWeb3ShimUsageAlertEnabledness(state) &&
    activeTabHasPermissions(state) &&
    getWeb3ShimUsageStateForOrigin(state, originOfCurrentTab) ===
      Web3ShimUsageAlertStates.recorded;

  const isSigningQRHardwareTransaction =
    hasUnsignedQRHardwareTransaction(state) ||
    hasUnsignedQRHardwareMessage(state);

  return {
    forgottenPassword,
    suggestedAssets,
    swapsEnabled,
    unconfirmedTransactionsCount: unconfirmedTransactionsCountSelector(state),
    shouldShowSeedPhraseReminder: getShouldShowSeedPhraseReminder(state),
    isPopup,
    isNotification,
    selectedAddress,
    firstPermissionsRequestId,
    totalUnapprovedCount,
    connectedStatusPopoverHasBeenShown,
    defaultHomeActiveTabName,
    firstTimeFlowType,
    completedOnboarding,
    haveSwapsQuotes: Boolean(Object.values(swapsState.quotes || {}).length),
    swapsFetchParams: swapsState.fetchParams,
    showAwaitingSwapScreen: swapsState.routeState === 'awaiting',
    isMainnet: getIsMainnet(state),
    originOfCurrentTab,
    shouldShowWeb3ShimUsageNotification,
    pendingConfirmations,
    infuraBlocked: getInfuraBlocked(state),
    announcementsToShow: getSortedAnnouncementsToShow(state).length > 0,
    errorsToShow: metamask.snapErrors,
    shouldShowErrors: Object.entries(metamask.snapErrors || []).length > 0,
    showWhatsNewPopup: getShowWhatsNewPopup(state),
    showPortfolioTooltip: getShowPortfolioTooltip(state),
    portfolioTooltipWasShownInThisSession:
      getPortfolioTooltipWasShownInThisSession(state),
    showRecoveryPhraseReminder: getShowRecoveryPhraseReminder(state),
    showOutdatedBrowserWarning:
      getIsBrowserDeprecated() && getShowOutdatedBrowserWarning(state),
    seedPhraseBackedUp,
    newNetworkAdded: getNewNetworkAdded(state),
    isSigningQRHardwareTransaction,
    newNftAddedMessage: getNewNftAddedMessage(state),
    removeNftMessage: getRemoveNftMessage(state),
    newTokensImported: getNewTokensImported(state),
    newCustomNetworkAdded: appState.newCustomNetworkAdded,
    onboardedInThisUISession: appState.onboardedInThisUISession,
  };
};

const mapDispatchToProps = (dispatch) => ({
  closeNotificationPopup: () => closeNotificationPopup(),
  removeSnapError: async (id) => await removeSnapError(id),
  setConnectedStatusPopoverHasBeenShown: () =>
    dispatch(setConnectedStatusPopoverHasBeenShown()),
  onTabClick: (name) => dispatch(setDefaultHomeActiveTabName(name)),
  setWeb3ShimUsageAlertDismissed: (origin) =>
    setWeb3ShimUsageAlertDismissed(origin),
  disableWeb3ShimUsageAlert: () =>
    setAlertEnabledness(AlertTypes.web3ShimUsage, false),
  hideWhatsNewPopup: () => dispatch(hideWhatsNewPopup()),
  hidePortfolioTooltip,
  setRecoveryPhraseReminderHasBeenShown: () =>
    dispatch(setRecoveryPhraseReminderHasBeenShown()),
  setRecoveryPhraseReminderLastShown: (lastShown) =>
    dispatch(setRecoveryPhraseReminderLastShown(lastShown)),
  setOutdatedBrowserWarningLastShown: (lastShown) => {
    dispatch(setOutdatedBrowserWarningLastShown(lastShown));
  },
  setNewNetworkAdded: (newNetwork) => {
    console.log({ newNetwork });
    dispatch(setNewNetworkAdded(newNetwork));
  },
  setNewNftAddedMessage: (message) => {
    dispatch(setNewNftAddedMessage(message));
  },
  setRemoveNftMessage: (message) => {
    dispatch(setRemoveNftMessage(message));
  },
  setNewTokensImported: (newTokens) => {
    dispatch(setNewTokensImported(newTokens));
  },
  clearNewCustomNetworkAdded: () => {
    dispatch(setNewCustomNetworkAdded({}));
  },
  setRpcTarget: (rpcUrl, chainId, ticker, nickname) => {
    dispatch(setRpcTarget(rpcUrl, chainId, ticker, nickname));
  },
  setPortfolioTooltipWasShownInThisSession: () =>
    dispatch(setPortfolioTooltipWasShownInThisSession()),
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Home);
