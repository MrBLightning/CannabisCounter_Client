import React, { Component } from "react";
import { PlanogramDragDropTypes } from "./generic/DragAndDropType";
import PlanogramSectionComponent from "./PlanogramSectionComponent";
import { DragDropResultBase } from "./generic/DragDropWrapper";
import { DragElementWrapper, DragSource, DropTarget } from "react-dnd";
import { AppState } from "shared/store/app.reducer";
import { Dispatch, Action } from "redux";
import { connect } from "react-redux";
import { addShelfAction, deleteShelfAction, duplicateShelfAction } from "shared/store/planogram/store/shelf/shelf.actions";
import { deleteSectionAction, addSectionAction, duplicateSectionAction, editSectionDimensionAction, switchSectionsAction, removeSectionItemsAction } from "shared/store/planogram/store/section/section.actions";
import { addShelfActionProps } from "shared/store/planogram/store/shelf/shelf.types";
import Draggable from "react-draggable";
import { addSectionActionProps } from "shared/store/planogram/store/section/section.types";
import { setModal, toggleModal } from "shared/components/Modal";
import { DimensionModal } from "./modals/DimensionModal";
import { ShelfDefaultDimension, SectionMaxDimension, ProductDefaultDimensions, ItemDefualtPlacement } from "shared/store/planogram/planogram.defaults";
import { calculateShelvesHeight, heightDensity, widthDensity } from "../../provider/calculation.service";
import { validateDimensions, catalogProductDimensionObject } from "../../provider/planogram.service";
import * as planogramApi from "shared/api/planogram.provider";
import { editProductDimensions } from "shared/store/catalog/catalog.action";
import { CatalogProduct } from "shared/interfaces/models/CatalogProduct";
import { EditableText } from "shared/components/Form";
import { editAisleName, removeAisleAction, setAisleAction } from "shared/store/planogram/store/aisle/aisle.actions";
import { PlanogramAisle, PlanogramSection, PlanogramShelf, DimensionObject, PlanogramItem, PlanogramElementId } from "shared/store/planogram/planogram.types";
import { uiNotify } from "shared/components/Toast";
import { RouteComponentProps, withRouter } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash, faUpload, faDownload, faEraser } from "@fortawesome/free-solid-svg-icons";
import { FileLoadingButton, JsonDownloadButton, fileReadyCurrentTime } from "./generic/MenuButtons";
import { Menu, contextMenu, MenuProvider } from "./generic/ContextMenu";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface SourceCollectProps {
    connectDragSource: DragElementWrapper<any>,
    isDragging: boolean,
}

interface TargetCollectProps {
    connectDropTarget: DragElementWrapper<any>,
    canDrop: boolean,
}

interface ComponentProps {
    aisle: PlanogramAisle,
    // aisleIndex: number,
    onDrop?: (item: DragDropResultBase) => void,
    onDragEnd?: (item: DragDropResultBase, targetItem: DragDropResultBase) => void,
}
const DraggableSource = DragSource<ComponentProps, SourceCollectProps>(PlanogramDragDropTypes.AISLE, {
    beginDrag(props, monitor) {
        const { aisle } = props;
        return ({
            type: monitor.getItemType(),
            payload: aisle,
        });
    },
    endDrag(props, monitor) {
        if (!monitor.didDrop())
            return;
        if (props.onDragEnd)
            props.onDragEnd(monitor.getItem(), monitor.getDropResult());
    },
    canDrag(props, monitor) {
        return false;
    }
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}));

const dropTypes = [
    PlanogramDragDropTypes.SECTION_SIDEBAR,
    PlanogramDragDropTypes.PRODUCT_SIDEBAR,
    PlanogramDragDropTypes.PRODUCT,
    PlanogramDragDropTypes.SHELF,
    PlanogramDragDropTypes.SHELF_SIDEBAR,
    PlanogramDragDropTypes.SECTION
];

