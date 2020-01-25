import React, { Component } from 'react';
import { Item } from 'devextreme-react/form';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Validator, RangeRule, } from 'devextreme-react/validator';
import { Yedm, Branch } from 'shared/interfaces/models/SystemModels';
import { getYedmItems, updateYedmItem, deleteYedmItem, addYedmItem, getBranches } from 'shared/api/subtitle.provider';
import { uiNotify } from 'shared/components/Toast';
import { number } from 'prop-types';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
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
    Lookup
} from 'devextreme-react/data-grid';

type SubtitleState = {
    loading: boolean,
    yedmItems: Yedm[];
    branches: Branch[];
}

class Subtitle extends React.Component {

    state: SubtitleState = {
        loading: true,
        yedmItems: [],
        branches: [],
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
        await this.loadAllYedmItems();
        await this.loadAllBranches();


    }

    loadAllYedmItems = async (): Promise<void> => {
        try {
            const yedmItems = await getYedmItems();
            this.setState({ yedmItems });
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

    onEditorPreparing = (e: any) => {
        if (e.parentType == "dataRow" && e.dataField == 'k1') {

            var branchesList = [];
            e.value = '';

            if (!e.row.inserted) {
                if (e.row.data.snif_katan != null) {
                    if (e.row.data.snif_katan.length >= 1) {
                        var item1 = '[' + e.row.data.snif_katan + ']';
                        branchesList = JSON.parse(item1);
                        e.value = branchesList
                    }
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

    onRowUpdating = async (e: any) => {
        let Name = e.oldData.Name;
        let Id = e.oldData.Id;
        var snif_katan = e.oldData.k1;


        if (typeof e.newData.Name != 'undefined') {
            Name = e.newData.Name;
        }

        if (e.newData.k1 != undefined) {
            snif_katan = '';

            for (var i = 0; i < e.newData.k1.length; i++) {
                snif_katan += e.newData.k1[i] + ',';
            }
            snif_katan = snif_katan.substring(0, snif_katan.length - 1);
        }

        let record = {
            Id: Id,
            Name: Name,
            snif_katan: snif_katan
        }

        await updateYedmItem(Id, record).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })

        this.loadAllYedmItems();
    }

    onRowRemoved = async (e: any) => {
        let Id = e.data.Id;

        await deleteYedmItem(Id).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllYedmItems();

    }


    onRowInserted = async (e: any) => {
        let Name = e.data.Name
        let snif_katan = '';

        if (e.data.k1 != null) {
            for (var i = 0; i < e.data.k1.length; i++) {
                snif_katan += e.data.k1[i] + ',';
            }
            snif_katan = snif_katan.substring(0, snif_katan.length - 1);
        }

        let record={
            Name:Name,
            snif_katan:snif_katan
        }

        await addYedmItem(record).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllYedmItems();

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
                            onRowInserted={(e) => this.onRowInserted(e)}
                            dataSource={this.state.yedmItems}
                            activeStateEnabled={false}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            allowColumnResizing={false}
                            allowColumnReordering={false}
                            rowAlternationEnabled={true}
                            onEditorPreparing={this.onEditorPreparing}
                            width={'60%'} //Hardcoded

                        >
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />
                            <Export enabled={true} fileName={'subtitle'} />
                            <Paging enabled={false} />
                            <Editing
                                mode={'popup'}
                                allowUpdating={true}
                                allowDeleting={true}
                                allowAdding={true}

                                useIcons={true}>
                                <Popup key="UPDATE_DESTRUCTION_POP" title={'כותרת ידיעון'} showTitle={true} width={500} height={250} >
                                </Popup>
                                <Form key="UPDATE_SUBTITLE_FORM">
                                    <Item itemType={'group'} >
                                        <Item dataField={'Name'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'k1'} />
                                    </Item>
                                </Form>
                            </Editing>
                            <Column dataField={'Name'} caption={'כותרת ידיעון'} width={200}></Column>
                            <Column dataField={'k1'} caption={"סניפים קטנים"} visible={false} ></Column>
                        </DataGrid>
                    </div>

                </div>
            </div >
        );
    }

}

export default Subtitle;
