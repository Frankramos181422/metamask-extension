import React, { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import browser from 'webextension-polyfill';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  CONNECTED_ACCOUNTS_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';

import {
  AlignItems,
  BackgroundColor,
  BLOCK_SIZES,
  DISPLAY,
  JustifyContent,
  Size,
} from '../../../helpers/constants/design-system';
import {
  AvatarNetwork,
  ButtonIcon,
  PickerNetwork,
} from '../../component-library';
import { ICON_NAMES } from '../../component-library/icon/deprecated';
import {
  getCurrentNetwork,
  getOriginOfCurrentTab,
  getSelectedIdentity,
} from '../../../selectors';
import { GlobalMenu, AccountPicker } from '..';

import Box from '../../ui/box/box';
import { toggleAccountMenu, toggleNetworkMenu } from '../../../store/actions';
import MetafoxLogo from '../../ui/metafox-logo';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../../shared/constants/app';
import ConnectedStatusIndicator from '../../app/connected-status-indicator';

export const AppHeader = ({ onClick }) => {
  const trackEvent = useContext(MetaMetricsContext);
  const [accountOptionsMenuOpen, setAccountOptionsMenuOpen] = useState(false);
  const menuRef = useRef(false);
  const origin = useSelector(getOriginOfCurrentTab);
  const history = useHistory();
  const isUnlocked = useSelector((state) => state.metamask.isUnlocked);

  // Used for account picker
  const identity = useSelector(getSelectedIdentity);
  const dispatch = useDispatch();

  // Used for network icon / dropdown
  const currentNetwork = useSelector(getCurrentNetwork);

  // used to get the environment and connection status
  const popupStatus = getEnvironmentType() === ENVIRONMENT_TYPE_POPUP;
  const showStatus =
    getEnvironmentType() === ENVIRONMENT_TYPE_POPUP &&
    origin &&
    origin !== browser.runtime.id;

  return (
    <>
      {isUnlocked && !popupStatus ? (
        <Box
          style={{ height: '75px', flex: '0 0 auto' }}
          display={DISPLAY.FLEX}
          alignItems={AlignItems.center}
          margin={2}
          data-testid="app-header-logo"
          justifyContent={JustifyContent.center}
        >
          <MetafoxLogo
            unsetIconHeight
            onClick={async () => {
              if (onClick) {
                await onClick();
              }
              history.push(DEFAULT_ROUTE);
            }}
          />
        </Box>
      ) : null}
      <Box
        display={DISPLAY.FLEX}
        className={`multichain-app-header ${
          !isUnlocked || popupStatus ? 'multichain-app-header-shadow' : ''
        }`}
        alignItems={AlignItems.center}
        width={BLOCK_SIZES.FULL}
        backgroundColor={
          !isUnlocked || popupStatus
            ? BackgroundColor.backgroundDefault
            : BackgroundColor.backgroundAlternative
        }
      >
        <>
          {isUnlocked ? (
            <Box
              className={`multichain-app-header__contents ${
                isUnlocked && !popupStatus ? 'multichain-app-header-shadow' : ''
              }`}
              alignItems={AlignItems.center}
              width={BLOCK_SIZES.FULL}
              backgroundColor={BackgroundColor.backgroundDefault}
              padding={2}
              gap={2}
            >
              {popupStatus ? (
                <AvatarNetwork
                  name={currentNetwork?.nickname}
                  src={currentNetwork?.rpcPrefs?.imageUrl}
                  size={Size.SM}
                  onClick={() => dispatch(toggleNetworkMenu())}
                />
              ) : (
                <PickerNetwork
                  label={currentNetwork?.nickname}
                  src={currentNetwork?.rpcPrefs?.imageUrl}
                  onClick={() => dispatch(toggleNetworkMenu())}
                />
              )}

              <AccountPicker
                address={identity.address}
                name={identity.name}
                onClick={() => dispatch(toggleAccountMenu())}
              />
              <Box
                display={DISPLAY.FLEX}
                alignItems={AlignItems.center}
                justifyContent={JustifyContent.spaceBetween}
              >
                {showStatus ? (
                  <ConnectedStatusIndicator
                    onClick={() => history.push(CONNECTED_ACCOUNTS_ROUTE)}
                  />
                ) : null}
                <Box
                  ref={menuRef}
                  display={DISPLAY.FLEX}
                  justifyContent={JustifyContent.flexEnd}
                  width={BLOCK_SIZES.FULL}
                >
                  <ButtonIcon
                    iconName={ICON_NAMES.MORE_VERTICAL}
                    data-testid="account-options-menu-button"
                    ariaLabel="NEEDS NEW TRANSLATED LABEL"
                    onClick={() => {
                      trackEvent({
                        event: MetaMetricsEventName.NavAccountMenuOpened,
                        category: MetaMetricsEventCategory.Navigation,
                        properties: {
                          location: 'Home',
                        },
                      });
                      setAccountOptionsMenuOpen(true);
                    }}
                  />
                </Box>
              </Box>
              {accountOptionsMenuOpen ? (
                <GlobalMenu
                  anchorElement={menuRef.current}
                  closeMenu={() => setAccountOptionsMenuOpen(false)}
                />
              ) : null}
            </Box>
          ) : (
            <Box
              display={DISPLAY.FLEX}
              className={`multichain-app-header__lock-contents ${
                isUnlocked && !popupStatus ? 'multichain-app-header-shadow' : ''
              }`}
              alignItems={AlignItems.center}
              width={BLOCK_SIZES.FULL}
              justifyContent={JustifyContent.spaceBetween}
              backgroundColor={BackgroundColor.backgroundDefault}
              padding={2}
              gap={2}
            >
              <PickerNetwork
                label={currentNetwork?.nickname}
                src={currentNetwork?.rpcPrefs?.imageUrl}
                onClick={() => dispatch(toggleNetworkMenu())}
              />
              <MetafoxLogo
                unsetIconHeight
                onClick={async () => {
                  if (onClick) {
                    await onClick();
                  }
                  history.push(DEFAULT_ROUTE);
                }}
              />
            </Box>
          )}
        </>
      </Box>
    </>
  );
};

AppHeader.propTypes = {
  /**
   * The onClick handler to be passed to the App Header component
   */
  onClick: PropTypes.func,
};
