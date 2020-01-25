import React, { Component } from "react";
import { DropTarget, DragElementWrapper, DragSource } from 'react-dnd';
import { Action, AnyAction } from "redux";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { formatMessage } from 'devextreme/localization';

import { PlanogramDragDropTypes } from "./generic/DragAndDropType";
import { PlanogramShelfDnd } from "./PlanogramShelfComponent";
import { DragDropResultBase } from "./generic/DragDropWrapper";
import { DimensionObject, PlanogramSection, PlanogramShelf, PlanogramItem, PlanogramElementId } from "shared/store/planogram/planogram.types";
import { AppState } from "shared/store/app.reducer";
import { deleteShelfAction, switchShelvesAction, editShelfDimensionsAction } from "shared/store/planogram/store/shelf/shelf.actions";
import { toggleModal, setModal } from "shared/components/Modal";
import { addProductAction, duplicateItemAction, moveShelfItem } from "shared/store/planogram/store/item/item.actions";
import { widthDensity, heightDensity, shelfItemDimensions, shelfAvailableSpace, calculateShelvesHeight } from "../../provider/calculation.service";
import { dimensionText, validateDimensions, catalogProductDimensionObject } from "../../provider/planogram.service";
import { DimensionModal } from "./modals/DimensionModal";
import { ProductDefaultDimensions } from "shared/store/planogram/planogram.defaults";
import * as planogramApi from 'shared/api/planogram.provider';
import { editProductDimensions } from "shared/store/catalog/catalog.action";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { Menu, contextMenu, MenuProvider } from "./generic/ContextMenu";


interface SourceCollectProps {
    connectDragSource: DragElementWrapper<any>,
    isDragging: boolean,
}

interface TargetCollectProps {
    connectDropTarget: DragElementWrapper<any>,
    canDrop: boolean,
    isOver: boolean,
    isOverCurrent: boolean
}

export interface PlanogramSectionComponentProps {
    section: PlanogramSection,
    index: number,
    onDrop?: (item: DragDropResultBase) => void,
    onDragEnd?: (item: DragDropResultBase, targetItem: DragDropResultBase) => void,
    verifyDrop: (droppedItem: DragDropResultBase) => boolean
}

const DraggableSource = DragSource<PlanogramSectionComponentProps, SourceCollectProps>(
    PlanogramDragDropTypes.SECTION, {
    beginDrag(props) {
        const { section } = props;
        return ({
            type: PlanogramDragDropTypes.SECTION,
            payload: section,
        });
    },
    endDrag(props, monitor) {
        if (!monitor.didDrop())
            return;
        if (props.onDragEnd)
            props.onDragEnd(monitor.getItem(), monitor.getDropResult());
    },
    // canDrag(props, monitor) {
    //     return props.section.shelves == null || props.section.shelves.length === 0
    // }
}, (connect, monitor) => ({
    canDrag: monitor.canDrag(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}));

const dropTaretTypes = [
    PlanogramDragDropTypes.SECTION,
    PlanogramDragDropTypes.SECTION_SIDEBAR,
    PlanogramDragDropTypes.SHELF_SIDEBAR,
    PlanogramDragDropTypes.SHELF,
    PlanogramDragDropTypes.SHELF_ITEM,
    PlanogramDragDropTypes.PRODUCT_SIDEBAR,
    PlanogramDragDropTypes.PRODUCT,
];

const DroppableTarget = DropTarget<PlanogramSectionComponentProps, TargetCollectProps>(
    dropTaretTypes, {
    drop(props, monitor) {
        const { section } = props;
        if (props.onDrop)
            props.onDrop(monitor.getItem());
        return ({
            type: dropTaretTypes,
            payload: section,
        });
    },
    canDrop(props, monitor) {
        if (monitor.didDrop() || !monitor.isOver({ shallow: true }))
            return false;
        return props.verifyDrop(monitor.getItem());
    }
}, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
}));

