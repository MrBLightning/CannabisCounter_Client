import React, { Component } from "react";
import { AppState } from "shared/store/app.reducer";
import { connect } from "react-redux";
import { uiNotify } from "shared/components/Toast";
import * as planogramApi from "shared/api/planogram.provider";
import { PlanogramElementId } from "shared/store/planogram/planogram.types";

const storeSelectionMapStateToProps = (state: AppState, ownProps: { aisleId: PlanogramElementId }) => ({
    branchId: state.planogram.store ? state.planogram.store.branch_id : null,
    displayAisle: ownProps.aisleId,
    // displayAisle: state.planogram.store ? state.planogram.store.aisles[state.planogram.display.aisleIndex].aisle_id : null,
    storeId: state.planogram.store ? state.planogram.store.store_id || null : null
});
type StoreSelectionButtonState = {
    loading: boolean;
    storeList: any[];
    targetStoreId?: number | string;
};
class StoreSelectionButtonComponent extends Component<ReturnType<typeof storeSelectionMapStateToProps>> {
    state: StoreSelectionButtonState = {
        loading: false,
        storeList: [],
        targetStoreId: undefined
    };
    handleIntialClick = () => {
        if (this.props.branchId == null || this.props.displayAisle == null)
            return;
        if (this.state.storeList.length === 0) {
            this.setState({
                loading: true,
            });
            planogramApi.fetchBranchStores(this.props.branchId).then((storeList) => {
                this.setState({
                    storeList,
                    targetStoreId: storeList[0] ? storeList[0].id : undefined,
                    loading: false,
                });
            }).catch((err) => {
                console.error(err);
                this.setState({
                    storeList: [],
                    targetStoreId: undefined,
                    loading: false,
                });
            });
        }
    };
    handleDuplicateSubmit = () => {
        if (this.props.branchId == null || this.props.displayAisle == null)
            return;
        if (this.state.targetStoreId == null || this.state.targetStoreId == "")
            return uiNotify("Please choose a store to duplicate into.");
        this.setState({
            loading: true,
        });
        planogramApi.duplciateAisle(this.props.branchId, this.props.storeId, this.props.displayAisle, this.state.targetStoreId).then(() => {
            uiNotify("Duplicated aisle successfully", "success", 3500);
            this.setState({
                loading: false
            });
        }).catch((err) => {
            this.setState({
                loading: false
            });
            uiNotify("There was an error duplicating aisle into store.", "error", 5000);
        });
    };
    render() {
        if (this.props.branchId == null || this.props.displayAisle == null)
            return null;
        if (this.state.loading)
            return <div className="input-row">Loading...</div>;
        const { storeList, targetStoreId } = this.state;
        return (<div className="input-row" onClick={e => e.stopPropagation()}>
            {storeList.length > 0 ? <div>
                <span>Store:</span>
                <select value={targetStoreId} onChange={(e) => this.setState({ targetStoreId: e.target.value })}>
                    {storeList.map(store => (<option value={store.id}>{store.name}</option>))}
                </select>
                <button onClick={this.handleDuplicateSubmit}>Duplciate</button>
            </div> : <button onClick={this.handleIntialClick}>Copy Aisle</button>}
        </div>);
    }
}
const StoreSelectionButton = connect(storeSelectionMapStateToProps)(StoreSelectionButtonComponent);
