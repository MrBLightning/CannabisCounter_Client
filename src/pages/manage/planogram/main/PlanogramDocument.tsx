import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'shared/store/app.reducer'
import { withRouter, RouteComponentProps } from 'react-router'
import { useGesture } from "react-use-gesture"
import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'
import { TextBox, Button, SelectBox, NumberBox } from 'devextreme-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faCheck, faArrowCircleLeft, faSearch, faEdit } from '@fortawesome/free-solid-svg-icons'
import { CatalogBarcode, CatalogProduct } from 'shared/interfaces/models/CatalogProduct'
import * as planogramApi from 'shared/api/planogram.provider'
import { setStore } from 'shared/store/planogram/store/store.actions'
import { PlanogramStore, PlanogramElementId, PlacementObject, PlanogramItem, PlanogramShelf } from 'shared/store/planogram/planogram.types'
import { uiNotify } from 'shared/components/Toast'
import { BarcodeImage } from './components/generic/BarcodeImage'
import { addProductAction, deleteItemAction, editShelfItemAction } from 'shared/store/planogram/store/item/item.actions'
import { GroupSection } from 'shared/store/planogram/virtualize/virtualize.reducer'

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps<{
    store_id: string
}>) => ({
    ...ownProps,
    storeId: state.planogram.store ? state.planogram.store.store_id : null,
    sectionGroups: state.planogram.virtualStore.sectionGroups.groupList
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, any, AnyAction>) => ({
    setStore: (store: PlanogramStore) => dispatch(setStore(store)),
    addBarcodeToShelf: (shelfId: PlanogramElementId, barcode: CatalogBarcode, placement?: PlacementObject) =>
        dispatch(addProductAction(shelfId, barcode, placement)),
    updateShelfItem: (item: PlanogramElementId, placement: PlacementObject, barcode?: CatalogBarcode) =>
        dispatch(editShelfItemAction(item, placement, barcode))
})

const highlightOnFocus = (e: any) => {
    if (e.event && e.event.srcElement)
        e.event.srcElement.select();
};

type PlanogramDocumentComponentProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
class PlanogramDocumentComponent extends Component<PlanogramDocumentComponentProps> {
    state = {
        loading: false,
        stage: "position",
        selectedGroup: "",
        selectedShelf: "",
        selectedItem: "",
        barcode: "",
        faces: 1,
        stack: 1,
        row: 1,
        manual_row_only: 0
    }
    componentDidMount() {
        const { match, history, setStore } = this.props;
        const storeId = match.params.store_id;
        planogramApi.fetchPlanogramStore(storeId).then((store) => {
            if (store == null)
                return history.push('/planogram', {
                    error: "Store was not found"
                });
            setStore(store);
        }).catch((err) => {
            console.error(err);
            history.push('/planogram', {
                error: "Error getting planogram"
            });
        });
    }
    setStage = (stage: string) => {
        this.setState({
            stage
        })
    }
    addBarcode = () => {
        const { storeId, addBarcodeToShelf } = this.props;
        if (storeId == null) return;
        const { selectedShelf, barcode, faces, stack, row, manual_row_only } = this.state;
        const numberBarcode = parseInt(barcode);
        const placement = {
            faces,
            stack,
            row,
            manual_row_only
        };
        this.setState({
            loading: true
        });
        planogramApi.addShelfItem(storeId, selectedShelf, barcode, placement).then(() => {
            addBarcodeToShelf(selectedShelf, numberBarcode, placement);
            this.setState({
                loading: false,
                barcode: "",
                selectedItem: "",
                faces: 1,
                stack: 1,
                row: 1,
                manual_row_only: 0
            });
        }).catch(err => {
            console.error(err);
            this.setState({
                loading: false
            });
            uiNotify("Unable to add item into shelf.");
        });
    }
    updateItem = (shelfItemId: PlanogramElementId) => {
        const { storeId, updateShelfItem } = this.props;
        if (storeId == null) return;
        const { selectedShelf, barcode, faces, stack, row, manual_row_only} = this.state;
        const placement = {
            faces,
            stack,
            row,
            manual_row_only
        };
        this.setState({
            loading: true
        });
        planogramApi.updateShelfItem(storeId, shelfItemId, selectedShelf, placement, barcode).then(() => {
            let parsedBarcode = barcode ? parseInt(barcode) : undefined;
            updateShelfItem(shelfItemId, placement, parsedBarcode);
            this.setState({
                loading: false,
                barcode: "",
                selectedItem: "",
                faces: 1,
                stack: 1,
                row: 1,
                manual_row_only: 0
            });
        }).catch(err => {
            console.error(err);
            this.setState({
                loading: false
            });
            uiNotify("Unable to add item into shelf.", "error", 8000);
        });
    }
    render() {
        const { stage, loading } = this.state;
        const { storeId } = this.props;
        if (storeId == null || loading)
            return <div className="planogram-document loader"></div>
        let stageElement = null;
        if (stage === "position")
            stageElement = <DocumentStagePosition
                storeId={storeId}
                setState={(state) => this.setState(state)}
                selectedGroup={this.state.selectedGroup}
                selectedShelf={this.state.selectedShelf}
            />
        else if (stage === "barcode")
            stageElement = <DocumentStageBarcode
                addBarcode={this.addBarcode}
                updateItem={this.updateItem}
                storeId={storeId}
                setState={(state) => this.setState(state)}
                barcode={this.state.barcode}
                selectedShelf={this.state.selectedShelf}
                selectedItem={this.state.selectedItem}
                faces={this.state.faces}
                stack={this.state.stack}
                row={this.state.row}
                manual_row_only={this.state.row}
            />

        return <div className="planogram-document">
            <div className="container">
                <div className="actions">
                    {stage === "barcode" ?
                        <Button
                            style={{ padding: "0.5em", float: "left" }}
                            onClick={() => this.setStage("position")}>
                            <FontAwesomeIcon icon={faArrowCircleLeft} />
                            <span style={{ marginRight: "0.5em" }}>בחירת מיקום</span>
                        </Button>
                        : null}
                </div>
                {stageElement}
            </div>
        </div>
    }
}

type StageComponentBaseProps = { storeId: number, setState: (state: any) => void };

const positionStageMapState = (state: AppState, ownProps: StageComponentBaseProps & {
    selectedGroup: string,
    selectedShelf: string,
}) => ({
    ...ownProps,
    sectionGroups: state.planogram.virtualStore.sectionGroups.groupList.map(v => state.planogram.virtualStore.sectionGroups.groupMap[v]).filter(v => v != null),
    groupMap: state.planogram.virtualStore.sectionGroups.groupMap,

});

class DocumentStagePositionComponent extends Component<ReturnType<typeof positionStageMapState>> {
    render() {
        const { groupMap, sectionGroups } = this.props;
        const { selectedGroup, selectedShelf } = this.props;
        const shelfList: string[] | null = groupMap[selectedGroup] ? groupMap[selectedGroup].shelves : null;
        return (
            <div className="stage-position">
                <h1>סריקת מיקום</h1>
                <div className="input-row">
                    <div className="row-label" placeholder="קוד מיקום המצויין בחנות...">קוד מיקום: </div>
                    <SelectBox
                        rtlEnabled
                        items={this.props.sectionGroups}
                        value={selectedGroup}
                        onValueChanged={(e) => this.props.setState({ selectedGroup: e.value, selectedShelf: "" })}
                        valueExpr="group_id"
                        displayExpr={(item?: GroupSection) => item && `${item.group_id} - ${item.aisle_name || item.aisle}`}
                        className="row-input"
                        placeholder="הכנס מיקום בחנות..." />
                </div>
                <div className="input-row">
                    <div className="row-label">מדף: </div>
                    <SelectBox
                        rtlEnabled
                        disabled={shelfList == null || shelfList.length === 0}
                        value={selectedShelf}
                        displayExpr="title"
                        valueExpr="shelf_id"
                        onValueChanged={(e) => this.props.setState({ selectedShelf: e.value })}
                        className="row-input"
                        placeholder="בחירת מדף..."
                        items={shelfList ? shelfList.map((pid, i) => ({ shelf_id: pid, title: "מדף " + (i + 1) })) : []}
                    />
                </div>
                <div className="input-row">
                    <Button
                        rtlEnabled
                        className="row-input"
                        disabled={!selectedGroup || !selectedShelf}
                        style={{ width: "100%" }}
                        onClick={() => this.props.setState({ stage: "barcode" })} >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <span style={{ marginRight: "1em" }}>הכנס פריטים</span>
                    </Button>
                </div>
            </div>
        )
    }
}
const DocumentStagePosition = connect(positionStageMapState)(DocumentStagePositionComponent);


type DocumentStageBarcodeOwnProps = {
    barcode?: string,
    faces: number,
    stack: number,
    row: number,
    manual_row_only: number,
    selectedShelf: PlanogramElementId,
    selectedItem?: PlanogramElementId,
    addBarcode: () => void,
    updateItem: (shelfItemId: PlanogramElementId) => void
};
const barcodeMapStateToProps = (state: AppState, ownProps: StageComponentBaseProps & DocumentStageBarcodeOwnProps) => ({
    ...ownProps,
    catalogMap: state.catalog.productsMap,
    store: state.planogram.store,
    shelf: state.planogram.virtualStore.shelfMap[ownProps.selectedShelf] ? state.planogram.virtualStore.shelfMap[ownProps.selectedShelf] : null,
    shelfMap: state.planogram.virtualStore.shelfMap,
    shelfDetails: state.planogram.virtualStore.shelfDetails[ownProps.selectedShelf] ? state.planogram.virtualStore.shelfDetails[ownProps.selectedShelf] : null
});
const barcodeMapDispatchToProps = (dispatch: ThunkDispatch<AppState, any, any>) => ({
    deleteShelfItem: (shelfId: PlanogramElementId, itemId: PlanogramElementId) =>
        dispatch(deleteItemAction(shelfId, itemId))
})

type DocumentStageBarcodeProps = ReturnType<typeof barcodeMapStateToProps> & ReturnType<typeof barcodeMapDispatchToProps>;
class DocumentStageBarcodeComponent extends Component<DocumentStageBarcodeProps> {
    barcodeInputRef = createRef<TextBox>();
    facesInputRef = createRef<NumberBox>();
    shelfContainerRef = createRef<HTMLDivElement>();
    insertBarcode = () => {
        const { catalogMap, barcode, selectedShelf, selectedItem } = this.props;
        if (barcode == null)
            return uiNotify("Barcode empty", "error", 8000);
        const barcodeNumber = parseInt(barcode);
        if (!catalogMap[barcodeNumber.toString()])
            return uiNotify("Barcode does not exist.", "error", 8000);
        // const shelf = shelfMap[selectedShelf];
        // const item = shelf ? shelf.items.find(item => item.product === barcodeNumber) : null;
        if (selectedItem)
            this.props.updateItem(selectedItem);
        else
            this.props.addBarcode();
        this.focusBarcodeInput();
    }
    componentDidMount() {
        if (this.shelfContainerRef.current)
            this.shelfContainerRef.current.scrollLeft = this.shelfContainerRef.current.scrollWidth;
        this.focusBarcodeInput();
    }
    focusBarcodeInput = () => {
        if (this.barcodeInputRef.current != null)
            this.barcodeInputRef.current.instance.focus();
    }
    deleteBarcode = (shelfId: PlanogramElementId, shelfItemId: PlanogramElementId) => {
        const { storeId, deleteShelfItem } = this.props; //deleteShelfItem
        if (storeId == null) return;
        planogramApi.deleteShelfItem(storeId, shelfItemId).then(() => {
            deleteShelfItem(shelfId, shelfItemId)
            this.setState({
                loading: false,
                barcode: "",
                faces: 1,
                stack: 1,
                row: 1,
                manual_row_only: 0
            });
        }).catch(err => {
            console.error(err);
            this.setState({
                loading: false
            });
            uiNotify("Unable to delete shelf item.", "error", 8000);
        })
    }
    render() {
        const { barcode, catalogMap, shelf, shelfDetails, shelfMap, selectedItem } = this.props;
        if (!shelf) return null;
        let product = barcode ? catalogMap[barcode] || catalogMap[parseInt(barcode)] : null;
        let items: PlanogramItem[] = [];
        if (shelf && shelfDetails)
            items = [shelf.id, ...shelfDetails.combined].map(v => shelfMap[v] ? shelfMap[v].items : []).reduce((p, c) => p.concat(c));
        else items = shelf ? shelf.items : [];
        if (product)
            setTimeout(() => {
                if (this.facesInputRef.current)
                    this.facesInputRef.current.instance.focus();
            }, 0);
        return (
            <div className="stage-barcode">
                <h1>סריקת ברקוד</h1>
                <h5>גונדולה: {}</h5>
                <div style={{ marginBottom: "1em" }}>
                    <div
                        ref={this.shelfContainerRef}
                        className="scroller horizontal"
                        style={{ display: "flex", overflowX: "auto", flexDirection: "row-reverse", paddingBottom: "0.5em" }}>
                        {items ? items.map(item => {
                            return <DocumentShelfItem
                                key={"ITEM_" + item.id}
                                item={item}
                                selectedItem={selectedItem}
                                shelf={shelf}
                                product={catalogMap[item.product]}
                                setState={(state: any) => this.props.setState(state)}
                                deleteBarcode={this.deleteBarcode} />
                        }) : null}
                    </div>
                </div>
                <div className="input-row" style={{ display: "flex" }}>
                    <TextBox
                        tabIndex={1}
                        style={{ flex: 1 }}
                        ref={this.barcodeInputRef}
                        rtlEnabled
                        value={this.props.barcode}
                        // onEnterKey={(e) => {
                        //     if (this.facesInputRef.current)
                        //         this.facesInputRef.current.instance.focus();
                        // }}
                        onFocusIn={highlightOnFocus}
                        onValueChanged={e => this.props.setState({ barcode: e.value })}
                        // valueChangeEvent="keyup"
                        className="row-input"
                        placeholder="נא לסרוק ברקוד..." />
                    <Button
                        className="row-input">
                        <FontAwesomeIcon icon={faSearch} />
                    </Button>
                </div>
                {product != null ? <div className="barcode-data" style={{ borderTop: "1px solid #dedede" }}>
                    <div style={{ float: "left", width: "60px" }}>
                        <BarcodeImage barcode={product.BarCode} />
                    </div>
                    <h3 style={{ marginBottom: "0.2em" }}>{product != null ? product.BarCode + " - " + product.Name : barcode}</h3>
                    {product.Archives != null && product.Archives == 1 ?
                        <div style={{
                            width: "100%",
                            color: "#fafafa",
                            background: "red",
                            padding: "0.5em"
                        }}>מוצר ארכיון!</div>
                        : null}
                    <div style={{ display: "flex", width: "100%", marginBottom: "0.2em" }}>
                        <div style={{ flex: 1, }}>
                            <div>פייסים</div>
                            <NumberBox
                                ref={this.facesInputRef}
                                onFocusIn={highlightOnFocus}
                                tabIndex={2}
                                rtlEnabled
                                min={1}
                                step={1}
                                width="100%"
                                onValueChanged={(e) => {
                                    if (e.value > 20 || e.value <= 0)
                                        return uiNotify("כמות פייסים לא תקנית.");

                                    this.props.setState({ faces: e.value })
                                }}
                                value={this.props.faces}
                                className="row-input" />
                        </div>
                        <div style={{ flex: 1, }}>
                            <div>ערימה</div>
                            <NumberBox
                                onFocusIn={highlightOnFocus}
                                tabIndex={3}
                                rtlEnabled
                                min={1}
                                step={1}
                                width="100%"
                                onValueChanged={(e) => {
                                    if (e.value > 20 || e.value <= 0)
                                        return uiNotify("כמות ערימה לא תקנית.");
                                    this.props.setState({ stack: e.value })
                                }}
                                value={this.props.stack}
                                className="row-input" />
                        </div>
                    </div>
                </div> : null}
                <div className="input-row">
                    <Button
                        tabIndex={3}
                        useSubmitBehavior={true}
                        rtlEnabled
                        style={{ width: "100%" }}
                        disabled={product == null}
                        className="row-input"
                        onClick={this.insertBarcode}>

                        <FontAwesomeIcon icon={selectedItem ? faEdit : faCheck} />
                        <span style={{ marginRight: "1em" }}>{selectedItem ? "עדכן ברקוד קיים" : "הוסף ברקוד"}</span>
                    </Button>
                </div>
            </div>
        )
    }
}
const DocumentStageBarcode = connect(barcodeMapStateToProps, barcodeMapDispatchToProps)(DocumentStageBarcodeComponent);


type DocumentShelfItemProps = {
    item: PlanogramItem,
    shelf: PlanogramShelf,
    product?: CatalogProduct,
    selectedItem?: string,
    setState: Function,
    deleteBarcode: (shelfId: PlanogramElementId, itemId: PlanogramElementId) => void
};
class DocumentShelfItem extends Component<DocumentShelfItemProps> {
    pressTimer: NodeJS.Timeout | null = null;
    holdBegin = (e: any) => {
        if (e.type === "click" && e.button !== 0)
            return;
        this.pressTimer = setTimeout(() => {
            const { item, shelf, deleteBarcode } = this.props;
            if (!shelf || !window.confirm("Are you sure you want to delete?"))
                return;
            deleteBarcode(shelf.id, item.id);
        }, 1500);
    }
    holdEnd = (e: any) => {
        if (this.pressTimer) {
            clearTimeout(this.pressTimer);
            this.pressTimer = null;
        }
    }
    onClick = (e: any) => {
        this.holdEnd(e);
        const { item, selectedItem, product } = this.props;
        if (selectedItem === item.id)
            this.props.setState({
                selectedItem: ""
            })
        else
            this.props.setState({
                selectedItem: item.id,
                barcode: item.product + "",
                ...item.placement
            })
    }
    shouldComponentUpdate(nextProps: DocumentShelfItemProps) {
        if (nextProps.selectedItem !== this.props.selectedItem)
            return true;
        if (nextProps.item.product !== this.props.item.product)
            return true;
        if (nextProps.item.placement.faces !== this.props.item.placement.faces
            || nextProps.item.placement.stack !== this.props.item.placement.stack)
            return true;
        return false;
    }
    render() {
        const { item, shelf } = this.props;
        const { selectedItem, product } = this.props;
        return (<div
            onMouseDown={this.holdBegin}
            onTouchStart={this.holdBegin}
            onMouseOut={this.holdEnd}
            onTouchEnd={this.holdEnd}
            onTouchCancel={this.holdEnd}
            onClick={this.onClick}
            key={item.id}
            className="noselect"
            style={{
                maxWidth: "100px",
                display: "flex",
                flexFlow: "column",
                alignContent: "center",
                alignItems: "center",
                fontSize: "0.8em",
                border: "1px solid #dadada",
                color: selectedItem === item.id ? "#ECF0F1" : "inherit",
                background: selectedItem === item.id ? "#00A69A" : "none"
            }}>
            <div style={{ padding: "0.2em", fontSize: "1em", fontWeight: "bold" }}>{product ? product.BarCode : item.product}</div>
            <div style={{ display: "flex" }}>
                <div className="input-row" style={{ flex: 1, display: "flex", padding: "0.3em", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "0.7em" }}>פייסים</div>
                    <div style={{ fontWeight: "bold" }}>{item.placement.faces}</div>
                </div>
                <div className="input-row" style={{ flex: 1, display: "flex", padding: "0.3em", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "0.7em" }}>ערימה</div>
                    <div style={{ fontWeight: "bold" }}>{item.placement.stack}</div>
                </div>
            </div>
            <div style={{ width: "60px", height: "60px" }}>
                <BarcodeImage barcode={item.product} style={{ maxHeight: "60px", width: "auto" }} />
            </div>
        </div>
        )
    }
}


export const PlanogramDocument = withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanogramDocumentComponent));
