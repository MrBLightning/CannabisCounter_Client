import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Menu } from 'react-contexify';
import { AppState } from 'shared/store/app.reducer';
import { PlanogramAisle } from 'shared/store/planogram/planogram.types';
import * as aisleActions from 'shared/store/planogram/store/aisle/aisle.actions';
import * as planogramProvider from "shared/api/planogram.provider";
import { toggleRowItems, toggleSettings } from 'shared/store/planogram/planogram.actions';
import { uiNotify } from 'shared/components/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faEyeSlash, faFileArchive, faWindowClose, faCog } from '@fortawesome/free-solid-svg-icons';
import { toggleShelfItems, showSalesReport, hideSalesReport } from 'shared/store/planogram/display/display.actions';
const mapStateSettingsContext = (state: AppState) => ({
    store: state.planogram.store,
    hideShelfItems: state.planogram.display.hideShelfItems,
    showRowItems: state.planogram.display.showRowItems,
    displaySalesReport: state.planogram.display.displaySalesReport,
});
const mapDispatchSettingsContext = (dispatch: ThunkDispatch<AppState, any, AnyAction>) => ({
    toggleShelfItems: () => dispatch(toggleShelfItems()),
    toggleRowItems: () => dispatch(toggleRowItems()),
    addAisle: (aisle: PlanogramAisle) => dispatch(aisleActions.addAisleAction(aisle)),
    toggleSettings: () => dispatch(toggleSettings()),
    toggleSalesReport: (show: boolean) => {
        if (show)
            dispatch(hideSalesReport());
        else
            dispatch(showSalesReport());
    },
});
export const PlanogramMainContextMenu = connect(mapStateSettingsContext, mapDispatchSettingsContext)((props: ReturnType<typeof mapStateSettingsContext> & ReturnType<typeof mapDispatchSettingsContext>) => {
    const { hideShelfItems, toggleSettings, displaySalesReport, toggleShelfItems, toggleSalesReport, addAisle, store } = props;
    return <Menu id="PLANOGRAM_VIEW_MENU" className="planogram-context-window">
        <div className="context-title">Store Settings</div>
        <div className="input-row">
            <button onClick={(e) => toggleSettings()}>
                <FontAwesomeIcon icon={faCog} />
                <span>{"Settings"}</span>
            </button>
        </div>
        <div className="input-row">
            <button onClick={(e) => toggleShelfItems()}>
                {hideShelfItems ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                <span>{hideShelfItems ? "Show Items" : "Hide Items"}</span>
            </button>
        </div>
        <div className="input-row">
            <button onClick={() => toggleSalesReport(displaySalesReport)}>
                <FontAwesomeIcon icon={faFileArchive} />
                <span>{!displaySalesReport ? "Open" : "Close"} Sales Report</span>
                {displaySalesReport && <FontAwesomeIcon icon={faWindowClose} style={{ float: "left" }} />}
            </button>
        </div>
        <div className="input-row">
            <button onClick={() => {
                if (store && store.store_id)
                    planogramProvider.createStoreAisle(store.store_id).then(aisle => {
                        addAisle(aisle);
                    }).catch(err => uiNotify("Unable to add aisle at this time"));
                else {
                    uiNotify("Unable to add aisle into unsaved store");
                }
            }}>
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Aisle</span>
            </button>
        </div>
    </Menu>;
});
