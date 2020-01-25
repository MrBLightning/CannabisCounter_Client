// This class checks if exp_date saved with the Token in localStorage has expired.
// If it has expired we force a logout

import React, { Component } from 'react';
import { getRequest, httpClientEmpty } from "shared/http";
import { RouteComponentProps, Route } from 'react-router';
import { Status } from 'shared/interfaces/models/SystemModels';
import { unregister } from 'serviceWorker';
import config from 'shared/config';
import { logout, refresh } from 'shared/auth/auth.service';
import { AppState } from 'shared/store/app.reducer';
import { store } from 'shared/store';

// this function checks the local version against the last version on the manifest.json file
// if the two do not match we save the latest version and do a reload
// this function is global and can be called from anywhere
// we use it in AppRoute.tsx that define the behaviour of ProtectedRoute
// - that means that unless the user is logged in they cannot go to the path they intended
// Now we add to the route a version check. That means that the check will happen every time 
// we move from one page to another 
export async function checkToeknTime() {
    // Old version - bring the exp_date from local storage
    // let exp_date:number = getExpDate();

    // we bring the exp_date from the AppState (redux) using store.getState()
    // this is an example of accessing the AppStore without using the mapDispatchToProps
    let exp_date:number | undefined = store.getState().auth.exp_date;
    const cur_date = new Date().getTime();

    // compare the getTime of current date to the expiration date saved in local storage 
    if (exp_date && cur_date > exp_date) {
        console.log('expiration date has passed - forced logout')
        logout();
        refresh();
    }
}

export async function checkPageToeknTime() {
    let exp_date:number | undefined = store.getState().auth.exp_date;
    const cur_date = new Date().getTime();

    
    // compare the getTime of current date to the expiration date saved in local storage 
    if (exp_date && cur_date > exp_date) {
        console.log('expiration date has passed - forced logout')
        logout();
        refresh();
    }
}