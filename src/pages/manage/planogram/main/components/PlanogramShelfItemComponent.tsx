import React, { Component } from "react";
import { PlanogramDragDropTypes } from "./generic/DragAndDropType";

import { DropTarget, DragElementWrapper, DragSource } from 'react-dnd';
import { DragDropResultBase } from "./generic/DragDropWrapper";
import { PlanogramItem, PlacementObject, DimensionObject, PlanogramShelf, PlanogramElementId } from "shared/store/planogram/planogram.types";
import { connect } from "react-redux";
import { heightDensity, widthDensity } from "../../provider/calculation.service";
import { productPredictedSales } from "shared/api/planogram.provider";
import { DimensionModal } from "./modals/DimensionModal";

import * as planogramApi from 'shared/api/planogram.provider';
import { AppState } from "shared/store/app.reducer";
import { editProductDimensions, setWeeklySale } from "shared/store/catalog/catalog.action";
import { catalogProductDimensionObject } from "../../provider/planogram.service";
import { Dispatch } from "redux";
import { setProductDetailer, hideProductDetailer, setColorBy } from "shared/store/planogram/planogram.actions";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { ThunkDispatch } from "redux-thunk";
import config from "shared/config";

import noImage from "assets/images/no-image.jpg"
import { editShelfItemAction } from "shared/store/planogram/store/item/item.actions";
import { uiNotify } from "shared/components/Toast";
import { contextMenu, Menu } from "./generic/ContextMenu";
import { ItemMaxPlacement } from "shared/store/planogram/planogram.defaults";
import { barcodeImageSrc } from "./generic/BarcodeImage";

interface SourceCollectProps {
    connectDragSource: DragElementWrapper<any>,
    isDragging: boolean,
}

interface TargetCollectProps {
    connectDropTarget: DragElementWrapper<any>,
    canDrop: boolean,
}

interface PlanogramItemComponentProps {
    item: PlanogramItem,
    shelf: PlanogramShelf,
    shelfHeight: number | null,
    editItem?: () => void,
    onEndDrag?: (item: DragDropResultBase, targetItem: DragDropResultBase) => void,
    onDrop?: (item: DragDropResultBase) => void,
    move?: (item: DragDropResultBase, targetItem: DragDropResultBase) => void,
    remove?: (item: DragDropResultBase) => void
}

const DraggableSource = DragSource<PlanogramItemComponentProps, SourceCollectProps & SourceCollectProps>(
    PlanogramDragDropTypes.SHELF_ITEM, {
    beginDrag(props, monitor) {
        const { item } = props;
        return ({
            type: PlanogramDragDropTypes.SHELF_ITEM,
            payload: item,
        });
    },
    endDrag(props, monitor) {
        if (!monitor.didDrop())
            return;
        if (props.onEndDrag)
            props.onEndDrag(monitor.getItem(), monitor.getDropResult());
    },
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}));

const dropTypes = [PlanogramDragDropTypes.SHELF_ITEM]

const DroppableTarget = DropTarget<PlanogramItemComponentProps, TargetCollectProps>(
    dropTypes, {
    drop(props, monitor) {
        const { item } = props;
        if (props.onDrop)
            props.onDrop(monitor.getItem());
        return ({
            type: dropTypes,
            payload: item,
        });
    }
}, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop() && monitor.isOver({ shallow: true }),
}));

type ItemProps = PlanogramItemComponentProps & SourceCollectProps & TargetCollectProps;
// type ItemState = {} & PlanogramItem;