const DroppableTarget = DropTarget<ComponentProps, TargetCollectProps>(
    dropTypes, {
    canDrop: (props, monitor) => {
        if (monitor.didDrop() || !monitor.isOver({ shallow: true }))
            return false;

        return true;
    },
    drop(props, monitor) {
        const { aisle } = props;
        if (props.onDrop)
            props.onDrop(monitor.getItem());
        return ({
            type: monitor.getItemType(),
            payload: aisle,
        });
    }
}, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
}));


type PlanogramAisleProps = ComponentProps & SourceCollectProps & TargetCollectProps;

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        deleteSection: (aisleId: PlanogramElementId, section: PlanogramSection) => {
            dispatch(deleteSectionAction(aisleId, section));
        },
        switchSections: (base: PlanogramSection, remote: PlanogramSection) => {
            dispatch(switchSectionsAction(base, remote));
        },
        removeSectionItemsAction: (aisle: PlanogramElementId, section: PlanogramElementId) => {
            dispatch(removeSectionItemsAction(aisle, section));
        },
        addShelf: (section: PlanogramSection, data?: addShelfActionProps) => {
            // dispatch(addSectionShelf(section));
            dispatch(addShelfAction(section, data));
        },
        duplicateShelf: (section: PlanogramSection, shelf: PlanogramShelf) => {
            dispatch(duplicateShelfAction(section, shelf));
        },
        deleteShelf: (section: PlanogramSection, shelf: PlanogramElementId) => {
            dispatch(deleteShelfAction(section, shelf));
        },
        editSectionDimensions: (section: PlanogramSection, dimension: DimensionObject) => {
            dispatch(editSectionDimensionAction(section, dimension));
        },
        updateProductDimensions: (barcode: number, dimensions: DimensionObject, afterAction: Action) => {
            dispatch(editProductDimensions(barcode, dimensions));
            dispatch(afterAction);
        },
    }
}
function mapStateToProps(state: AppState, ownProps: PlanogramAisleProps) {
    return {
        store: state.planogram.store,
        ...state.catalog,
        ...ownProps
    };
}
type SectionStoreProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

