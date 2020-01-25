import React, { Component } from 'react';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import brandLogo from 'assets/images/brand-logo.png';
import { Button } from 'devextreme-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
export class AppError extends Component<{
    matchUrl: string;
}> {
    render() {
        const { matchUrl } = this.props;
        return (<div className="app-wrapper">
            <div style={{ display: "flex", flexFlow: "column", justifyItems: "center", justifyContent: "center", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -80%)" }}>
                <img src={brandLogo} alt="Algoretail Logo" style={{ maxWidth: "420px" }} />
                <h1>Error: No Network Found</h1>
                <Button style={{ padding: "1em" }} onClick={() => { window.location.href = matchUrl; }}>
                    <FontAwesomeIcon icon={faRedo} style={{ marginLeft: "1em" }} />
                    <span>נסה שנית</span>
                </Button>
            </div>
        </div>);
    }
}