type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type StateProps = ReturnType<typeof mapStateToProps>;

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        editShelfItemPlacement: (item: PlanogramElementId, placement: PlacementObject) => {
            dispatch(editShelfItemAction(item, placement));
        },
        updateProductDimensions: (barcode: number, dimensions: DimensionObject) => {
            dispatch(editProductDimensions(barcode, dimensions));
        },
        setProductDetailerDisplay: (barcode: CatalogBarcode) => {
            dispatch(setProductDetailer(barcode));
        },
        hideProductDisplayerBarcode: () => {
            dispatch(hideProductDetailer());
        },
    }
}
function mapStateToProps(state: AppState, ownProps: ItemProps) {
    const catalogProduct = state.catalog.productsMap[ownProps.item.product];
    return {
        ...ownProps,
        catalogProduct,
        productDetail: state.planogram.productDetails[ownProps.item.product],
        hoverProduct: state.planogram.display.productDetailer,
        hideShelfItems: state.planogram.display.hideShelfItems,
        showRowItems: state.planogram.display.showRowItems,
        markBadProducts: state.planogram.display.markBadProducts,
        supplierColor: catalogProduct ?
            state.planogram.virtualStore.colorMap[catalogProduct.SapakId || "none"] || state.planogram.virtualStore.colorMap["none"] : undefined,
        showColorSupplier: state.planogram.display.colorBy === "supplier"
    }
}

const StoreConnector = connect(mapStateToProps, mapDispatchToProps);

const pixelSideStack = 3;
const pixelTopStack = 3;

function rangeArray(num: number) {
    const list = [];
    for (let i = 1; i <= num; i++)
        list.push(i);
    return list;
}
class PlanogramShelfItemComponent extends Component<DispatchProps & StateProps> {
    keyboardTimeout?: NodeJS.Timeout;
    keyboardCollector = "";

    state = {
        dimensionMenu: false,
    }

    handleKeyboard = (e: KeyboardEvent) => {
        if (this.state.dimensionMenu) return;
        let value = parseInt(e.key);
        if (value >= 0 && value <= 9) {
            if (this.keyboardTimeout)
                clearTimeout(this.keyboardTimeout);
            this.keyboardCollector += value;
            this.keyboardTimeout = setTimeout(() => {
                const { item, catalogProduct } = this.props;
                let newFaces = parseInt(this.keyboardCollector);
                if (newFaces >= 1 && newFaces <= 20) {
                    this.props.editShelfItemPlacement(item.id, {
                        ...item.placement,
                        faces: newFaces
                    });
                    uiNotify(`Successfully updated faces for product: ${(catalogProduct && catalogProduct.Name) || item.product}`, "success")
                }
                this.keyboardCollector = "";
            }, 500)
        }
    }

    bindKeyboard = () => {
        window.addEventListener('keydown', this.handleKeyboard);
    }
    unBindKeyboard = () => {
        window.removeEventListener('keydown', this.handleKeyboard);
    }

