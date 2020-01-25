import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, RouteComponentProps, withRouter } from 'react-router';
import { locale, loadMessages } from "devextreme/localization";

import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';

import * as authSerivce from './shared/auth/auth.service';
import hebrewMessages from "shared/localization/he.json"
import englishMessages from "shared/localization/en.json"

import { store } from 'shared/store';
import { AppState } from 'shared/store/app.reducer';
import { OnlyPublicRoute, ProtectedRoute } from 'shared/components/AppRoute';
import LoginScreen from 'pages/login/LoginScreen';
import { ManagePage } from 'pages/manage/ManagePage';
import NotFound from 'pages/NotFound';
import AddHomeScreen from 'shared/components/AddToHomeScreen'

import 'assets/styles/base.scss';
import 'devextreme/dist/css/dx.common.css';
//import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';
import { AppError } from './pages/AppError';
import BarcodeScanner from 'pages/manage/planogram/main/components/barcode-scanner/BarcodeScanner';
import { uiNotify } from 'shared/components/Toast';
import AddToHomescreen from 'shared/components/AddToHomeScreen';

library.add(faEnvelope, faKey);

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps) => ({
  ...ownProps,
  appState: state.system.app_state,
  appLanguage: state.system.app_lang
})
type AppProps = ReturnType<typeof mapStateToProps> & RouteComponentProps<{}>;
class App extends React.Component<AppProps> {

  componentDidMount() {
    const { appLanguage } = this.props;
    locale(appLanguage);
    loadMessages({ he: hebrewMessages, en: englishMessages });
    authSerivce.init();
  }
  componentWillReceiveProps(nextProps: any) {
    if (nextProps.appLanguage !== this.props.appLanguage)
      locale(this.props.appLanguage);
  }

  render() {
    const { appState, match } = this.props;
    if (appState === "NO_NETWORK" || appState === "FATAL_ERROR")
      return <AppError matchUrl={match.url} />
    else if (appState === "INIT")
      return <div className="app-wrapper loader"></div>

    return (
    // AddToHomescreen is a component that is meant to check if the app has been added to the homescreen
    // if not it should raise a prompt window to add
    <AddToHomescreen>
      <div className="app-wrapper">
        <Switch>
          <Route path="/scanner" render={(props) => {
            return <BarcodeScanner onDetected={(result) => uiNotify("CODE: " + result, "success", 5000)} />;
          }} />
          <OnlyPublicRoute path="/login" component={LoginScreen} title="Algoretail - Login" />
          <ProtectedRoute
            path="/"
            component={ManagePage}
            title="Algoretail - Panel" />
          <Route component={NotFound} />
        </Switch>
      </div>
      </AddToHomescreen>
    );
  }
}

export default withRouter(connect(mapStateToProps)(App));