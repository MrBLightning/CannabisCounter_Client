import React, { Component, FC } from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';

import PlanogramTrashComponent from './components/PlanogramTrashComponent';
import { PlanogramStoreComponent } from './components/PlanogramStoreContainer';
import PlanogramSidebar from './PlanogramSidebar';
import { AnyAction } from 'redux';
import { AppState } from 'shared/store/app.reducer';
import { connect } from 'react-redux';
import { PlanogramStore } from 'shared/store/planogram/planogram.types';
import { MenuProvider } from 'react-contexify';
import { resetStore, setStore, saveLocalStore } from 'shared/store/planogram/store/store.actions';
import { fetchPlanogramStore, productsPredictedSales } from 'shared/api/planogram.provider';
import { updateCatalogProducts, setWeeklySaleButch } from 'shared/store/catalog/catalog.action';
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { CatalogBarcode } from 'shared/interfaces/models/CatalogProduct';
import { ThunkDispatch } from 'redux-thunk';

import * as systemApi from 'shared/api/settings.provider';

import PlanogramProductDetail from './components/PlanogramProductDetail';
import PlanogramReport from './components/PlanogramReport';
import { Branch, Supplier, Class, Group, Serie, SubGroup } from 'shared/interfaces/models/System';
import { setBranches, setSuppliers, setClasses, setGroups, setSeries, setSubGroups } from 'shared/store/system/data/data.actions';
import { uiNotify } from 'shared/components/Toast';
import { deepExtractKey } from "shared/store/planogram/virtualize/deep-extract";
import { ProductSaleMap } from 'shared/store/catalog/catalog.types';
import { PLANOGRAM_BASE_URL } from '../PlanogramScreen';
import { faUpload, faDownload } from '@fortawesome/free-solid-svg-icons';

import '../planogram.scss';
import PlanogramSettings from './components/PlanogramSettings';
import { ProductWeekSales } from 'shared/interfaces/responses/planogram.dto';
import { PlanogramMainContextMenu } from './PlanogramMainContextMenu';
import Draggable from 'react-draggable';


const mapStateToEditorProps = (state: AppState, ownProps: { is_new?: boolean } & RouteComponentProps<{
    store_id: string,
    aisle_index?: string
}>) => ({
    ...ownProps,
    // productMap: state.catalog.productsMap,
    store: state.planogram.store,
    aisleMap: state.planogram.virtualStore.aisleMap,
    aisle: state.planogram.virtualStore.aisleMap &&
        ownProps.match.params.aisle_index ?
        state.planogram.virtualStore.aisleMap[ownProps.match.params.aisle_index] : null,

    suppliers: state.system.data.suppliers,
    suppliersMap: state.system.data.suppliersMap,
    classes: state.system.data.classes,
    classesMap: state.system.data.classesMap,
    groups: state.system.data.groups,
    subGroups: state.system.data.subGroups,
    branches: state.system.data.branches,
    series: state.system.data.series
});
const mapDispatchToEditorProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({
    // saveStore: (_store: PlanogramStore) =>
    //     dispatch(saveStore(_store)),
    // saveLocalStore: () =>
    //     dispatch((dispatch, getState) => {
    //         const _store = getState().planogram.store;
    //         if (_store != null)
    //             dispatch(saveLocalStore(_store))
    //     }),
    // resetStore: (branchId: number | null) => {
    //     dispatch((dispatch, getState) => {
    //         // const branchId = getState().planogram.display.branchId;
    //         if (branchId != null)
    //             dispatch(resetStore(branchId))
    //         dispatch((dispatch) => dispatch(setDisplayAisle(0)))
    //     });
    // },
    initStore: (branchId: number) =>
        dispatch(resetStore(branchId)),
    setStore: (store: PlanogramStore) => dispatch(async (dispatch, getState) => {
        const barcodes: CatalogBarcode[] = deepExtractKey(store, "product");
        try {
            const sales = await productsPredictedSales(store.branch_id, barcodes);
            let salesLength = sales.length;
            const salesMap: ProductSaleMap = {}
            for (let i = 0; i < salesLength; i++) {
                const sale = sales[i];
                salesMap[sale.BarCode] = {
                    weekly: sale.WeeklyAverage,
                    monthly: null
                };
            }
            dispatch((dispatch) => dispatch(setWeeklySaleButch(salesMap)));
        } catch (error) {
            console.error(error);
        }
        dispatch((dispatch) => dispatch(setStore(store)));
    }),
    setBranches: (branches: Branch[]) => dispatch((dispatch) => dispatch(setBranches(branches))),
    setSuppliers: (suppliers: Supplier[]) => dispatch((dispatch) => dispatch(setSuppliers(suppliers))),
    setClasses: (classes: Class[]) => dispatch((dispatch) => dispatch(setClasses(classes))),
    setGroups: (groups: Group[]) => dispatch((dispatch) => dispatch(setGroups(groups))),
    setSubGroups: (subGroups: SubGroup[]) => dispatch((dispatch) => dispatch(setSubGroups(subGroups))),
    setSeries: (groups: Serie[]) => dispatch((dispatch) => dispatch(setSeries(groups))),
});