    render() {
        let { placement, product, id } = this.props.item;
        const { shelf } = this.props;
        const {
            hideShelfItems,
            catalogProduct,
            hoverProduct,
            updateProductDimensions,
            editShelfItemPlacement,
            setProductDetailerDisplay,
            showRowItems,
            markBadProducts,
            showColorSupplier,
            supplierColor,
        } = this.props;
        if (hideShelfItems) return null;
        const productDimensions = catalogProductDimensionObject(catalogProduct);
        const { height: productHeight, width: productWidth } = productDimensions;

        const { connectDragSource, connectDropTarget, isDragging, canDrop } = this.props;
        const {
            stack,
            faces,
            row,
            manual_row_only
        } = placement;
        // const stackArray = Array.apply(null, Array(stack || 1));
        // const facesArray = Array.apply(null, Array(faces || 1));
        // const rowArray = Array.apply(null, Array(row || 1));

        let productHasDimensions = catalogProduct ? (catalogProduct.width && catalogProduct.height && catalogProduct.length) : true
        // let isProductMouseOver: NodeJS.Timeout | null;
        return connectDropTarget(connectDragSource(
            <div
                className={"planogram-shelf-item" + (canDrop ? " droppable" : "") + (hoverProduct === product ? " active" : "")}
                onClick={(e) => {
                    e.stopPropagation();
                    setProductDetailerDisplay(product);
                }}
                onMouseOver={(e) => {
                    this.bindKeyboard();
                }}
                onMouseOut={(e) => {
                    // hideProductDisplayerBarcode();
                    this.unBindKeyboard();
                }}
                onDoubleClick={e => {
                    e.stopPropagation();
                    contextMenu.show({
                        id: "pde_" + id + "_" + catalogProduct.BarCode,
                        event: e
                    });
                }}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                }}>
                {!productHasDimensions && markBadProducts ? <div className="shelf-item-cover" style={{
                    backgroundColor: "rgba(255,0,0,0.8)"
                }}></div> : (showColorSupplier && supplierColor ? <div className="shelf-item-cover" style={{
                    backgroundColor: supplierColor,
                    opacity: 0.8
                }}></div> : null)}
                <Menu
                    onHidden={() => this.setState({ dimensionMenu: false })}
                    onShown={() => this.setState({ dimensionMenu: true })}
                    id={"pde_" + id + "_" + catalogProduct.BarCode}
                    className="planogram-context-window" >
                    <DimensionModal
                        init={productDimensions}
                        title={"Product Dimensions " + catalogProduct.Name}
                        subtitle={"Barcode " + catalogProduct.BarCode}
                        // maxDimensions={maxDimensions}
                        // minDimensions={minDimensions}
                        onSubmit={(dimensions) => {
                            planogramApi.updateProductDimensions(catalogProduct.BarCode, dimensions).then((res) => {
                                updateProductDimensions(
                                    catalogProduct.BarCode,
                                    dimensions);
                                if (!placement.manual_row_only)
                                    editShelfItemPlacement(id, {
                                        faces,
                                        stack,
                                        row: Math.floor(shelf.dimensions.depth / dimensions.depth),
                                        manual_row_only
                                    })
                                uiNotify("Edited product successfully.", "success");
                                contextMenu.hideAll();
                            }).catch((err) => {
                                console.error(err);
                                uiNotify("Unable to edit product dimensions.", "error");
                                contextMenu.hideAll();
                            });
                        }} />
                </Menu>
                {rangeArray(faces <= ItemMaxPlacement.faces ? faces : ItemMaxPlacement.faces).map((s, i) => (
                    <div
                        style={{
                            // marginRight: -16,
                        }}
                        className="shelf-item-stack"
                        key={id + "_" + i}>
                        {rangeArray(stack <= ItemMaxPlacement.stack ? stack : ItemMaxPlacement.stack).map((v, _i) => (
                            <div
                                className="shelf-item-product"
                                style={{
                                    width: widthDensity(productWidth),
                                    height: heightDensity(productHeight),
                                    // marginTop: -12
                                }}
                                key={id + "_" + i + "_" + _i}>
                                {showRowItems ? rangeArray(row <= ItemMaxPlacement.row ? row : ItemMaxPlacement.row).map((r, __i) => {
                                    // if (__i === 0)
                                    return <img
                                        style={{
                                            zIndex: 300 - (__i),
                                            // transform: "translate("+(__i * pixelSideStack) + "px,"+(-__i * pixelTopStack) + "px)"
                                            left: (__i * pixelSideStack) + "px",
                                            bottom: (__i * pixelTopStack) + "px",
                                        }}
                                        alt=""
                                        onError={e => {
                                            e.currentTarget.src = noImage;
                                        }}
                                        src={barcodeImageSrc(catalogProduct.BarCode)}
                                        key={id + "_" + i + "_" + _i + "_" + __i}
                                    />
                                    // return <div
                                    //     key={id + "_" + i + "_" + _i + "_" + __i}
                                    //     style={{
                                    //         position: "absolute",
                                    //         width: widthDensity(productWidth),
                                    //         height: heightDensity(productHeight),
                                    //         // borderRight: "1px dashed #fafafa",
                                    //         // borderTop: "1px dashed #fafafa",
                                    //         background:"rgba(0,0,0,0.2)",
                                    //         zIndex: 300 - (__i),
                                    //         // transform: "translate("+(__i * pixelSideStack) + "px,"+(-__i * pixelTopStack) + "px)"
                                    //         left: (__i * pixelSideStack) + "px",
                                    //         bottom: (__i * pixelTopStack) + "px",
                                    //     }} />
                                }) : (<img
                                    style={{
                                        zIndex: 300 - (0),
                                        // transform: "translate("+(__i * pixelSideStack) + "px,"+(-__i * pixelTopStack) + "px)"
                                        left: (0 * pixelSideStack) + "px",
                                        bottom: (0 * pixelTopStack) + "px",
                                    }}
                                    alt=""
                                    onError={e => {
                                        e.currentTarget.src = noImage;
                                    }}
                                    src={barcodeImageSrc(catalogProduct.BarCode)}
                                    key={id + "_" + i + "_" + _i + "_" + 0}
                                />)}
                            </div>
                        ))}
                    </div>
                ))}
                <ActiveProductTag key={"tag_" + id} barcode={catalogProduct.BarCode} />
            </div>
        ));
    }
}