const PlanogramAisleComponent: React.FC<SectionStoreProps> = (props) => {
    const { store, aisle } = props;
    if (!store) return null;

    const { sections } = aisle;
    const { canDrop, isDragging, connectDropTarget, connectDragSource } = props;
    const { addShelf,
        switchSections,
        duplicateShelf,
        removeSectionItemsAction,
        deleteSection,
        editSectionDimensions,
        updateProductDimensions,
        productsMap
    } = props;

    return connectDropTarget(connectDragSource(
        <div
            className={"planogram-aisle" + (canDrop ? " droppable" : "") + (isDragging ? " dragged" : "")}
            // onDrag={e=>e.stopPropagation()}
            // onDragEnd={e=>e.stopPropagation()}
            // onDragEnter={e=>e.stopPropagation()}
            // onDragLeave={e=>e.stopPropagation()}
            // onDragOver={e=>e.stopPropagation()}
            // onDragStart={e=>e.stopPropagation()}
            // onDrop={e=>e.stopPropagation()}
            // onTouchStart={e=>e.stopPropagation()}
            // onTouchEnd={e=>e.stopPropagation()}
            // onTouchMove={e=>e.stopPropagation()}
            onClick={e => e.stopPropagation()}>
            {sections.map((section: PlanogramSection, i) => {
                let minDimensions;
                if (section.shelves.length > 0) {
                    let shelvesMinHeight = calculateShelvesHeight(section);
                    // let shelvesMinHeight = section.shelves.map(sh => sh.dimensions.height).reduce((p, c) => p + c);
                    let shelvesMinWidth = section.shelves.map(sh => sh.dimensions.width).reduce((p, c) => Math.max(p, c));
                    let shelvesMinDepth = section.shelves.map(sh => sh.dimensions.depth).reduce((p, c) => Math.max(p, c));
                    minDimensions = {
                        height: shelvesMinHeight,
                        width: shelvesMinWidth,
                        depth: shelvesMinDepth
                    };
                }
                return <React.Fragment>
                    <Menu id={"sec_ed_" + section.id} key={"sec_ed_" + section.id + "_" + i} className="planogram-context-window">
                        <DimensionModal
                            init={section.dimensions}
                            title={"Section Dimensions"}
                            maxDimensions={SectionMaxDimension}
                            minDimensions={minDimensions}
                            onSubmit={(dimensions) => {
                                editSectionDimensions(section, dimensions);
                                contextMenu.hideAll();
                            }}>
                            <div className="input-row">
                                <button onClick={e => {
                                    if (window.confirm("Are you sure you want to remove all items in this section?"))
                                        removeSectionItemsAction(aisle.id, section.id);
                                }}>
                                    <FontAwesomeIcon icon={faEraser} />
                                    <span>Clear Items</span>
                                </button>
                            </div>
                        </DimensionModal>
                    </Menu>
                    <MenuProvider id={"sec_ed_" + section.id}
                        data={section}
                        key={section.id}
                        className="planogram-section-wrapper"
                        style={{
                            // zIndex: (sections.length * 100) - 100 * i
                            // zIndex: 150 + i
                        }} >
                        <PlanogramSectionComponent
                            // key={section.id}
                            section={section}
                            index={i}
                            verifyDrop={(droppedItem) => {
                                const shelvesHeight = section.shelves.length > 0 ? calculateShelvesHeight(section) : 0;

                                const itemType = droppedItem.type;
                                const item = droppedItem.payload;
                                if (itemType === PlanogramDragDropTypes.SHELF) {
                                    let shelfDimensions: DimensionObject = item.dimensions;
                                    return section.dimensions.height >= shelvesHeight + shelfDimensions.height;
                                }
                                return true;
                            }}
                            onDragEnd={(source, dropResult) => {
                                console.log("DRAG END SHELF", source, dropResult);
                                if (dropResult.type === PlanogramDragDropTypes.TRASH)
                                    deleteSection(aisle.id, section);
                                // else if (source.type === PlanogramDragDropTypes.SHELF && source.type === dropResult.type)
                                //     switchShelf(p, dropResult.payload);
                            }}
                            onDrop={(item) => {
                                console.log("SECTION DROP", item);
                                if (item.type === PlanogramDragDropTypes.SHELF_SIDEBAR) {
                                    // createNewShelf(section);
                                    if (section.shelves.length >= 1) {
                                        // const shelvesHeight = section.shelves.map(sh => sh.dimensions.height).reduce((p, c) => p + c);
                                        const shelvesHeight = section.shelves.length > 0 ? calculateShelvesHeight(section) : 0;
                                        const dimensions = {
                                            ...section.dimensions,
                                            height: section.dimensions.height - shelvesHeight,
                                        };
                                        addShelf(section, {
                                            dimensions
                                        });
                                    }
                                    else
                                        addShelf(section);
                                    // addShelf(section);
                                }
                                else if (item.type === PlanogramDragDropTypes.SHELF_ITEM) {
                                    const shelvesHeight = section.shelves.length > 0 ? calculateShelvesHeight(section) : 0;
                                    let availableDimensions = {
                                        ...section.dimensions,
                                        height: section.dimensions.height - shelvesHeight,
                                    };
                                    const shelfItem: PlanogramItem = item.payload;
                                    addShelf(section, {
                                        dimensions: availableDimensions,
                                        item: shelfItem
                                    })
                                }
                                else if (item.type === PlanogramDragDropTypes.PRODUCT_SIDEBAR) {
                                    const shelvesHeight = section.shelves.length > 0 ? calculateShelvesHeight(section) : 0;
                                    let avaialableHeight = section.dimensions.height - shelvesHeight;
                                    if (avaialableHeight > ShelfDefaultDimension.height)
                                        avaialableHeight = ShelfDefaultDimension.height;
                                    const newShelfDimensions = {
                                        ...section.dimensions,
                                        height: avaialableHeight,
                                    };
                                    let barcode: number = item.payload;
                                    const product: CatalogProduct = productsMap[barcode];
                                    const productDimensions: DimensionObject = catalogProductDimensionObject(product);

                                    if (!validateDimensions(productDimensions)) {
                                        setModal(() => <DimensionModal
                                            init={ProductDefaultDimensions}
                                            title={"Section Dimensions"}
                                            onSubmit={(dimensions) => {
                                                planogramApi.updateProductDimensions(product.BarCode, dimensions).then((res) => {
                                                    updateProductDimensions(
                                                        product.BarCode,
                                                        dimensions,
                                                        addShelfAction(section, {
                                                            dimensions: newShelfDimensions,
                                                            // product: product.BarCode
                                                            item: {
                                                                id: "",
                                                                product: product.BarCode,
                                                                placement: {
                                                                    ...ItemDefualtPlacement,
                                                                    row: Math.floor(newShelfDimensions.depth / dimensions.depth),
                                                                },
                                                            }
                                                        }));
                                                    toggleModal();
                                                }).catch((err) => {
                                                    console.error(err);
                                                })
                                            }} />)
                                    }
                                    else {
                                        addShelf(section, {
                                            dimensions: newShelfDimensions,
                                            product: product.BarCode
                                        });
                                    }

                                }
                                else if (item.type === PlanogramDragDropTypes.SHELF) {
                                    const shelf: PlanogramShelf = item.payload;
                                    duplicateShelf(section, shelf);
                                }
                                else if (item.type === PlanogramDragDropTypes.SECTION) {
                                    const remote: PlanogramSection = item.payload;
                                    switchSections(section, remote);

                                }
                            }}
                        />
                    </MenuProvider>
                </React.Fragment>
            })}
        </div >
    ))

}

