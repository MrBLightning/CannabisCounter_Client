import React, { Component } from 'react';
import { Switch, Route, withRouter, RouteComponentProps, NavLink, Redirect } from 'react-router-dom';

import { AnyAction } from 'redux';
import { AppState } from 'shared/store/app.reducer';
import { connect } from 'react-redux';
import { PlanogramSection, PlanogramElementId } from 'shared/store/planogram/planogram.types';
import {
    // addSectionAction, 
    duplicateSectionAction
} from 'shared/store/planogram/store/section/section.actions';
// import { addSectionActionProps } from 'shared/store/planogram/store/section/section.types';
import { renameStore, } from 'shared/store/planogram/store/store.actions';
import { updateCatalogProducts } from 'shared/store/catalog/catalog.action';
import { EditableText } from 'shared/components/Form';
import { setDisplayAisle, hideProductDetailer } from 'shared/store/planogram/planogram.actions';
import { CatalogProduct } from 'shared/interfaces/models/CatalogProduct';
import { ThunkDispatch } from 'redux-thunk';

import * as planogramApi from 'shared/api/planogram.provider';

import PlanogramAisleComponent from './PlanogramAisleComponent';
import { uiNotify } from 'shared/components/Toast';
import { PLANOGRAM_BASE_URL } from '../../PlanogramScreen';

type ContainerComponentProps = {
    // store: PlanogramStore
} & RouteComponentProps<{
    store_id?: string,
    branch_id?: string,
    // aisle_index: string
}> & {
}

const mapStateToProps = (state: AppState, ownProps: ContainerComponentProps) => ({
    ...ownProps,
    products: state.catalog.products,
    productMap: state.catalog.productsMap,
    displaySalesReport: state.planogram.display.displaySalesReport,
    store: state.planogram.store,
    sidebar: state.planogram.sidebar,
    productDetailerState: state.planogram.display.productDetailer != null

});
const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({
    // addSection: (aisle: PlanogramAisle, data: addSectionActionProps) => dispatch(addSectionAction(aisle, data)),
    duplicateSection: (aisleId: PlanogramElementId, section: PlanogramSection) => dispatch(duplicateSectionAction(aisleId, section)),
    renameStore: (text: string) => dispatch(renameStore(text)),
    // deleteAisle: (aisle: PlanogramAisle) => dispatch(aisleActions.removeAisleAction(aisle)),
    setDisplayAisle: (aisleIndex: number) => dispatch(setDisplayAisle(aisleIndex)),
    updateMultipleProductsDimension: (products: CatalogProduct[]) => {
        dispatch(updateCatalogProducts(products))
    },
    hideProductDisplayerBarcode: () => {
        dispatch(hideProductDetailer());
    },
});

type ContainerProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class PlanogramStoreComponentContainer extends Component<ContainerProps> {
    state = {
        searchFilter: ''
    }
    
    render() {
        const {
            store,
            productDetailerState,
            hideProductDisplayerBarcode
        } = this.props;
        if (store == null || this.props.products.length === 0)
            return <div className="planogram-view"><div className="loader"></div></div>;
        const storeName = store.name || "Store: " + (store.store_id || "New");
        return (
            <div className="planogram-view" onClick={(e) => {
                if (productDetailerState)
                    hideProductDisplayerBarcode()
            }}>
                <div className="planogram-float-toolbar">
                    <EditableText onNewText={(newText) => {
                        if (!store) return uiNotify("Unable to rename store");
                        planogramApi.renameStore(store.store_id, newText).then(() => {
                            this.props.renameStore(newText);
                        }).catch(err => {
                            console.error(err);
                            uiNotify("Unable to rename store");
                        })
                    }} text={storeName}>
                        <h1>{storeName}</h1>
                    </EditableText>
                    {/* <h4>Aisle Selection</h4> */}
                    <div className="scroller toolbar-aisles">
                    <input type="text" className="input" placeholder="חפש..." style={{ marginBottom: "0.5em",maxWidth:"100%" }} onChange={(e) => this.setState({ searchFilter: e.target.value })} />
                        {this.state.searchFilter === ''
                            ? store.aisles.map((aisle, i) => (
                                <NavLink key={"activated_" + aisle.aisle_id}
                                    className="toolbar-button"
                                    activeClassName="selected"
                                    to={`${this.props.match.url}/${aisle.aisle_id}`}>
                                    {aisle.name || "Aisle " + aisle.aisle_id}
                                </NavLink>
                            ))
                            : store.aisles.filter(aisle => aisle.name.toLowerCase().includes(this.state.searchFilter.toLowerCase())).map((aisle, i) => (
                                <NavLink key={"activated_" + aisle.aisle_id}
                                    className="toolbar-button"
                                    activeClassName="selected"
                                    to={`${this.props.match.url}/${aisle.aisle_id}`}>
                                    {aisle.name || "Aisle " + aisle.aisle_id}
                                </NavLink>
                            ))
                        }
                    </div>
                </div>
                <Switch>
                    <Route path={`${this.props.match.url}/:aisle_index`} component={PlanogramAisleComponent} />
                    <Route render={(props) => (store.aisles[0] ? <Redirect to={`${this.props.match.url}/${store.aisles[0].aisle_id}`} /> : <Redirect to={`${this.props.match.url}`} />)} />)} />
                </Switch>
            </div>
        )
    }
}

export const PlanogramStoreComponent = withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanogramStoreComponentContainer));