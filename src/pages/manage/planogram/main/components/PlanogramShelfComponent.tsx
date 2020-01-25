import React, { Component } from "react";
import { PlanogramDragDropTypes } from "./generic/DragAndDropType";
import PlanogramShelfItemComponent from "./PlanogramShelfItemComponent";


import { DropTarget, DragElementWrapper, DragSource } from 'react-dnd';
import { DragDropResultBase } from "./generic/DragDropWrapper";
import { PlanogramShelf, DimensionObject, PlacementObject, PlanogramElementId } from "shared/store/planogram/planogram.types";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { switchItemsAction, addProductAction, deleteItemAction, editShelfItemAction } from "shared/store/planogram/store/item/item.actions";
import { heightDensity, widthDensity, shelfItemDimensions } from "../../provider/calculation.service";
import { ItemPlacementModal } from "./modals/ItemPlacementModal";
import { editShelfDimensionsAction } from "shared/store/planogram/store/shelf/shelf.actions";
import { dimensionText, catalogProductDimensionObject } from "../../provider/planogram.service";
import { AppState } from "shared/store/app.reducer";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { Menu, contextMenu, MenuProvider } from "./generic/ContextMenu";

interface DropProps {
    connectDragSource?: DragElementWrapper<any>,
    isDragging?: boolean,
}

interface TargetProps {
    connectDropTarget?: DragElementWrapper<any>,
    canDrop?: boolean,
}

interface ShelfComponentProps {
    shelf: PlanogramShelf,
    shelfIndex: number;
    realDropTarget?: string,
    onDrop?: (item: DragDropResultBase) => any,
    onDragEnd?: (item: DragDropResultBase, targetItem: DragDropResultBase) => void,
    move?: (item: DragDropResultBase, targetItem: DragDropResultBase) => void,
    // move?: (currentIndex: number, targetIndex: number) => void,
    verifyDrop?: (droppedItem: DragDropResultBase) => boolean,
}


const DraggableSource = DragSource<ShelfComponentProps, DropProps>(
    PlanogramDragDropTypes.SHELF, {
    beginDrag(props, monitor) {
        const { shelf } = props;
        return ({
            type: PlanogramDragDropTypes.SHELF,
            payload: shelf,
        });
    },
    endDrag(props, monitor) {
        if (!monitor.didDrop()) {
            return;
        }
        if (props.onDragEnd)
            props.onDragEnd(monitor.getItem(), monitor.getDropResult());
    },
}, (connect, monitor, props) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
})
);

const dropTypes = [
    PlanogramDragDropTypes.PRODUCT_SIDEBAR,
    PlanogramDragDropTypes.SHELF_ITEM,
    PlanogramDragDropTypes.SHELF
];
const DroppableTarget = DropTarget<ShelfComponentProps, TargetProps>(dropTypes, {
    drop(props, monitor) {
        const { shelf } = props;
        if (props.onDrop)
            props.onDrop(monitor.getItem());
        return ({
            type: monitor.getItemType(),
            payload: shelf,
        });
    },
    canDrop(props, monitor) {
        if (monitor.didDrop() || !monitor.isOver({ shallow: true }))
            return false;
        return props.verifyDrop ? props.verifyDrop(monitor.getItem()) : true;
    },
}, (connect, monitor, props) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    position: monitor.getClientOffset(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    itemType: monitor.getItemType(),
}));

type ShelfProps = ShelfComponentProps & DropProps & TargetProps;

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        switchItems: (base: PlanogramElementId, remote: PlanogramElementId) => {
            dispatch(switchItemsAction(base, remote));
        },
        addProduct: (shelf: PlanogramElementId, product: CatalogBarcode, placement?: PlacementObject) => {
            dispatch(addProductAction(shelf, product, placement));
        },
        deleteItem: (shelf: PlanogramElementId, item: PlanogramElementId) => {
            dispatch(deleteItemAction(shelf, item))
        },
        editShelfDimensions: (shelf: PlanogramElementId, dimensions: DimensionObject) => {
            dispatch(editShelfDimensionsAction(shelf, dimensions))
        },
        editShelfItemPlacement: (item: PlanogramElementId, placement: PlacementObject) => {
            dispatch(editShelfItemAction(item, placement));
        }
        // editItemPlacement: (shelf: Shelf, item: Item, placment: PlacementObject)=>{
        //     dispatch(editItemPlacmentAction(shelf, item, placment))
        // }
    }
}
function mapStateToProps(state: AppState, ownProps: ShelfProps) {
    return {
        ...state.catalog,
        ...ownProps,
        shelvesDetails: state.planogram.virtualStore.shelfDetails,
        aisleShelves: state.planogram.virtualStore.shelfMap
    }
}
type PlanogramShelfComponentProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