type SectionProps = PlanogramSectionComponentProps & TargetCollectProps & SourceCollectProps;

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => {
    return {
        addShelfItem: (shelf: PlanogramShelf, product: CatalogBarcode) => {
            dispatch((dispatch, getState) => {
                const state = getState()
                const shelfDepth = shelf.dimensions.depth;
                const catalogProductDepth = state.catalog.productsMap[product] && state.catalog.productsMap[product].length ? state.catalog.productsMap[product].length : null
                if (catalogProductDepth) {
                    dispatch(addProductAction(shelf.id, product, {
                        faces: 1,
                        stack: 1,
                        row: Math.floor(shelfDepth / catalogProductDepth),
                        manual_row_only:0
                    }));
                }
                else
                    dispatch(addProductAction(shelf.id, product));
            });
        },
        deleteShelf: (section: PlanogramSection, shelf: PlanogramElementId) => {
            dispatch(deleteShelfAction(section, shelf));
        },
        switchShelves: (base: PlanogramElementId, remote: PlanogramElementId) => {
            dispatch(switchShelvesAction(base, remote))
        },
        createShelfItem: (shelf: PlanogramElementId, item: PlanogramItem) => {
            dispatch(duplicateItemAction(shelf, item))
        },
        editShelfDimensions: (shelf: PlanogramElementId, dimensions: DimensionObject) => {
            dispatch(editShelfDimensionsAction(shelf, dimensions));
        },
        moveShelfItem: (shelf: PlanogramElementId, item: PlanogramElementId) => {
            dispatch(moveShelfItem(shelf, item));
        },
        updateProductDimensions: (barcode: number, dimensions: DimensionObject, afterAction: Action) => {
            dispatch(editProductDimensions(barcode, dimensions));
            dispatch(afterAction);
            // dispatch(saveStore(store.getState().planogram.store));
        }
    }
}
const mapStateToProps = (state: AppState, ownProps: SectionProps) => {
    return {
        ...state.catalog,
        ...ownProps,
        virtualStore: state.planogram.virtualStore,
    }
}
type SectionStoreProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;
const StoreConnector = connect(mapStateToProps, mapDispatchToProps);

