import React, { Component } from 'react';
import { Item } from 'devextreme-react/form';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { SelectBox, DateBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Validator, RangeRule, } from 'devextreme-react/validator';
import { CampaignType, CatalogItem } from 'shared/interfaces/models/SystemModels';
import { getCampaignItems, getCatalogItems, updateProductCampaignItem, addProductCampaignItem, deleteProductCampaignItem, updateProductCampaignParent } from 'shared/api/product-campaign.provider';
import { uiNotify } from 'shared/components/Toast';
import { number } from 'prop-types';
import DataGrid, { Column, LoadPanel, Export, Editing, Paging, Scrolling, Popup, Form, RequiredRule as devRequired, MasterDetail, Lookup } from 'devextreme-react/data-grid';
import DataSource from 'devextreme/data/data_source';

const moment = require('moment');




type ProductCcampaignState = {
    loading: boolean,
    campaigns: CampaignType[],
    catalogs: CatalogItem[];

}

class ProductCampaign extends React.Component {

    constructor(props: any) {
        super(props);
    }

    normalizedCampaigns: any[] = [];
    catalogsJson: any = {};
    catalogsNames: any = {};
    parentData: any = {};


    state: ProductCcampaignState = {
        loading: true,
        campaigns: [],
        catalogs: []
    };



