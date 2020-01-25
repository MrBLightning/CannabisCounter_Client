import React, { Component, useState } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { Dispatch, Action } from "redux";

import { connect } from "react-redux";
import { AppState } from "shared/store/app.reducer";
import { setAppVersion } from "shared/store/system/system.actions";
import { checkVersion, getLatestVersion } from "./Version-control";
import { httpClientEmpty } from "shared/http";
import config from 'shared/config';
import { unregister } from 'serviceWorker';


type AuthRouteProps = RouteProps & {
  title?: string,
  component: React.ComponentClass,
  required?: boolean,
  level?: number,
}

const mapStateToProps = (state: AppState, ownProps: AuthRouteProps) => ({
  ...ownProps,
  user: state.auth.user,
  isLogged: state.auth.user && state.auth.token,
  userLevel: state.auth.user && state.auth.user.level != null ? state.auth.user.level : 100,
});

class ProtectedRouteComponent extends Route<ReturnType<typeof mapStateToProps>> {
  render() {
    const { isLogged, userLevel, user, component: RouteComponent, ...rest } = this.props;

    const { required, level } = this.props;
    let hasAccess = false;
    if (isLogged) {
      if (level !== undefined)
        hasAccess = userLevel <= level;
      else hasAccess = true;
    }
    return (
      <Route
        {...rest}
        render={props => hasAccess ? <RouteComponent {...props} /> : <Redirect to={"/login"} />}
      />
    );
  }
}
class OnlyPublicRouteComponenet extends Route<ReturnType<typeof mapStateToProps>> {
  render() {
    const { isLogged, component: RouteComponent, ...rest } = this.props;
    return (<Route {...rest} render={props =>
      !isLogged ? <RouteComponent {...props} /> : <Redirect to={"/"} />} />);
  }
}


export const ProtectedRoute = connect(mapStateToProps)(ProtectedRouteComponent);
export const OnlyPublicRoute = connect(mapStateToProps)(OnlyPublicRouteComponenet);