type EditorProps = ReturnType<typeof mapStateToEditorProps>;
type EditorDispatchProps = ReturnType<typeof mapDispatchToEditorProps>;

type PlanogramEditorProps = EditorProps & EditorDispatchProps;

class PlanogramEditor extends Component<PlanogramEditorProps> {
    state = {
        loading: false
    }
    componentDidMount() {
        // this.props.fetchCatalog();
        const { history, match, store } = this.props;
        const { params } = match;
        if (!params.store_id)
            return history.push(PLANOGRAM_BASE_URL);
        if (!store || (store && store.store_id.toString() !== params.store_id))
            this.loadStore(params.store_id);
    }
    loadData = async () => {
        const {
            branches,
            suppliers,
            classes,
            groups,
            subGroups,
            series,
            setBranches,
            setSuppliers,
            setClasses,
            setGroups,
            setSubGroups,
            setSeries
        } = this.props;
        try {
            if (branches.length === 0)
                setBranches(await systemApi.fetchBranches());
            if (suppliers.length === 0)
                setSuppliers(await systemApi.fetchSuppliers());
            if (classes.length === 0)
                setClasses(await systemApi.fetchClasses());
            if (groups.length === 0)
                setGroups(await systemApi.fetchGroups());
            if (subGroups.length === 0)
                setSubGroups(await systemApi.fetchSubGroups());
            if (series.length === 0)
                setSeries(await systemApi.fetchSeries());
        } catch (error) {
            uiNotify("There was a problem loading system data.");
        }
    }
    loadStore = async (storeId: string) => {
        const { setStore, history } = this.props;
        try {
            const store = await fetchPlanogramStore(storeId);
            await setStore(store);
            await this.loadData();
        } catch (error) {
            console.error(error);
            history.goBack();
        }
    }

    render() {
        const { loading } = this.state;
        const {
            store
        } = this.props;

        if (loading || !store)
            return <div className="planogram-wrapper">
                <div className="loader"></div>
            </div>;
        return (
            <DndProvider backend={!isMobile ? HTML5Backend : TouchBackend}>
                <div className="planogram-wrapper">
                    <MenuProvider id="PLANOGRAM_VIEW_MENU" className="planogram-component">
                        <React.Fragment>
                            <PlanogramReport />
                            <PlanogramTrashComponent />
                            <PlanogramSidebar />
                            <PlanogramStoreComponent />
                            <PlanogramColorMapComponent />
                            <PlanogramProductDetail />
                            <PlanogramSettings />
                        </React.Fragment>
                    </MenuProvider>
                    <PlanogramMainContextMenu />
                </div>
            </DndProvider >
        );
    }
}
const colorMapStateToProps = (state: AppState, ownProps: any) => ({
    suppliersMap: state.system.data.suppliersMap,
    colorMap: state.planogram.virtualStore.colorMap,
    showColorMap: state.planogram.display.colorBy != null
})

const colorMapDispatchToProps = (dispatch: ThunkDispatch<AppState, any, AnyAction>) => ({

})
type PlanogramColorMapContainerProps = ReturnType<typeof colorMapStateToProps> & ReturnType<typeof colorMapDispatchToProps>
const PlanogramColorMapContainer: React.FC<PlanogramColorMapContainerProps> = (props) => {
    if (!props.showColorMap) return null;
    const { colorMap, suppliersMap } = props;
    const colorKeys = Object.keys(colorMap);
    return <Draggable
        cancel=".color-map-container"
        handle=".color-map-handle">
        <div className="planogram-color-map">
            <div className="color-map-handle">
                Color Map
            </div>
            <div className="color-map-container">
                {colorKeys.map(key => {
                    const color = colorMap[key];
                    const supplier = suppliersMap[Number(key)];
                    return <div className="color-row" key={"CM_" + key}>
                        <div className="color-row-value">
                            <div style={{ border: "1px solid black", width: "3em", minHeight: "1em", background: color }}></div>
                        </div>
                        <div className="color-row-label">{key === "none" || !supplier ? "אחר" : supplier.Name}</div>
                    </div>
                })}
            </div>
        </div>
    </Draggable>
}
const PlanogramColorMapComponent = connect(colorMapStateToProps, colorMapDispatchToProps)(PlanogramColorMapContainer)

export default withRouter(connect(mapStateToEditorProps, mapDispatchToEditorProps)(PlanogramEditor));