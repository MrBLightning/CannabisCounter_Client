import React, { Component } from 'react';
import { Item } from 'devextreme-react/form';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Validator, RangeRule, } from 'devextreme-react/validator';
import { Yeds, Branch } from 'shared/interfaces/models/SystemModels';
import { getYedItems, updateYedItem, deleteYedItem, addYedItem, getBranches } from 'shared/api/yed.provider';
import { uiNotify } from 'shared/components/Toast';
import { number } from 'prop-types';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { DropDownBox, List, TreeView } from 'devextreme-react';
import "../pages.scss";


import DataGrid, {
    Column,
    FilterRow,
    HeaderFilter,
    LoadPanel,
    Export,
    Editing,
    Paging,
    Scrolling,
    ColumnChooser,
    Popup,
    Form,
    RequiredRule as devRequired,
    MasterDetail,
    RequiredRule,
    Lookup,
} from 'devextreme-react/data-grid';

const options = ['אושר', 'בירור', 'לא אושר'];


type YedState = {
    loading: boolean,
    YedItems: Yeds[];
    isPopupVisible: boolean,
    branches: Branch[]
}

class Yed extends React.Component {
    dateBoxOptions = { width: '100%' };

    state: YedState = {
        loading: true,
        YedItems: [],
        isPopupVisible: true,
        branches: []
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
        await this.loadAllYedItems();
        await this.loadAllBranches();
    }