    componentDidMount() {
        this.setState({ loading: true })
        this.init().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    init = async () => {
        await this.loadAllCatalogs();
        await this.loadAllCampaign();
    }



    loadAllCampaign = async (): Promise<void> => {
        try {
            let campaigns = await getCampaignItems();
            this.setProductCampaignState(campaigns);
            this.setState({ campaigns });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllCatalogs = async (): Promise<void> => {
        try {
            const catalogs = await getCatalogItems();
            this.setState({ catalogs });

            let catalogsJson: any = {};
            for (let i = 0; i < catalogs.length; i++) {
                catalogsJson[catalogs[i].BarCode] = catalogs[i].BarCode + " " + catalogs[i].Name
            }
            this.catalogsJson = catalogsJson;


            let catalogsNames: any = [];
            for (let i = 0; i < catalogs.length; i++) {
                let item = {
                    barcode: catalogs[i].BarCode,
                    Name: catalogs[i].BarCode + " " + catalogs[i].Name
                }
                catalogsNames.push(item)
            }
            this.catalogsNames = catalogsNames;


        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    setProductCampaignState = (campaigns: CampaignType[]) => {
        let list = campaigns;
        let normalizedCampaigns: any[] = [];

        for (let i = 0; i < list.length; i++) {


            let item = list[i];
            let id = item.id;
            let beginAt = item.begin_at;
            let endAt = item.end_at;
            let _key = this.createKey(beginAt, endAt);
            let currentIndex = this.findKeyIndex(_key, normalizedCampaigns);

            if (currentIndex === -1) {
                normalizedCampaigns.push({
                    id: id,
                    index: _key,
                    begin_at: beginAt,
                    end_at: endAt,
                    items: [],
                    amount: 0,
                });

                currentIndex = normalizedCampaigns.length - 1;
            }

            if (item.barcode != 0) {
                normalizedCampaigns[currentIndex].items.push(item);
                normalizedCampaigns[currentIndex].amount += 1;
            }
        }

        normalizedCampaigns.sort(this.compare);

        this.normalizedCampaigns = normalizedCampaigns

    }

    findKeyIndex = (key: string, normalizedCampaigns: any[]) => {
        return normalizedCampaigns.findIndex(function (v) {
            return v.index === key;
        });
    }

    createKey = (beginDate: Date | null, endDate: Date | null) => {
        if (beginDate != null && endDate != null)
            return beginDate + "_" + endDate;
        else if (beginDate != null && endDate == null)
            return String(beginDate);
        else throw new Error("No date was found.");
    }

    compare = (a: any, b: any) => {
        if (a.begin_at > b.begin_at) {
            return -1;
        }
        if (a.begin_at < b.begin_at) {
            return 1;
        }
        return 0;
    }

    onEditorPreparing = (e: any) => {

        if (e.parentType !== "dataRow")
            return;

        e.editorOptions.height = 40;


        if (e.parentType == "dataRow" && e.dataField == "begin_at") {
            e.editorName = "dxDateBox";
            e.editorOptions.rtlEnabled = true;
            e.editorOptions.displayFormat = "dd/MM/yyyy";

        }
        if (e.parentType == "dataRow" && e.dataField == "end_at") {
            e.editorName = "dxDateBox";
            e.editorOptions.rtlEnabled = true;
            e.editorOptions.displayFormat = "dd/MM/yyyy";

        }

    }

    onEditorPreparingChiled = (e: any) => {

        if (e.parentType !== "dataRow")
            return;

        e.editorOptions.height = 40;

        if (e.parentType == "dataRow" && e.dataField == 'k1') {

            e.editorName = "dxSelectBox";
            e.editorOptions = {
                searchEnabled: true,
                rtlEnabled: true,
                dataSource: {
                    store: this.catalogsNames,
                    paginate: true,
                    pageSize: 30,
                },
                showClearButton: true,
                displayExpr: "Name",
                searchExpr: "Name",
                valueExpr: 'barcode',
                height: 40,
                onValueChanged: function (args: any) {
                    e.setValue(args.value);
                }
            }
        }

    }

    onRowUpdating = async (e: any) => {

        let id = e.key.id;


        let old_begin_at = moment(e.oldData.begin_at).format('YYYY-MM-DD');
        let old_end_at = moment(e.oldData.end_at).format('YYYY-MM-DD');

        // if (typeof e.newData.begin_at != 'undefined') {
        let begin_at = moment(e.newData.begin_at).format('YYYY-MM-DD');
        // }

        // if (typeof e.newData.end_at != 'undefined') {
        let end_at = moment(e.newData.end_at).format('YYYY-MM-DD');
        // }

        let record = {
            old_begin_at: old_begin_at,
            old_end_at: old_end_at,
            begin_at: begin_at,
            end_at: end_at
        }

        await updateProductCampaignParent(record).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllCampaign();
    }

    onRowUpdatingChiled = async (e: any) => {
        let id = e.key.id

        let barcode = e.oldData.k1;
        let singular_price = e.oldData.singular_price;

        if (typeof e.newData.k1 != 'undefined') {
            barcode = e.newData.k1;
        }

        if (typeof e.newData.singular_price != 'undefined') {
            singular_price = e.newData.singular_price;
        }

        let record = {
            barcode: barcode,
            singular_price: singular_price
        }

        await updateProductCampaignItem(id, record).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onRowInserting = async (e: any) => {
        let record = {
            begin_at: (e.data.begin_at),
            end_at: (e.data.end_at),
        }

        await addProductCampaignItem(record).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })

        this.loadAllCampaign();
    }

    onRowInsertingChiled = async (e: any) => {

        let record = {
            begin_at: this.parentData.begin_at,
            end_at: this.parentData.end_at,
            barcode: e.data.k1,
            singular_price: e.data.singular_price,
        }


        await addProductCampaignItem(record).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })

        this.loadAllCampaign();


    }

    onRowRemovingChiled = async (e: any) => {
        let id = e.key.id
        await deleteProductCampaignItem(id).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllCampaign();
    }

    renderDetail = (props: any) => {

        this.parentData = props.data;
        return (

            <div className='grid-wrapper'>
                <div className='grid-body'>
                    <div className='container'></div>
                    <DataGrid id={'gridContainer'} style={{ marginLeft: "auto", marginRight: "auto" }}
                        dataSource={props.data.items}
                        activeStateEnabled={false}
                        showColumnLines={true}
                        showRowLines={true}
                        showBorders={true}
                        rtlEnabled={true}

                        allowColumnResizing={false}
                        allowColumnReordering={false}
                        width={'70%'}
                        onEditorPreparing={this.onEditorPreparingChiled}
                        onRowInserting={this.onRowInsertingChiled}
                        onRowUpdating={(e) => this.onRowUpdatingChiled(e)}
                        onRowRemoving={(e) => this.onRowRemovingChiled(e)}
                    >
                        <Scrolling mode={'virtual'} />
                        <LoadPanel enabled={true} />
                        <Paging enabled={false} />
                        <Popup key="UPDATE_CHILED_POP" title={'הוספת ברקוד למבצע'} showTitle={true}  >
                        </Popup>
                        <Editing
                            mode={'row'}
                            allowUpdating={true}
                            allowDeleting={true}
                            allowAdding={true}
                            useIcons={true}>
                            <Form key="UPDATE_CHILED_FORM">
                                <Item itemType={'group'} >
                                    <Item dataField={'k1'} />
                                    <Item dataField={'singular_price'} />
                                </Item>
                            </Form>
                        </Editing>
                        <Column dataField={'k1'} caption={'ברקוד'} calculateDisplayValue={(e: any) => { return this.catalogsJson[e.barcode] }}></Column>
                        <Column dataField={'singular_price'} caption={'מחיר'} ></Column>
                        >
                </DataGrid>
                </div>
            </div>
        );
    }

    render() {
        if (this.state.loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        return (

            <div className='grid-wrapper'>
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'} style={{ marginLeft: "auto", marginRight: "auto" }}
                            onRowUpdating={(e) => this.onRowUpdating(e)}
                            dataSource={this.normalizedCampaigns}
                            activeStateEnabled={false}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            allowColumnResizing={false}
                            allowColumnReordering={false}
                            width={'60%'}
                            onEditorPreparing={this.onEditorPreparing}
                            onRowInserting={this.onRowInserting}

                        >
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />
                            <Paging enabled={false} />

                            <Editing
                                mode={'popup'}
                                allowUpdating={true}
                                allowAdding={true}

                                useIcons={true}>
                                <Popup key="UPDATE_DESTRUCTION_POP" title={'עדכון מבצע'} showTitle={true} width={450} height={350} >
                                </Popup>
                                <Form key="UPDATE_DESTRUCTION_FORM">
                                    <Item itemType={'group'} >
                                        <Item dataField={'begin_at'} />
                                        <Item dataField={'end_at'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'begin_at'} caption={'מתאריך'} dataType={"date"} format={'dd-MM-yyyy'} alignment={'center'}></Column>
                            <Column dataField={'end_at'} caption={'עד תאריך'} dataType={"date"} format={'dd-MM-yyyy'} alignment={'center'}></Column>
                            <Column dataField={'amount'} caption={'סה"כ מבצעים'} alignment={'center'}></Column>

                            <MasterDetail
                                enabled={true}
                                render={this.renderDetail}
                            />
                        </DataGrid>
                    </div>

                </div>
            </div >
        );
    }

}

export default ProductCampaign;
