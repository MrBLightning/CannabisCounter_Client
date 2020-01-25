// This class checks if the version saved in the local storage is the same 
// as the latest version in the manifest.json
// If the local version and the last version are not the same we save the new version number
// and refresh the page to get the new version

import React, { Component } from 'react';
import { httpClientEmpty } from "shared/http";
import { RouteComponentProps, Route } from 'react-router';
import { Status } from 'shared/interfaces/models/SystemModels';
import { unregister } from 'serviceWorker';
import config from 'shared/config';
import { connect } from 'http2';
import { AppState, AppAction } from 'shared/store/app.reducer';
import { Dispatch } from 'redux';
import { SYSTEM_ACTION } from 'shared/store/system/system.types';
import { setAppVersion } from 'shared/store/system/system.actions';
import { store } from 'shared/store';

// const mapStateToProps = (state: AppState, ownProps: any) => ({
//     version: state.system.app_version,
// })

// const mapDispatchToProps = (dispatch: Dispatch) => ({
//     setVersion: (version: string) => {
//         dispatch(setAppVersion(version));
//     }
// })


export async function getLatestVersion(): Promise<string> {
    // go to manifest.json to get latest version
    let result: string = '';
    try {
        let temp = await httpClientEmpty.get<any>(`/manifest.json`, { baseURL: config.PUBLIC_URL });
        result = temp.data.version;
    } catch (error) {
        console.error(error);
    }
    return result;
}


// this function checks the local version against the last version on the manifest.json file
// if the two do not match we save the latest version and do a reload
// this function is global and can be called from anywhere
// we use it in AppRoute.tsx that define the behaviour of ProtectedRoute
// - that means that unless the user is logged in they cannot go to the path they intended
// Now we add to the route a version check. That means that the check will happen every time 
// we move from one page to another 
export async function checkVersion() {
    const latestVersion = await getLatestVersion();

    let localVersion = localStorage.getItem('localVersion');

    if (localVersion !== latestVersion) {
        localStorage.setItem('localVersion', latestVersion);
        localVersion = latestVersion;
        console.log('refresh location checkVersion', window.location.href)

        unregister();
        window.location.reload(true);
    }
}

export async function checkPageVersion() {
    const latestVersion = await getLatestVersion();

    let localVersion = localStorage.getItem('localVersion');

    if (localVersion !== latestVersion) {
        console.log('refresh location checkVersion', window.location.href)

        unregister();
        window.location.reload(true);
    }
}

// export default connect(mapStateToProps, mapDispatchToProps)(getLatestVersion)