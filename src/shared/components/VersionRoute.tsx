import React from "react";
import { Route, RouteProps } from "react-router-dom";
import { Dispatch } from "redux";

import { connect } from "react-redux";
import { AppState } from "shared/store/app.reducer";
import { setAppVersion } from "shared/store/system/system.actions";
import { getLatestVersion } from "./Version-control";
import { unregister } from 'serviceWorker';
import { refresh, logout } from "shared/auth/auth.service";


const mapStateToProps = (state: AppState, ownProps: RouteProps) => ({
  ...ownProps,
  version: state.system.app_version,
  exp_date: state.auth.exp_date
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setVersion: (version: string) => {
    dispatch(setAppVersion(version));
  }
})

// class VersionRouteComponent extends Route<ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>> {
//   async render(){
//     const { version, setVersion, ...rest } = this.props;
//     let Component: React.ComponentClass;

//     // get version from manifest.json
//     const latestVersion = await getLatestVersion();
//     // get version from AppStore
//     let localVersion = version;

//     if (localVersion !== latestVersion) {
//         // manifest version is newer than AppStore version - 
//         // we save the new manifest version in the AppStore
//         setVersion(latestVersion);

//         // we refresh the entire app
//         unregister();
//         window.location.reload(true);
//     }

//     return (
//       <Route
//         {...rest}
//         render={props => <Component {...props} />}
//       />
//     );

//   }
// }

type VersionRouteProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

export const VersionRouteComponent: React.FC<VersionRouteProps> = (props) => {
  const { version, setVersion, exp_date, ...rest } = props;

  let latestVersion = '';
  // get version from manifest.json
  getLatestVersion().then((version) => {
    latestVersion = version;
    // get version from AppStore
    let localVersion = localStorage.getItem('localVersion');

    if (localVersion !== latestVersion) {
      // manifest version is newer than AppStore version - 
      // we save the new manifest version in the AppStore
      localStorage.setItem('localVersion', latestVersion);
      setVersion(latestVersion);

      // we refresh the entire app
      refresh();
    }
  }).catch(err => {
    console.error(err);
  })

  const cur_date = new Date().getTime();
  // compare the getTime of current date to the expiration date saved in AppStore 
  if (exp_date && cur_date > exp_date) {
      console.log('expiration date has passed - forced logout')
      logout();
      refresh();
  }

  return (
    <Route
      {...rest}
    />
  );

}

export const VersionRoute = connect(mapStateToProps, mapDispatchToProps)(VersionRouteComponent);