const PlanogramAisleDroppable = DraggableSource(DroppableTarget(connect(mapStateToProps, mapDispatchToProps)(PlanogramAisleComponent)));

// const mainMapStateToProps = (state: AppState, ownProps: { aisle: PlanogramAisle, aisleIndex: number, scale?: number }) => {
const mainMapStateToProps = (state: AppState, ownProps: RouteComponentProps<{ store_id?: string, aisle_index: string }> & { scale?: number }) => {
    return {
        ...ownProps,
        productsMap: state.catalog.productsMap,
        // products: state.catalog.products,
        store: state.planogram.store,
        aisle: state.planogram.virtualStore.aisleMap[ownProps.match.params.aisle_index] ? state.planogram.virtualStore.aisleMap[ownProps.match.params.aisle_index] : null
    };
}
const mainMapDispatchToProps = (dispatch: Dispatch) => ({
    addSection: (aisle: PlanogramElementId, data: addSectionActionProps) => dispatch(addSectionAction(aisle, data)),
    duplicateSection: (aisleId: PlanogramElementId, section: PlanogramSection) => dispatch(duplicateSectionAction(aisleId, section)),
    updateProductDimensions: (barcode: number, dimensions: DimensionObject, afterAction: Action) => {
        dispatch(editProductDimensions(barcode, dimensions));
        dispatch(afterAction);
        // const plStore = store.getState().planogram.store;
        // if (plStore)
        //     dispatch(saveStore(plStore));
    },
    setStoreAisle: (aisle: PlanogramAisle, aislePid?: PlanogramElementId) => {
        dispatch(setAisleAction(aisle, aislePid));
    },
    deleteAisle: (aisleId: PlanogramElementId) => dispatch(removeAisleAction(aisleId)),
    editAisleName: (aisleId: PlanogramElementId, name: string) => dispatch(editAisleName(aisleId, name))
});
type AisleContainerProps = ReturnType<typeof mainMapStateToProps> & ReturnType<typeof mainMapDispatchToProps>;

