import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'shared/store/app.reducer'
import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

const mapStateToProps = (state: AppState, ownProps: any) => {
    const barcode = state.planogram.display.productDetailer;
    const product = barcode != null ? state.catalog.productsMap[barcode] : null;
    return {
        barcode,
        // catalog: state.catalog.productsMap,
        product,
        storePosition: barcode && state.planogram.productDetails[barcode] ? state.planogram.productDetails[barcode].position : null,
        maxAmountShelf: barcode && state.planogram.productDetails[barcode] ? state.planogram.productDetails[barcode].maxAmount : null,
        barcodeFacesCount: barcode && state.planogram.productDetails[barcode] ? state.planogram.productDetails[barcode].facesCount : null,
        weeklySales: barcode && state.catalog.productSales[barcode] ? state.catalog.productSales[barcode].weekly : undefined,

        catalogSupplier: product && product.SapakId ? state.system.data.suppliersMap[product.SapakId] : null,
        catalogClass: product && product.ClassesId ? state.system.data.classesMap[product.ClassesId] : null,
        catalogGroup: product && product.GroupId ? state.system.data.groupsMap[product.GroupId] : null,
        catalogSubGroup: product && product.SubGroupId ? state.system.data.subGroupsMap[product.SubGroupId] : null,
        catalogSerie: product && product.DegemId ? state.system.data.seriesMap[product.DegemId] : null,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({

});


class PlanogramProductDetail extends Component<ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>> {
    render() {
        const {
            barcode,
            product,
            storePosition,
            maxAmountShelf,
            barcodeFacesCount,
            catalogSupplier,
            catalogClass,
            catalogGroup,
            catalogSubGroup,
            catalogSerie,
            weeklySales
        } = this.props;
        if (barcode == null || product == null)
            return null;
        return (
            <div className="planogram-product-detailer">
                <div className="detailer-section">
                    <div>
                        <h2 className="detailer-section-title">{product.Name}</h2>
                    </div>
                    <div className="detailer-row">
                        <label>ברקוד:</label>
                        <span>{product.BarCode}</span>
                    </div>
                    <div className="detailer-row">
                        <label>ספק:</label>
                        <span>{(catalogSupplier ? catalogSupplier.Name : product.SapakId) || "---"}</span>
                    </div>
                    <div className="detailer-row">
                        <label>מחלקה:</label>
                        <span>{(catalogClass ? catalogClass.Name : product.ClassesId) || "---"}</span>
                    </div>
                    <div className="detailer-row">
                        <label>קבוצה:</label>
                        <span>{(catalogGroup ? catalogGroup.Name : product.GroupId) || "---"}</span>
                    </div>
                    <div className="detailer-row">
                        <label>תת קבוצה:</label>
                        <span>{(catalogSubGroup ? catalogSubGroup.Name : product.SubGroupId) || "---"}</span>
                    </div>
                    <div className="detailer-row">
                        <label>סדרה:</label>
                        <span>{(catalogSerie ? catalogSerie.Name : product.DegemId) || "---"}</span>
                    </div>
                </div>
                <div className="detailer-section">
                    <h3 className="detailer-section-title">גדלים</h3>
                    <div className="detailer-row">
                        <label>גובה:</label>
                        <span>{product.height != null ? product.height + "mm" : null}</span>
                    </div>
                    <div className="detailer-row">
                        <label>רוחב:</label>
                        <span>{product.width != null ? product.width + "mm" : null}</span>
                    </div>
                    <div className="detailer-row">
                        <label>עומק:</label>
                        <span>{product.length != null ? product.length + "mm" : null}</span>
                    </div>
                    <div className="detailer-row">
                        <label>מדף:</label>
                        <span style={{ fontSize: "0.75em",maxWidth:150 }}>
                            {storePosition && storePosition.length > 0 ? storePosition.map(p => p.shelf).join(', ') : null}
                        </span>
                    </div>
                </div>
                <div className="detailer-section">
                    <h3 className="detailer-section-title">סטטיסטיקה</h3>
                    <div className="detailer-row">
                        <label>כמות פייסים:</label>
                        <span>{barcodeFacesCount}</span>
                    </div>
                    <div className="detailer-row">
                        <label>קיבולת מדף:</label>
                        <span>{maxAmountShelf}</span>
                    </div>
                    <div className="detailer-row">
                        <label>מכירות שבועיות:</label>
                        <span>{weeklySales != null ? Math.round(weeklySales) : "~"}</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanogramProductDetail)