import React, { Component, ComponentProps, ComponentPropsWithoutRef } from 'react'
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { AppState } from 'shared/store/app.reducer'
import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'
import { setStore } from 'shared/store/planogram/store/store.actions'
import { fetchPlanogramStore, productsPredictedSales } from 'shared/api/planogram.provider'
import { PlanogramStore } from 'shared/store/planogram/planogram.types'
import { ProductDefaultDimensions } from 'shared/store/planogram/planogram.defaults'
import config from 'shared/config'
import { setDisplayAisle } from 'shared/store/planogram/planogram.actions'
import { DndProvider } from 'react-dnd'
import { isMobile } from 'react-device-detect'
import PlanogramSidebar from './PlanogramSidebar'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { PlanogramShelfComponent } from './components/PlanogramShelfComponent';
import { widthDensity, heightDensity } from '../provider/calculation.service';
import { ProductSaleMap } from 'shared/store/catalog/catalog.types';
import { setWeeklySaleButch } from 'shared/store/catalog/catalog.action';
import { CatalogBarcode } from 'shared/interfaces/models/CatalogProduct';
import { deepExtractKey } from 'shared/store/planogram/virtualize/deep-extract';
import { PLANOGRAM_BASE_URL } from '../PlanogramScreen';
import PlanogramProductDetail from './components/PlanogramProductDetail';

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps<{
    store_id: string
}>) => ({
    ...ownProps,
    productMap: state.catalog.productsMap,
    products: state.catalog.products,
    store: state.planogram.store,
    aisle: state.planogram.store != null && state.planogram.display.aisleIndex != null ? state.planogram.store.aisles[state.planogram.display.aisleIndex] : null,
    selectedAisle: state.planogram.display.aisleIndex,
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({
    // setStore: (store: PlanogramStore) => dispatch(setStore(store)),
    setStore: (store: PlanogramStore) => dispatch(async (dispatch, getState) => {
        const barcodes: CatalogBarcode[] = deepExtractKey(store, "product");
        try {
            const sales = await productsPredictedSales(store.branch_id, barcodes);
            const salesMap: ProductSaleMap = {}
            for (let i = 0; i < sales.length; i++) {
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
    setDisplayAisle: (aisleIndex: number) => dispatch(setDisplayAisle(aisleIndex))
})

type PlanogramViewProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

export class PlanogramView extends Component<PlanogramViewProps> {
    containerRef = React.createRef<HTMLDivElement>();
    state = {
        containerHeight: 0,
        containerWidth: 0,
        searchFilter: ''
    }
    componentDidMount() {
        // const { history, match, setStore } = this.props;
        const { history, match, store } = this.props;
        const { params } = match;
        if (!params.store_id)
            return history.push(PLANOGRAM_BASE_URL);
        const storeId = params.store_id;
        this.loadStore(storeId);
        // fetchPlanogramStore(storeId || "").then((store) => {
        //     if (store == null)
        //         return history.push('/planogram', {
        //             error: "Store was not found"
        //         });
        //     setStore(store);
        // }).catch((err) => {
        //     console.error(err);
        //     history.push('/planogram');
        // });
        if (this.containerRef.current) {
            console.log(this.containerRef.current);

            this.setState({
                containerHeight: this.containerRef.current.clientHeight,
                containerWidth: this.containerRef.current.clientWidth,
            })
        }
    }
    loadStore = async (storeId: string) => {
        const { setStore, history } = this.props;
        try {
            const store = await fetchPlanogramStore(storeId);
            await setStore(store);
            this.setState({
                loading: false
            });
        } catch (error) {
            console.error(error);
            history.goBack();
        }
    }
    render() {
        const { store, aisle, selectedAisle, products, productMap } = this.props;
        if (store == null || aisle == null || products == null || products.length === 0)
            return (<div className="planogram-wrapper loader"></div>);

        let containerHeight = this.state.containerHeight;
        let containerWidth = this.state.containerWidth;

        /*Barak 2.1.20 - function to return a reversed array */
        function reverseArray(array:any[]):any[]{
            let myArray = [];
            let size = array.length;
            for(let i=size-1;i>=0;i--){
                myArray.push(array[i]);
            }
            return myArray;
        }

        return (
            <DndProvider backend={!isMobile ? HTML5Backend : TouchBackend}>
                <div className="planogram-wrapper">
                    <div className="planogram-component" style={{ overflow: "auto" }}>
                        <PlanogramSidebar noStructure />
                        <PlanogramProductDetail />
                        <div className="planogram-view">
                            <div className="planogram-float-toolbar">
                                <h1>{store.name || "Unamed Store"}</h1>
                                <h4>Aisle Selection</h4>
                                <input type="text" className="input" placeholder="חפש..." style={{ marginBottom: "0.5em" }} onChange={(e) => this.setState({ searchFilter: e.target.value })} />
                                {this.state.searchFilter === '' 
                                ? store.aisles.map((aisle, i) => (    
                                    <button key={"activated_" + aisle.aisle_id}
                                        className={"toolbar-button" + (selectedAisle === i ? " selected" : "")}
                                        onClick={(e) => this.props.setDisplayAisle(i)} >
                                        {aisle.name || "Aisle " + aisle.aisle_id}
                                    </button>
                                ))
                                : store.aisles.filter(aisle => aisle.name.toLowerCase().includes(this.state.searchFilter.toLowerCase())).map((aisle, i) => (    
                                    <button key={"activated_" + aisle.aisle_id}
                                        className={"toolbar-button" + (selectedAisle === aisle.index ? " selected" : "")}
                                        onClick={(e) => this.props.setDisplayAisle(aisle.index)} >
                                        {aisle.name || "Aisle " + aisle.aisle_id}
                                    </button>
                                ))
                                }
                            </div>
                            <div className="planogram-body" >
                                <TransformWrapper
                                    options={{
                                        limitToBounds: false,
                                        minScale: 0.1,
                                        // transformEnabled: false,
                                        maxScale: 20,
                                        // defaultScale: 0.4
                                    }}>
                                    <TransformComponent >
                                        <div style={{ minHeight: containerHeight, minWidth: containerWidth }}>
                                            <div className="planogram-container">
                                                <div className="planogram-handle">
                                                    {aisle.name}
                                                </div>
                                                <div
                                                    ref={(element) => {
                                                        if (element && (!containerHeight || !containerWidth))
                                                            this.setState({
                                                                containerWidth: window.innerWidth > element.clientWidth ? window.innerWidth : element.clientWidth,
                                                                containerHeight: window.innerHeight > element.clientHeight ? window.innerHeight : element.clientHeight,
                                                            })
                                                    }}
                                                    className="planogram-aisle"
                                                    style={{
                                                        minWidth: widthDensity(aisle.dimensions.width)
                                                    }}>
                                                    {aisle.sections.map((section, sectionIndex) => (
                                                        <div key={"rcc_" + section.id} className="planogram-section" style={{
                                                            width: widthDensity(section.dimensions.width),
                                                            height: heightDensity(section.dimensions.height),
                                                        }}>
                                                            <div className="section-title">
                                                                Section: {section.id}
                                                            </div>
                                                            <div className="planogram-section-container">
                                                                {/* Barak 2.1.20 - {section.shelves.map((shelf, shelf_index) => <PlanogramShelfComponent key={"C_"+shelf_index} shelf={shelf} shelfIndex={shelf_index} />)} */}
                                                                {/* Barak 2.1.20 second correction - {section.shelves.reverse().map((shelf, shelf_index) => <PlanogramShelfComponent key={"C_"+shelf_index} shelf={shelf} shelfIndex={shelf_index} />)} */}
                                                                {reverseArray(section.shelves).map((shelf, shelf_index) => <PlanogramShelfComponent key={"C_"+shelf_index} shelf={shelf} shelfIndex={shelf_index} />)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </TransformComponent>
                                </TransformWrapper>
                            </div>
                        </div>
                    </div>
                </div>
            </DndProvider >
        )
    }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanogramView))