class PlanogramAisleContainer extends Component<AisleContainerProps> {
    containerRef = React.createRef<HTMLDivElement>();
    state = {
/*Barak 16.1.20 zoom: 1,*/
/*Barak 16.1.20*/ zoom: 0.3,
        containerHeight: 0,
        containerWidth: 0,
    }

    componentDidMount() {
        const { aisle, history } = this.props;
        // if (!aisle)
        //     history.goBack();
    }
    saveAisle = () => {
        const { store, aisle } = this.props;
        const { setStoreAisle } = this.props;
        if (!store || !aisle || !aisle.aisle_id)
            return uiNotify("Unable to save current aisle");
        planogramApi.saveStoreAisle(store.store_id, aisle).then((_aisle: PlanogramAisle) => {
            setStoreAisle(_aisle);
            uiNotify("Store was successfully saved.", "success", 5000);
        }).catch((err) => {
            uiNotify("Unable to save aisle at this time...", "error", 5000);
            console.error(err);
        });
    }
    render() {
        const {
            store,
            aisle,
            // aisleIndex,
            productsMap,
            addSection, duplicateSection, updateProductDimensions, editAisleName, deleteAisle,
        } = this.props;
        if (!store || !aisle) return null;
        // const { width: aisleWidth, height: aisleHeight } = aisle.dimensions;
        let aisleWidth = aisle.sections.map(v => v.dimensions.width).reduce((p, c) => p + c, 0);
        if (aisleWidth < aisle.dimensions.width)
            aisleWidth = aisle.dimensions.width;
        let aisleHeight = aisle.sections.map(v => v.dimensions.height).reduce((p, c) => Math.max(p, c), 0);
        if (aisleHeight < aisle.dimensions.height)
            aisleHeight = aisle.dimensions.height;
        return (
            <div className="planogram-view-inner">
                <TransformWrapper
                    // defaultScale={0.5}
                    pan={{
                        disabled: true,
                        // limitToWrapperBounds: true,
                        // disableOnTarget: ["planogram-body"]
                    }}
                    options={{
                        limitToBounds: false,
                        // transformEnabled: false,
                        // defaultScale: 0.5,

                        minScale: 0.1,
                        maxScale: 10,
                    }}
                    doubleClick={{
                        disabled: true,
                        mode: "reset"
                    }}>
                    {(props: any) => <React.Fragment>
                        <div className="planogram-scale">
                            <div className="scale-label">Zoom: x{props.scale}</div>
                            {/* <input type="range" name="planogram-zoom" min="0.25" max="2" step="0.01" value={zoom} onChange={this.onZoomChange} /> */}
                        </div>
                        <TransformComponent>
                            <div style={{ minHeight: aisleHeight, minWidth: aisleWidth }}>
                                <MenuProvider id={"aisle_menu"} key={"aisle_menu_provider"} className="planogram-body">
                                    <div className="planogram-aisle-container">
                                        <Draggable
                                            cancel=".planogram-section, .planogram-context-window, input"
                                            defaultClassNameDragging="dragged"
                                            defaultPosition={{ x: 30, y: 30 }}
                                            scale={props.scale}
                                            bounds={{ left: -(aisleWidth), top: -aisleHeight, right: aisleWidth, bottom: aisleHeight }}>
                                            <div className="planogram-container">
                                                <div className="planogram-handle">
                                                    <EditableText text={aisle.name || ("AISLE: " + aisle.aisle_id)} onNewText={(newText) => {
                                                        editAisleName(aisle.id, newText);
                                                    }}>{aisle.name || "AISLE: " + aisle.aisle_id}</EditableText>
                                                </div>
                                                <PlanogramAisleDroppable
                                                    aisle={aisle}
                                                    // aisleIndex={aisleIndex}
                                                    onDrop={(item) => {
                                                        console.log("ASILE DROP", item);
                                                        if (item.type === PlanogramDragDropTypes.PRODUCT_SIDEBAR) {
                                                            const product = productsMap[item.payload];
                                                            const productDimensions: DimensionObject = catalogProductDimensionObject(product)

                                                            if (!validateDimensions(productDimensions)) {
                                                                setModal(() => <DimensionModal
                                                                    init={ProductDefaultDimensions}
                                                                    title={"Section Dimensions"}
                                                                    onSubmit={(dimensions) => {
                                                                        planogramApi.updateProductDimensions(product.BarCode, dimensions).then((res) => {
                                                                            updateProductDimensions(product.BarCode, dimensions, addSection(aisle.id, {
                                                                                product: product.BarCode
                                                                            }));
                                                                            toggleModal();
                                                                        }).catch(console.error)
                                                                    }} />)
                                                            }
                                                            else
                                                                addSection(aisle.id, { product: product.BarCode });
                                                            // createNewItem(aisle, item.payload);
                                                        }
                                                        else if (item.type === PlanogramDragDropTypes.SECTION_SIDEBAR) {
                                                            addSection(aisle.id, {});
                                                        }
                                                        else if (item.type === PlanogramDragDropTypes.SHELF_SIDEBAR
                                                            || item.type === PlanogramDragDropTypes.SHELF) {
                                                            // createNewShelf(aisle);
                                                            addSection(aisle.id, {
                                                                shelf: item.payload
                                                            });
                                                        }
                                                        else if (item.type === PlanogramDragDropTypes.SECTION) {
                                                            duplicateSection(aisle.id, item.payload);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </Draggable>
                                    </div>
                                </MenuProvider>
                                <Menu id={"aisle_menu"} animation="pop" key={"aisle_menu_context"}>
                                    <div className="planogram-context-window">
                                        <div className="context-title">Aisle: {aisle.name || aisle.aisle_id}</div>

                                        <div className="input-row">
                                            <button onClick={this.saveAisle}>
                                                <FontAwesomeIcon icon={faSave} />
                                                <span>Save Aisle</span>
                                            </button>
                                        </div>
                                        <div className="input-row">
                                            <FileLoadingButton onData={(data) => {
                                                try {
                                                    data = JSON.parse(data);
                                                    if (!data || !data.sections)
                                                        return;
                                                    this.props.setStoreAisle(data, aisle.id);
                                                } catch (err) {
                                                    console.error(err);
                                                    uiNotify("Unable to load aisle");
                                                }
                                            }}>
                                                <FontAwesomeIcon icon={faUpload} />
                                                <span>Load Aisle</span>
                                            </FileLoadingButton>
                                        </div>
                                        <div className="input-row">
                                            <JsonDownloadButton filename={fileReadyCurrentTime() + "_" + (store ? store.store_id + "_" : "") + aisle.aisle_id + " - " + aisle.name} getData={() => aisle} >
                                                <FontAwesomeIcon icon={faDownload} />
                                                <span>Download Aisle</span>
                                            </JsonDownloadButton>
                                        </div>
                                        <div className="input-row">
                                            <button onClick={e => {
                                                if (!store || !aisle.aisle_id) return;
                                                if (window.confirm("Are you sure you want to delete: " + (aisle.name || "Aisle " + aisle.id))) {
                                                    planogramApi.deleteStoreAisle(store.store_id, aisle.aisle_id).then(() => {
                                                        deleteAisle(aisle.id);
                                                    }).catch(err => {
                                                        console.error(err);
                                                        uiNotify("Unable to delete aisle")
                                                    });
                                                }
                                            }}>
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span>Delete Aisle</span>
                                            </button>
                                        </div>
                                        {/* <StoreSelectionButton /> */}
                                    </div>
                                </Menu>
                            </div >
                        </TransformComponent>
                    </React.Fragment>}
                </TransformWrapper>
            </div >
        );
    };
}

export default withRouter(connect(mainMapStateToProps, mainMapDispatchToProps)(PlanogramAisleContainer));