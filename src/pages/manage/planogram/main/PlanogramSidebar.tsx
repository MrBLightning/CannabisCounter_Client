import React, { Component } from 'react'

import { TypedDragItem } from './components/generic/TypedDropZone';
import { PlanogramDragDropTypes } from './components/generic/DragAndDropType';
import { connect } from 'react-redux';
import { setSidebarSearchWords } from 'shared/store/planogram/sidebar/sidebar.actions';
import { Dispatch } from 'redux';
import { AppState } from 'shared/store/app.reducer';
import { CatalogProduct } from 'shared/interfaces/models/CatalogProduct';
import { SidebarProductDragable } from './components/SidebarProductDragable';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        setSearchWords: (searchWords: string) => {
            dispatch(setSidebarSearchWords(searchWords));
        }
    }
}
function mapStateToProps(state: AppState, ownProps: {
    noStructure?: boolean
}) {
    return {
        ...ownProps,
        ...state.planogram.sidebar,
        products: state.catalog.products,
        displaySalesReport: state.planogram.display.displaySalesReport,
    }
}
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type StateProps = ReturnType<typeof mapStateToProps>;

const pageSize = 100

class PlanogramSidebar extends Component<DispatchProps & StateProps> {
    state = {
        page: 0,
        searchWords: ""
    }

    render() {
        if (this.props.displaySalesReport) return null;
        const page = this.state.page;
        const { searchWords } = this.state;
        const { products, error, noStructure } = this.props;

        let filteredProducts = products.filter(v => !v.Archives);
        filteredProducts = searchWords != null && searchWords !== "" ? filteredProducts.filter((p) => {
            let barcode = p.BarCode.toString();
            return barcode.indexOf(searchWords) !== -1 || p.Name.indexOf(searchWords) !== -1
        }).sort((a, b) => {
            if (a.BarCode.toString().length > b.BarCode.toString().length)
                return 1;
            return -1;
        }) : filteredProducts;

        const productsLength = filteredProducts.length;
        let startIndex = page * pageSize;
        let endIndex = startIndex + pageSize;
        if (productsLength < (startIndex + pageSize)) {
            endIndex = startIndex + productsLength - startIndex;
        }
        const sidebarProducts: CatalogProduct[] = [];
        for (let i = startIndex; i < endIndex; i++) {
            sidebarProducts.push(filteredProducts[i]);
        }
        if (error)
            return <div>ERROR: {error instanceof Error ? error.message : error}</div>
        return (
            <div className="planogram-sidebar">
                <div className="sidebar-search">
                    <input type="text" name="search" placeholder="חפש שם מוצר או ברקוד..." onChange={(e) => {
                        let value = e.target.value;
                        this.setState({
                            searchWords: value
                        })
                    }} />
                </div>
                <div className="sidebar-products scroller">
                    {sidebarProducts.map((product: CatalogProduct) => product ? <SidebarProductDragable
                        key={"sidebar_product_" + product.BarCode}
                        className={"sidebar-item sidebar-product"}
                        product={product.BarCode} productName={product.Name} /> : null)
                    }
                </div>
                <div className="sidebar-utils" style={{ display: noStructure ? "none" : "initial" }}>
                    <TypedDragItem type={PlanogramDragDropTypes.SHELF_SIDEBAR} payload={{ name: "shelf" }}>
                        <div className="sidebar-util-item">
                            <h3>SHELF</h3>
                        </div>
                    </TypedDragItem>
                    <TypedDragItem type={PlanogramDragDropTypes.SECTION_SIDEBAR} payload={{ name: "section" }}>
                        <div className="sidebar-util-item">
                            <h3>SECTION</h3>
                        </div>
                    </TypedDragItem>
                </div>
            </div>
        )
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(PlanogramSidebar);