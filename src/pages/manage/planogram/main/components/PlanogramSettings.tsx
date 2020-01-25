import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'shared/store/app.reducer'
import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose, faEye, faEyeSlash, faDownload, faUpload, faRecycle } from '@fortawesome/free-solid-svg-icons'
import { toggleSettings, toggleRowItems, setColorBy } from 'shared/store/planogram/planogram.actions'
import { toggleShelfItems, toggleBadProductsMarker } from 'shared/store/planogram/display/display.actions'
import { JsonDownloadButton, fileReadyCurrentTime } from './generic/MenuButtons'
import { setModal, toggleModal } from 'shared/components/Modal'
import ImportModal from '../ImportModal'
import { uiNotify } from 'shared/components/Toast'
import { PlanogramStore } from 'shared/store/planogram/planogram.types'
import * as planogramProvider from "shared/api/planogram.provider";
import { shelfItemDimensions } from '../../provider/calculation.service'
import { PLANOGRAM_ID } from 'shared/store/planogram/planogram.defaults'
import { CatalogProduct } from 'shared/interfaces/models/CatalogProduct'
import { updateCatalogProducts } from 'shared/store/catalog/catalog.action'
import { setStore } from 'shared/store/planogram/store/store.actions'
import { Rnd } from 'react-rnd'
import { refreshBarcodeImage } from './generic/BarcodeImage'