class PlanogramShelfComponentContainer extends Component<PlanogramShelfComponentProps> {
    render() {
        const { canDrop, isDragging, connectDropTarget, connectDragSource, shelf,
            deleteItem,
            switchItems,
            addProduct,
            productsMap,
            shelfIndex: mainShelfIndex
        } = this.props;
        const { dimensions } = shelf;
        const { aisleShelves, shelvesDetails } = this.props;
        const shelfDetails = shelvesDetails[shelf.id];
        if (shelfDetails == null) {
            console.log("NO DETAILS SHELF: " + shelf.id);
            return null;
        }
        let { margin_bottom, display, combined } = shelfDetails;
        if (margin_bottom == null) margin_bottom = 0;
        if (display == null) display = true;
        if (combined == null) combined = [];

        const realWidth = dimensions.width + (display && combined.length > 0 ? combined.map(sh => {
            const aShelf = aisleShelves[sh];
            return aShelf.dimensions.width;
        }).reduce((a, b) => a + b) : 0);
        const combinedShelves = [shelf].concat(combined.map(id => aisleShelves[id]));
        const shelfItems = combinedShelves.map(sh => sh.items).reduce((p, c) => p.concat(c));
        const itemDimensions = shelfItems.map((item) => shelfItemDimensions(item.placement, catalogProductDimensionObject(productsMap[item.product])));
        const itemsWidth: number = shelfItems.length > 0 ? itemDimensions.map(d => d.width).reduce((p, c) => p + c) : 0;

        // let cursor = 0;
        let collectedShelfWidth = 0;
        let collectedItemsWidth = 0;
        let collectedMargins = 0;

        let nextMargin = 0;

        const element = (
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    height: dimensions.height ? heightDensity(dimensions.height) + "px" : "initial",
                    // width: realWidth ? widthDensity(realWidth) + "px" : "initial",
                    width: widthDensity(dimensions.width) + "px",
                    // marginBottom: widthDensity(margin_bottom) + "px"
                }}
                className={"planogram-shelf" + (canDrop ? " droppable" : "") + (isDragging ? " dragged" : "")}>
                {display ? <div style={{
                    display: display ? "inherit" : "none",
                }}>
                    {combinedShelves.map((shelf) => shelf.items.map((item) => {
                        const product = productsMap[item.product];
                        const productDimensions = catalogProductDimensionObject(product);
                        const itemDimensions = shelfItemDimensions(item.placement, productDimensions);
                        return <Menu id={"ed_" + item.id} key={"ed_" + item.id} className="planogram-context-window" >
                            <ItemPlacementModal
                                init={item.placement}
                                title={"Product: " + product.Name}
                                subtitle={"Barcode " + product.BarCode}
                                dimensions={productDimensions}
                                maxDimensions={{
                                    ...shelf.dimensions,
                                    width: realWidth - itemsWidth + itemDimensions.width,
                                }}
                                onSubmit={(placement) => {
                                    this.props.editShelfItemPlacement(item.id, placement);
                                    contextMenu.hideAll();
                                }} />
                        </Menu>
                    })
                    )}
                    {combinedShelves.map((shelf) => {
                        const _itemDimensions = shelf.items.map((item) => shelfItemDimensions(item.placement, catalogProductDimensionObject(productsMap[item.product])));
                        const itemsWidth: number = _itemDimensions.length > 0 ? _itemDimensions.map(d => d.width).reduce((p, c) => p + c) : 0;
                        const shelfWidth = shelf.dimensions.width;

                        const currentMargin = nextMargin;

                        collectedShelfWidth += shelfWidth;
                        collectedItemsWidth += itemsWidth;

                        if (collectedShelfWidth - collectedItemsWidth - collectedMargins > 0) {
                            nextMargin = collectedShelfWidth - collectedItemsWidth - collectedMargins;
                            collectedMargins += nextMargin;
                        }
                        else
                            nextMargin = 0;
                        // console.log("SH:" + shelf.id, nextMargin);

                        return <div
                            className="shelf-container"
                            key={"sh_ed_" + shelf.id}
                            style={{
                                marginLeft: (widthDensity(currentMargin)) + "px"
                            }}>
                            {shelf.items.map((item, i) => <MenuProvider
                                id={"ed_" + item.id}
                                style={{
                                    zIndex: 15 + 100 * mainShelfIndex
                                }}
                                key={item.id}>
                                <PlanogramShelfItemComponent
                                    item={item}
                                    shelf={shelf}
                                    shelfHeight={dimensions.height}
                                    onEndDrag={(source, target) => {
                                        if (target.type === PlanogramDragDropTypes.TRASH) {
                                            console.log("TRASHING", item);
                                            deleteItem(shelf.id, item.id);
                                        }
                                    }}
                                    // editItem={() => this.createNewItem(item)}
                                    onDrop={(dropItem) => {
                                        if (dropItem.type === PlanogramDragDropTypes.SHELF_ITEM) {
                                            if (item.id === dropItem.payload.id)
                                                return;
                                            switchItems(item.id, dropItem.payload.id);
                                        }
                                        // else if (dropItem.type === PlanogramDragDropTypes.PRODUCT || dropItem.type === PlanogramDragDropTypes.PRODUCT_SIDEBAR) {
                                        //     addProduct(shelf.id, dropItem.payload, item.placement);
                                        // }
                                    }}
                                />
                            </MenuProvider>
                            )}</div>
                    })}
                </div> : null}
                {dimensions ? <div className="shelf-dimensions" style={{
                    zIndex: 50 + 100 * mainShelfIndex,
                }}>
                    {dimensionText(dimensions)}
                </div> : ""}
                <div className="shelf-structure" style={{
                    // display: display ? "inherit" : "none",
                    zIndex: 10 + 100 * mainShelfIndex,
                    // width: realWidth ? widthDensity(realWidth) + "px" : "initial",
                }}></div>
            </div>
        )

        return connectDragSource && connectDropTarget ? connectDragSource(connectDropTarget(element)) : element;
    }
}
export const PlanogramShelfComponent = connect(mapStateToProps, mapDispatchToProps)(PlanogramShelfComponentContainer);
export const PlanogramShelfDnd = DraggableSource(DroppableTarget(PlanogramShelfComponent));