type ActiveProductTagComponentProps = { barcode: number }
const activeProductTagMapStateToProps = (state: AppState, ownProps: ActiveProductTagComponentProps) => ({
    ...ownProps,
    branch_id: state.planogram.store ? state.planogram.store.branch_id : "",
    weeklySale: state.catalog.productSales[ownProps.barcode] ? state.catalog.productSales[ownProps.barcode].weekly : undefined,
    amount: state.planogram.productDetails[ownProps.barcode] ? state.planogram.productDetails[ownProps.barcode].maxAmount : 0
})

const activeProductTagMapDispatchToProps = (dispatch: ThunkDispatch<AppState, any, any>) => ({
    setWeeklySale: (barcode: number, weeklySale: number | null) => dispatch(setWeeklySale(barcode, weeklySale))
})

class ActiveProductTagComponent extends Component<ReturnType<typeof activeProductTagMapStateToProps> & ReturnType<typeof activeProductTagMapDispatchToProps>> {
    isActive = false;
    componentDidMount() {
        if (this.props.weeklySale === undefined) {
            this.isActive = true;
            productPredictedSales(this.props.barcode, this.props.branch_id).then((saleItem) => {
                if (this.isActive && saleItem != null)
                    this.props.setWeeklySale(this.props.barcode, saleItem.WeeklyAverage);
            }).catch((err) => {
                console.error(err);
            });
        }
    }
    componentWillUnmount() {
        this.isActive = false;
    }
    render() {
        const { amount, weeklySale } = this.props;
        /*Barak 9/1/2020 - Remove old coloring rule *
        let status = false;
        if (weeklySale != null && Math.round(weeklySale) >= amount)
            status = true;
        return (
            <div className={"shelf-item-tag " + (status ? "good" : "bad")}>
                {(weeklySale != null ? Math.round(weeklySale) : "~")}
                /
            {amount}
            </div>
        )
        ****************************************/
        /*Barak 9/1/2020 - Change coloring rule */
        let colorTag: string = 'good';
        let sale: number = 0;
        if (weeklySale != null) {
            sale = Math.round(weeklySale);
        }
        let result = sale / amount;
        if (result < 0.8) colorTag = 'good';
        if (result >= 0.8 && result <= 1.2) colorTag = 'middleColor';
        if (result > 1.2) colorTag = 'bad';

        return (
            <div className={"shelf-item-tag " + (colorTag)}>
                {(weeklySale != null ? Math.round(weeklySale) : "~")}
                /
            {amount}
            </div>
        )
        /****************************************/
    }
}
const ActiveProductTag = connect(activeProductTagMapStateToProps, activeProductTagMapDispatchToProps)(ActiveProductTagComponent);
export default DraggableSource(DroppableTarget(StoreConnector(PlanogramShelfItemComponent)));
