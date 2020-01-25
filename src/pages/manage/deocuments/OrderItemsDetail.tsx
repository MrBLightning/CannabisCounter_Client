import React, { Component } from 'react';

import DataGrid, {
    Column,
} from 'devextreme-react/data-grid';
import { OrderWithName, Order, OrderWithNameUnique, CatalogItem, UnitSize } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import { checkPageVersion } from 'shared/components/Version-control';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { getCatalogItems, getOrders, getUnitSizes } from 'shared/api/order.provider';

type OrderItemsDetailState = {
    orders: Order[],
    orderNames: OrderWithName[],
    catalogs: CatalogItem[],
    unitSizes: UnitSize[]
}

class OrderItemsDetailTemplate extends Component {
    constructor(props: any) {
        super(props);
        this.key = props.data.key;
    }
    //key: string = '';
    key: OrderWithName = {
        OrderNum: 0,
        Lines: 0,
        BarCode: 0,
        BarCodeName: 0,
        SapakId:0,
        UnitAriza: 0,
        AmountOrder: 0,
        BranchId: 0,
        BranchName: 0,
        OrderDate: new Date(), // created date
        CreatedBy: 0, // created by
        AspakaDate: new Date(),
        key: ''

    };
    state: OrderItemsDetailState = {
        orders: [],
        orderNames: [],
        catalogs: [],
        unitSizes: []
    };

    loadAllCatalogItems = async (): Promise<void> => {
        try {
            const catalogs = await getCatalogItems();
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllUnitSizes = async (): Promise<void> => {
        try {
            const unitSizes = await getUnitSizes();
            this.setState({ unitSizes });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllOrders = async (): Promise<void> => {
        try {
            let orders = await getOrders();
            orders = orders.filter(order => order.OrderNum == this.key.OrderNum);
            this.setState({ orders });
            let orderNames: OrderWithName[] = [];
            this.setState({ orderNames: [] });
            let length = this.state.orders.length;
            let item: CatalogItem;
            for (let i = 0; i < length; i++) {
                item = this.state.catalogs.filter(item => item.BarCode === this.state.orders[i].BarCode)[0];
                let orderName: OrderWithName = {
                    OrderNum: this.state.orders[i].OrderNum,
                    Lines: this.state.orders.filter(order => order.OrderNum == this.state.orders[i].OrderNum).length,
                    BarCode: this.state.orders[i].BarCode,
                    BarCodeName: this.state.orders[i].BarCode,
                    SapakId:this.state.orders[i].SapakId,
                    UnitAriza: parseInt(item.UnitAriza),
                    AmountOrder: this.state.orders[i].AmountOrder,
                    BranchId: this.state.orders[i].BranchId,
                    BranchName: this.state.orders[i].BranchId,
                    OrderDate: this.state.orders[i].OrderDate, // created date
                    CreatedBy: this.state.orders[i].CreatedBy, // created by
                    AspakaDate: this.state.orders[i].AspakaDate,
                    key: this.state.orders[i].OrderNum + ''
                };
                orderNames.push(orderName);
            }
            this.setState({ orderNames });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    init = async () => {
        await this.loadAllCatalogItems();
        await this.loadAllUnitSizes();
        await this.reloadAllOrders();
    }

    componentDidMount() {
        // check page version
        checkPageVersion();
        // check token expDate
        checkPageToeknTime();

        this.init().then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    render() {
        const { orderNames, catalogs, unitSizes } = this.state;

        // DO NOT ADD THIS. CREATES ERROR: Uncaught TypeError: this._contentReadyAction is not a function
        // if (this.state.loading)
        //     return (
        //         <div className="app-loader">
        //             <div className="loader" />
        //         </div>
        //     );

        return (
            <div style={{ height: "100%" }}>
                <React.Fragment>
                    <DataGrid
                        dataSource={orderNames}
                        showBorders={true}
                        // columnAutoWidth={true}
                        rtlEnabled={true}
                        rowAlternationEnabled={true}
                    // className="grid-element"
                    // width={'50%'} //Hardcoded
                    >

                        <Column dataField={'BarCode'} caption={'קוד פריט'}></Column>
                        <Column dataField={'BarCodeName'} caption={'שם פריט'}
                            lookup={{
                                dataSource: () => catalogs,
                                displayExpr: "Name",
                                valueExpr: "BarCode"
                            }}
                        ></Column>
                        <Column dataField={'AmountOrder'} caption={'כמות'}></Column>
                        <Column dataField={'UnitAriza'} caption={'יחידה'}
                            lookup={{
                                dataSource: () => unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}
                        ></Column>
                    </DataGrid>
                </React.Fragment>
            </div>
        );
    }

}

export default OrderItemsDetailTemplate;