const mapStateToProps = (state: AppState, ownProps: any) => ({
    displaySettings: state.planogram.display.showSettings,
    hideShelfItems: state.planogram.display.hideShelfItems,
    showRowItems: state.planogram.display.showRowItems,
    markBadProducts: state.planogram.display.markBadProducts,
    showColorMap: state.planogram.display.colorBy != null,

    store: state.planogram.store,
    productMap: state.catalog.productsMap,

    branchMap: state.system.data.branchesMap
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, any, AnyAction>) => ({
    toggleSettings: () => dispatch(toggleSettings()),
    toggleShelfItems: () => dispatch(toggleShelfItems()),
    toggleRowItems: () => dispatch(toggleRowItems()),
    toggleBadProductsMarker: () => dispatch(toggleBadProductsMarker()),
    toggleColorMap: (showColorMap: boolean) => dispatch(showColorMap ? setColorBy(null) : setColorBy("supplier")),


    updatedProducts: (products: CatalogProduct[]) => dispatch(updateCatalogProducts(products))
})

type PlanogramSettingsProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;


type AisleDataRow = {
    aisle?: string,
    shelf?: number,
    position?: number,
    faces?: number,
    barcode?: number,
    height?: number,
    width?: number,
    depth?: number
}

class PlanogramSettings extends Component<PlanogramSettingsProps> {

    updateMissingProducts = async (data: AisleDataRow[]) => {
        // const catalog = this.props.productMap;
        const missingProducts = [];

        for (let i = 0; i < data.length; i++) {
            const dataProduct = data[i];
            if (dataProduct.barcode)
                missingProducts.push(dataProduct);
        }
        const updateProducts = missingProducts.map(p => ({
            barcode: p.barcode,
            dimensions: {
                width: p.width,
                height: p.height,
                depth: p.depth,
            }
        }));
        return await planogramProvider.updateMultipleProductsDimensions(updateProducts);
    }

    handleDataProducts = async (data: any[]) => {
        const updatedProducts = await this.updateMissingProducts(data);
        this.props.updatedProducts(updatedProducts);

        // const catalog = {
        //     ...this.props.productMap,
        // }
        // if (updatedProducts)
        //     for (let i = 0; i < updatedProducts.length; i++) {
        //         catalog[updatedProducts[i].BarCode] = updatedProducts[i];
        //     }

        // const fillStore = { ...currentStore };
        // for (const dataAisle of data) {
        //     const aisleIndex = fillStore.aisles.findIndex(a => a.name === dataAisle.name);
        //     if (aisleIndex === -1)
        //         continue;
        //     const storeAisle = fillStore.aisles[aisleIndex];
        //     const productList = [...dataAisle.products];
        //     // shelf_max_index for switch shelf index
        //     const shelf_max_index = productList.length > 0 ? productList.map(p => p.shelf).reduce((p, c) => Math.max(p, c)) : 0;

        //     let currentProduct: AisleDataRow | undefined = productList.shift();
        //     while (productList.length > 0) {
        //         if (currentProduct == null)
        //             break;
        //         const barcode = currentProduct.barcode;
        //         const productFaces = currentProduct.faces;
        //         const productWidth = currentProduct.width * 10 * currentProduct.faces;
        //         const dataShelfIndex = shelf_max_index - currentProduct.shelf;


        //         const shelvesSameIndex = storeAisle.sections.map((se) => se.shelves[dataShelfIndex]);
        //         for (let i = 0; i < shelvesSameIndex.length; i++) {
        //             const sameIndexShelf = shelvesSameIndex[i];

        //             const shelfWidth = sameIndexShelf.dimensions.width;
        //             const shelfProductsWidth = sameIndexShelf.items.length > 0 ? sameIndexShelf.items.map(item => {
        //                 const catalogProduct = catalog[item.product];
        //                 return shelfItemDimensions(item.placement, {
        //                     width: catalogProduct.width || 10,
        //                     height: catalogProduct.height || 10,
        //                     depth: catalogProduct.length || 10,
        //                 })
        //             }).map(dm => dm.width).reduce((p, c) => p + c) : 0;
        //             const availableShelfWidth = shelfWidth - shelfProductsWidth;
        //             if (shelfWidth > productWidth && availableShelfWidth - productWidth < 0)
        //                 continue;


        //             storeAisle.sections[i].shelves[dataShelfIndex].items.push({
        //                 id: sameIndexShelf.id + PLANOGRAM_ID.ITEM + shelvesSameIndex[i].items.length,
        //                 placement: {
        //                     faces: productFaces,
        //                     row: 1,
        //                     stack: 1,
        //                 },
        //                 product: barcode
        //             });
        //             break;
        //         }
        //         currentProduct = productList.shift();
        //     }
        //     fillStore.aisles[aisleIndex] = storeAisle;
        // }
        // if (updatedProducts)
        //     this.props.setStore(fillStore, updatedProducts);
        // else
        //     this.props.setStore(fillStore);
    }
    render() {
        if (!this.props.displaySettings) return null;
        const { toggleSettings, toggleRowItems, toggleShelfItems, toggleBadProductsMarker, toggleColorMap } = this.props;
        const { store, branchMap, hideShelfItems, showRowItems, markBadProducts, showColorMap } = this.props;
        if (!store) return null;
        return (
            <Rnd
                dragHandleClassName="settings-header"
                className="planogram-settings"  >
                {/* <div className="planogram-settings"> */}
                <div className="settings-header">
                    <div className="header-title">Planogram Settings: </div>
                    <div className="header-close" onClick={toggleSettings}>
                        <FontAwesomeIcon icon={faWindowClose} />
                    </div>
                </div>
                <div className="settings-container">
                    <div className="container-section">
                        <div>
                            <h3>{store.name || `Aisle: ${store.store_id}`}</h3>
                            <h5>{branchMap[store.branch_id] != null ? `${branchMap[store.branch_id].Name}(${store.branch_id})` : `::${store.branch_id}`}</h5><h3 className="section-title">Store Actions</h3>
                        </div>
                        {/* <div className="settings-spec-table">
                            <div className="spec-row">
                                <div className="spec-item">Set As Main Store: </div>
                                <div className="spec-item">
                                    <span className="row-input switch">
                                        <input
                                            type="checkbox"
                                            className="switch-input"
                                            disabled
                                            checked={true}
                                            onChange={e => { }} />
                                        <div className="switch-display"></div>
                                    </span>
                                </div>
                            </div>
                        </div> */}
                        <h3 className="section-title">Actions</h3>
                        <div className="settings-spec-table">
                            <div className="spec-row">
                                <div className="spec-item">Download Store To Local Disk: </div>
                                <div className="spec-item">
                                    <JsonDownloadButton filename={fileReadyCurrentTime() + "_" + store.store_id} getData={() => store} >
                                        <FontAwesomeIcon icon={faDownload} />
                                        <span>Download</span>
                                    </JsonDownloadButton>
                                </div>
                            </div>
                            <div className="spec-row">
                                <div className="spec-item">Import Dimensions CSV: </div>
                                <div className="spec-item">
                                    <button onClick={() => {
                                        setModal(() => <ImportModal onSubmit={(data) => {
                                            if (data == null || data.length === 0)
                                                return console.log("Nothing loaded.");
                                            if (this.props.store == null)
                                                return console.log("No store found.");
                                            toggleModal();
                                            this.handleDataProducts(data).then(() => {
                                                uiNotify("Store was successfully saved.", "success", 5000);
                                            }).catch(err => {
                                                uiNotify("", "error", 5000);
                                                console.error(err);
                                            });
                                        }} />)
                                    }}>
                                        <FontAwesomeIcon icon={faUpload} />
                                        <span>Load CSV</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="container-section">
                        <h3 className="section-title">Display</h3>
                        <div className="settings-spec-table">
                            <div className="spec-row">
                                <div className="spec-item">
                                    <label className="row-label">Display Shelf Items: </label>
                                </div>
                                <div className="spec-item">
                                    <span className="row-input switch">
                                        <input
                                            type="checkbox"
                                            className="switch-input"
                                            checked={!hideShelfItems}
                                            onChange={e => toggleShelfItems()} />
                                        <div className="switch-display"></div>
                                    </span>
                                </div>
                            </div>
                            <div className="spec-row">
                                <div className="spec-item">
                                    <label className="row-label">Mark Products Without Dimensions: </label>
                                </div>
                                <div className="spec-item">
                                    <span className="row-input switch">
                                        <input
                                            type="checkbox"
                                            className="switch-input"
                                            checked={markBadProducts}
                                            onChange={e => toggleBadProductsMarker()} />
                                        <div className="switch-display"></div>
                                    </span>
                                </div>
                            </div>
                            <div className="spec-row">
                                <div className="spec-item">
                                    <label className="row-label">Render Item Rows: </label>
                                </div>
                                <div className="spec-item">
                                    <span className="row-input switch">
                                        <input
                                            type="checkbox"
                                            className="switch-input"
                                            checked={showRowItems}
                                            onChange={e => toggleRowItems()} />
                                        <div className="switch-display"></div>
                                    </span>
                                </div>
                            </div>
                            <div className="spec-row">
                                <div className="spec-item">
                                    <label className="row-label">Colorize Supplier Products</label>
                                </div>
                                <div className="spec-item">
                                    <span className="row-input switch">
                                        <input
                                            type="checkbox"
                                            className="switch-input"
                                            checked={showColorMap}
                                            onChange={e => toggleColorMap(showColorMap)} />
                                        <div className="switch-display"></div>
                                    </span>
                                </div>
                            </div>
                            <div className="spec-row">
                                <div className="spec-item">Update Image Cache</div>
                                <div className="spec-item">
                                    <button onClick={refreshBarcodeImage}>
                                        <FontAwesomeIcon icon={faRecycle} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Rnd>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanogramSettings)
