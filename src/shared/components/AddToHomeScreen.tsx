// The original article was https://love2dev.com/blog/beforeinstallprompt/
// that led to here: https://love2dev.com/pwa/add-to-homescreen-library/
// This file is based on the Github library here: https://github.com/docluv/add-to-homescreen/blob/master/src/addtohomescreen.js
// Israel Kuperman (Algoretail) converted the JS into TSX

// This Class is supposed to check if the app has been added to the user's homescreen. 
// if not, it should prompt the 'add to home screen' button

// in order to use it to automatically check if your PWA (progressive web app) has been added to the user homescreen
// simply wrap you main page render with the class <AddToHomescreen></AddToHomescreen>
// the class will do all the needed checks when the app first loads on a browser

import React, { Component } from 'react';
import LogoImage from 'assets/images/brand-logo.png'
import { timeout } from 'q';
import { isBrowser, isMobile } from "react-device-detect";

const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandaloneMode = () => 'standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches;

type AddToHomescreenProps = {
    onAddToHomescreenClick?: Function,
    title?: string,
    icon?: string,
}

let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt',e);

    deferredPrompt = e;
});

class AddToHomescreen extends Component<AddToHomescreenProps> {

    state = {
        bannerVisible: true,
        ready: !!deferredPrompt,
        installed: false,
        standAloneMode: isInStandaloneMode(),
        skip: false
    };
    looper?: NodeJS.Timeout;

    componentDidMount() {
        console.log('AddToHomescreen componentDidMount deferredPrompt',deferredPrompt);
        window.addEventListener('appinstalled', (evt) => {
            console.log('a2hs installed successfully');
            this.setState({
                installed: true
            })
        });
        if (!this.state.standAloneMode)
            this.looper = setInterval(() => {
                if (deferredPrompt != null) {
                    this.setState({ ready: true });
                }
            }, 10)
        setTimeout(() => {
            // check if app is already installed or is opened in a regular browser rather than on a mobile
            //if (!deferredPrompt || isBrowser) {
            console.log('setTimeout deferredPrompt',deferredPrompt)    
                if (!deferredPrompt ) {    
                console.log('App already installed');
                this.setState({ skip: true });
            }
        }, 2000)
    }

    onAddToHomescreenClick = () => {
        if (!deferredPrompt) return console.log("App installation not ready");
        deferredPrompt.prompt();
        deferredPrompt.userChoice
            .then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                    this.setState({ bannerVisible: true })
                }
                else {
                    console.log('User dismissed the A2HS prompt');
                    this.setState({ bannerVisible: true })
                }

                // deferredPrompt = null;
            });
    };

    handleCloseBannerBtnClick = () => this.setState({ bannerVisible: false });

    render() {
        const { title, icon } = this.props;
        const { bannerVisible } = this.state;

        //
        if (this.state.skip || this.state.standAloneMode) return this.props.children;

        if (!this.state.ready)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>);

        // this if checks: 
        //  - the app is installed
        //  - if the app has been opened in a regular browser rather than on a mobile
        //  - ready is false before a2hs is installed and true once it is installed and the app ready to be installed
        //  - isIOS (wasn't initially supposed to work with MAC or Iphone)
        //  - isInStandaloneMode checks if the app was already installed to homescreen 
        // if (this.state.installed || !this.state.ready || isIos() || isInStandaloneMode())

        // if (this.state.installed || isBrowser)
        //     return this.props.children;

        if (this.state.installed ) return this.props.children;

        if (this.looper && this.state.ready)
            clearInterval(this.looper);

        return (
            <React.Fragment>
                {bannerVisible ? <div style={{ position: "fixed", top: "0", height: "100%", width: "100%", background: "#fafafa", zIndex: 9000 }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexFlow: "column", alignContent: "center" }}>
                        <img src={LogoImage} alt="" style={{ marginBottom: "2em" }} />
                        {/* <button onClick={this.onAddToHomescreenClick}>Add To Homescreen</button> */}
                        <button onClick={this.onAddToHomescreenClick}>התקן את האפליקציה</button>
                    </div>
                </div> : null}
                {this.props.children}
            </React.Fragment>
        );
    }
}

export default AddToHomescreen;