class PlanogramSectionComponentTarget extends Component<SectionStoreProps> {
    render() {
        const { moveShelfItem, virtualStore, productsMap, deleteShelf, switchShelves, addShelfItem, createShelfItem, editShelfDimensions, updateProductDimensions } = this.props;
        const { section, canDrop, isDragging, connectDropTarget, connectDragSource } = this.props;
        const { height: sectionHeight, width: sectionWidth } = section.dimensions;
        const { shelfDetails, shelfMap: aisleShelves, sectionGroups } = virtualStore;
        const groupTag = sectionGroups.sectionToGroup[section.id] || section.id;

        const shelvesHeight = calculateShelvesHeight(section);

        return connectDropTarget(connectDragSource(
            <div key={"target_" + section.id} className={
                "planogram-section" + (canDrop ? " droppable" : "") + (isDragging ? " dragged" : "")}
                style={{
                    width: widthDensity(sectionWidth),
                    height: heightDensity(sectionHeight) + 20,
                }}
                onClick={e => e.stopPropagation()}>
                {section.shelves.map((shelf, i) => {
                    let minDimensions;
                    // let shelvesHeight = section.shelves.map(sh => sh.dimensions.height).reduce((p, c) => p + c);
                    const maxDimensions = {
                        ...section.dimensions,
                        // width: 0,
                        height: sectionHeight - shelvesHeight + shelf.dimensions.height
                    };
                    if (shelf.items.length > 0) {
                        const itemDimensions = shelf.items.map((item) =>
                            shelfItemDimensions(item.placement, catalogProductDimensionObject(productsMap[item.product])));
                        let itemsMinHeight = itemDimensions.map(sh => sh.height).reduce((p, c) => Math.max(p, c));
                        let itemsMinWidth = itemDimensions.map(sh => sh.width).reduce((p, c) => p + c);
                        let itemsMinDepth = itemDimensions.map(sh => sh.depth).reduce((p, c) => Math.max(p, c));
                        if (maxDimensions.height >= itemsMinHeight && maxDimensions.width >= itemsMinWidth && maxDimensions.depth >= itemsMinDepth)
                            minDimensions = {
                                height: itemsMinHeight,
                                width: itemsMinWidth,
                                depth: itemsMinDepth
                            };
                    }

                    return <Menu id={"sed_" + shelf.id} key={"sed_" + shelf.id + "_" + i} className="planogram-context-window" >
                        <DimensionModal
                            init={shelf.dimensions}
                            title={"Shelf Dimensions"}
                            maxDimensions={maxDimensions}
                            minDimensions={minDimensions}
                            onSubmit={(dimensions) => {
                                editShelfDimensions(shelf.id, dimensions);
                                contextMenu.hideAll();
                            }} />
                    </Menu>
                })}
                {section.shelves.map((shelf, i) => {
                    let availableSpace = shelfAvailableSpace(shelf, productsMap);
                    let shelfHeight = shelf.dimensions.height;
                    let shelfDepth = shelf.dimensions.depth;

                    let mainShelf: PlanogramShelf;

                    const shelfDetail = shelfDetails[shelf.id];
                    if (shelfDetail && shelfDetail.display && shelfDetail.combined.length > 0) {
                        const combinedShelves = [shelf, ...shelfDetail.combined.map((id) => aisleShelves[id])];
                        availableSpace = shelfAvailableSpace(combinedShelves, productsMap);
                    }

                    if (shelfDetail && shelfDetail.main_shelf && aisleShelves[shelfDetail.main_shelf]) {
                        mainShelf = aisleShelves[shelfDetail.main_shelf];
                        let mainShelfDetails = shelfDetails[shelfDetail.main_shelf];
                        const combinedShelves = [mainShelf, ...mainShelfDetails.combined.map((id) => aisleShelves[id])];
                        availableSpace = shelfAvailableSpace(combinedShelves, productsMap);
                    }

                    return <MenuProvider id={"sed_" + shelf.id}
                        key={"sem_" + shelf.id}
                        style={{
                            // zIndex:  i * 10
                            // zIndex: (shelfDetail.display ? 200 + i : 150 + i) - index* 10 
                        }}>
                        <PlanogramShelfDnd
                            shelf={shelf}
                            // key={shelf.id}
                            shelfIndex={i}
                            verifyDrop={(droppedItem) => {
                                // if (!shelfDetail.display)
                                //     return false;
                                const itemType = droppedItem.type;
                                if (itemType === PlanogramDragDropTypes.PRODUCT_SIDEBAR) {
                                    let productBarcode: number = droppedItem.payload;
                                    const product = productsMap[productBarcode];
                                    const productDimensions: DimensionObject = {
                                        height: product.height || ProductDefaultDimensions.height,
                                        width: product.width || ProductDefaultDimensions.width,
                                        depth: product.length || ProductDefaultDimensions.depth,
                                    }
                                    // if (shelf.items.findIndex(_item => _item.product === productBarcode) !== -1)
                                    //     return false;
                                    // if (!validateDimensions(productDimensions))
                                    //     return true;
                                    return shelfHeight >= productDimensions.height
                                        && shelfDepth >= productDimensions.depth
                                        && availableSpace.width - productDimensions.width >= 0
                                }
                                else if (itemType === PlanogramDragDropTypes.SHELF_ITEM) {
                                    let item: PlanogramItem = droppedItem.payload;
                                    // if (item.product != null && shelf.items.findIndex(_item => _item.product === item.product) !== -1)
                                    //     return false;
                                    let itemDimensions = shelfItemDimensions(item.placement, catalogProductDimensionObject(productsMap[item.product]));
                                    return shelfHeight >= itemDimensions.height
                                        && shelfDepth >= itemDimensions.depth
                                        && availableSpace.width - itemDimensions.width >= 0
                                }
                                // let item = droppedItem.payload;
                                return true;
                            }}
                            onDrop={(source) => {
                                console.log("SHELF DROP");
                                // if (source.type === PlanogramDragDropTypes.PRODUCT) {
                                //     moveShelfItem(shelf.id, source.payload);
                                // }
                                // else 
                                if (source.type === PlanogramDragDropTypes.PRODUCT_SIDEBAR) {
                                    let productBarcode: number = source.payload;
                                    const product = productsMap[productBarcode];
                                    const productDimensions: DimensionObject = catalogProductDimensionObject(product)
                                    if (!product.width || !product.height || !product.length || !validateDimensions(productDimensions)) {
                                        const shelfDepth = shelf.dimensions.depth;
                                        const shelfHeight = shelf.dimensions.height;
                                        setModal(() => <DimensionModal
                                            init={ProductDefaultDimensions}
                                            title={"Section Dimensions"}
                                            onSubmit={(dimensions) => {
                                                planogramApi.updateProductDimensions(productBarcode, dimensions).then((res) => {
                                                    updateProductDimensions(
                                                        productBarcode,
                                                        dimensions,
                                                        addProductAction(shelf.id, productBarcode, {
                                                            faces: 1,
                                                            stack: Math.floor(shelfHeight / dimensions.height),
                                                            row: Math.floor(shelfDepth / dimensions.depth),
                                                            manual_row_only:0
                                                        })
                                                    );
                                                    toggleModal();
                                                }).catch((err) => {
                                                    console.error(err);
                                                })
                                            }}
                                        />)
                                    }
                                    else addShelfItem(shelf, productBarcode);
                                }
                                else if (source.type === PlanogramDragDropTypes.SHELF_ITEM) {
                                    // if (source.payload.product != null && shelf.items.findIndex(item => item.product === source.payload.product) === -1)
                                    createShelfItem(shelf.id, source.payload);
                                }
                            }}
                            onDragEnd={(source, dropResult) => {
                                console.log("DRAG END SHELF");
                                if (dropResult.type === PlanogramDragDropTypes.TRASH)
                                    deleteShelf(section, shelf.id);
                                else if (dropResult.type === PlanogramDragDropTypes.SHELF) {
                                    if (shelf.id !== dropResult.payload.id)
                                        switchShelves(shelf.id, dropResult.payload.id);
                                }
                            }}
                        />
                    </MenuProvider>
                })}
                <div className="section-title">
                    {formatMessage('planogram-area-title', "AREA")}: {groupTag}
                </div>
                {section.dimensions ? <div className="section-dimensions">
                    {dimensionText(section.dimensions)}
                </div> : ""}
            </div>
        ));
    }
}


export default DraggableSource(DroppableTarget(StoreConnector(PlanogramSectionComponentTarget)));