    loadAllYedItems = async (): Promise<void> => {
        try {
            const YedItems = await getYedItems();
            this.setState({ YedItems });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllBranches = async (): Promise<void> => {
        try {
            const branches = await getBranches();
            this.setState({ branches });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    onRowUpdating = async (e: any) => {
        var snif_katan = e.oldData.k1;
        let fdatec = e.oldData.fdatec;
        let tdatec = e.oldData.tdatec;
        let date_buy = e.oldData.date_buy;
        let Name = e.oldData.Name;
        let Id = e.key.Id;
        let rem_lines = e.oldData.rem_lines;

        if (typeof e.newData.fdatec != 'undefined') {
            fdatec = e.newData.fdatec;
        }

        if (typeof e.newData.tdatec != 'undefined') {
            tdatec = e.newData.tdatec;
        }

        if (typeof e.newData.date_buy != 'undefined') {
            date_buy = e.newData.date_buy;
        }

        if (typeof e.newData.Name != 'undefined') {
            Name = e.newData.Name;
        }

        if (typeof e.newData.rem_lines != 'undefined') {
            rem_lines = e.newData.rem_lines;
        }


        if (e.newData.k1 != undefined) {
            snif_katan = '';
            for (var i = 0; i < e.newData.k1.length; i++) {
                snif_katan += e.newData.k1[i] + ',';
            }
            snif_katan = snif_katan.substring(0, snif_katan.length - 1);
        }

        await updateYedItem(Name, Id, fdatec, tdatec, date_buy, rem_lines, snif_katan).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllYedItems();

    }

    onRowRemoved = async (e: any) => {
        let Id = e.key.Id;
        await deleteYedItem(Id).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onEditorPreparing = (e: any) => {

        if (e.parentType !== "dataRow")
            return;

        e.editorOptions.height = 40;

        if (e.parentType == "dataRow" && e.dataField == "rem_lines") {
            e.editorName = "dxTextArea";
            e.editorOptions.height = 450;
            e.editorOptions.width = "95%";
            e.editorOptions.value = e.value;
        }
        if (e.parentType == "dataRow" && e.dataField == "fdatec") {
            e.editorName = "dxDateBox";
            e.editorOptions.rtlEnabled = true;
            e.editorOptions.displayFormat = "dd/MM/yyyy";

        }
        if (e.parentType == "dataRow" && e.dataField == "tdatec") {
            e.editorName = "dxDateBox";
            e.editorOptions.rtlEnabled = true;
            e.editorOptions.displayFormat = "dd/MM/yyyy";

        }
        if (e.parentType == "dataRow" && e.dataField == "date_buy") {
            e.editorName = "dxDateBox";
            e.editorOptions.rtlEnabled = true;
            e.editorOptions.displayFormat = "dd/MM/yyyy";
        }

        if (e.parentType == "dataRow" && e.dataField == 'k1') {

            var branchesList = [];
            if (!e.row.inserted) {
                if (e.row.data.snif_katan.length >= 1) {
                    var item1 = '[' + e.row.data.snif_katan + ']';
                    branchesList = JSON.parse(item1);
                    e.value = branchesList
                }
            }

            e.editorName = "dxTagBox";
            e.editorOptions = {
                searchEnabled: true,
                rtlEnabled: true,
                dataSource: this.state.branches,
                valueExpr: 'BranchId',
                displayExpr: 'Name',
                showSelectionControls: true,
                height: 40,
                value: e.value || branchesList,
                onValueChanged: function (args: any) {
                    e.setValue(args.value);
                }
            }
        }

    }

    onRowInserting = async (e: any) => {

        var snif1 = '';
        if (e.data.k1 != null) {
            for (var i = 0; i < e.data.k1.length; i++) {
                snif1 += e.data.k1[i] + ',';
            }
            snif1 = snif1.substring(0, snif1.length - 1);
        }
        var rec1 = {
            fdatec: (e.data.fdatec),
            tdatec: (e.data.tdatec),
            date_buy: (e.data.date_buy),
            snif_katan: snif1,
            Name: e.data.Name,
            rem_lines: e.data.rem_lines
        }
        await addYedItem(rec1).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllYedItems();
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
                            onRowRemoved={(e) => this.onRowRemoved(e)}
                            onRowInserting={(e) => this.onRowInserting(e)}

                            dataSource={this.state.YedItems}
                            activeStateEnabled={false}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            allowColumnResizing={false}
                            allowColumnReordering={false}
                            onEditorPreparing={this.onEditorPreparing}
                            width={'100%'} //Hardcoded

                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />
                            <Export enabled={true} fileName={'Yeds'} />
                            <Paging enabled={false} />
                            <Editing
                                mode={'popup'}
                                allowUpdating={true}
                                allowDeleting={true}
                                allowAdding={true}
                                useIcons={true}>
                                <Popup key="YED_POP" title={'כותרת ידיעון'} showTitle={true} width={"50%"} height={"100%"}
                                >
                                </Popup>
                                <Form key="UPDATE_YED_FORM" >
                                    <Item itemType={'group'} colCount={3} >
                                        <Item dataField={'Name'} colSpan={3} colCount={3} />
                                        <Item dataField={'fdatec'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'tdatec'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'date_buy'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'k1'} colCount={3} colSpan={3} />
                                        <Item dataField={'rem_lines'} colCount={3} colSpan={3} cssClass={'Form-item-text-area-editor'} ></Item>
                                    </Item>
                                </Form>
                            </Editing>
                            <Column dataField={'Name'} caption={'כותרת ידיעון'} ><RequiredRule /></Column>
                            <Column caption={'צרכן'}  >
                                <Column dataField={'fdatec'} caption={'מתאריך'} dataType={"date"} format={'dd-MM-yyyy'}></Column>
                                <Column dataField={'tdatec'} caption={'עד תאריך'} dataType={"date"} format={'dd-MM-yyyy'}></Column>
                                <Column dataField={'date_buy'} caption={'תא. קניה'} dataType={"date"} format={'dd-MM-yyyy'}></Column>
                            </Column>
                            <Column dataField={'k1'} caption={"סניפים קטנים"} visible={false} ></Column>
                            <Column dataField={'rem_lines'} caption={"דגשים"} visible={false} ></Column>
                        </DataGrid>
                    </div>
                </div>
            </div >
        );
    }

}

export default Yed;
