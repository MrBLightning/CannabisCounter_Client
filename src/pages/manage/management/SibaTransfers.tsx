import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { SibaRes, Siba } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { getSibaRes, getSibas, addSiba, updateSiba, deleteSiba } from 'shared/api/sibas.provider';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { placeholder, stringLiteral } from '@babel/types';
import { confirm } from 'devextreme/ui/dialog';

type SibaTransfersProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type SibaTransfersState = {
    sibares: SibaRes[],
    sibas: Siba[],
    sibaFiltered: Siba[],
    filterValue: number,
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class SibaTransfers extends Component<SibaTransfersProps> {
    dataGrid: any | null = null;
    dataLoading: boolean = false;
    state: SibaTransfersState = {
        sibares: [],
        sibas: [],
        sibaFiltered: [],
        // initial filter value to Transfer - siba code 2
        filterValue: 2,
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    loadAllSibaRes = async (): Promise<void> => {
        try {
            const sibares = await getSibaRes();
            this.setState({ sibares });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllSibas = async (): Promise<void> => {
        try {
            const sibas = await getSibas();
            this.setState({ sibas });
            const sibaFiltered = sibas.filter(siba => siba.Siba === this.state.filterValue);
            this.setState({ sibaFiltered });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    addSiba = async (Siba: number, Description: string): Promise<void> => {
        await addSiba(Siba, Description);
    }

    updateSiba = async (Id: number, Siba: number, Description: string): Promise<void> => {
        await updateSiba(Id, Siba, Description);
    }

    deleteSiba = async (Id: number): Promise<void> => {
        await deleteSiba(Id);
    }

    init = async () => {
        await this.loadAllSibaRes();
        await this.reloadAllSibas();
    }


    componentDidMount() {
        // check page version
        checkPageVersion();
        // check token expDate
        checkPageToeknTime();

        this.setState({ loading: true })
        this.init().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })
    };

    // part of the DataGrid life-cycle. Happens as soon as a line is added into the page table
    onRowInserting = (e: any) => {
        if (typeof this.state.sibas.filter(siba => siba.Siba === parseInt(e.data.Siba) && siba.Description === e.data.Description)[0] !== 'undefined') {
            uiNotify('-   אי אפשר להוסיף את הרשומה הזו - היא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        let siba = this.state.filterValue;
        this.addSiba(siba, e.Description).then(() => {
            // update the page to reflect the new peruk code
            this.reloadAllSibas();
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onRowUpdating(e: any) {
        e.newData.Siba = this.state.filterValue;
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        let siba = this.state.filterValue;
        this.updateSiba(e.Id, siba, e.Description).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteSiba(e.Id).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.push({
            location: "before",
            locateInMenu: 'never',
            template: function () {
                return ("<div className='toolbar-label'> עדכן: </div>");
            },
        }, {
            location: 'before',
            widget: 'dxSelectBox',
            //locateInMenu: 'auto',
            rtlEnabled: true,
            options: {
                //searchEnabled: true,
                //showClearButton: true,
                width: 100,
                // dataSource: this.state.sibares,
                // HARD CODED COPY OF TABLE siba_res
                dataSource: [{
                    "Id": 1,
                    "Name": "השמדה",
                }, {
                    "Id": 2,
                    "Name": "העברה",
                }, {
                    "Id": 3,
                    "Name": "המרה",
                }, {
                    "Id": 3,
                    "Name": "שם מאשר",
                }],
                displayExpr: "Name",
                valueExpr: "Id",
                value: this.state.filterValue,
                onValueChanged: this.filterChanged.bind(this)
            }
        });
    }

    filterChanged(e: any) {
        this.setState({ loading: true })
        const sibaFiltered = this.state.sibas.filter(siba => siba.Siba === e.value);
        this.setState({
            sibaFiltered,
            filterValue: e.value,
            loading: false
        })
    }

    componentWillUnmount() {
        this.dataGrid = null;
    }

    render() {
        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"סיבות העברה"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.sibaFiltered, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            // className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            onRowInserting={(e) => this.onRowInserting(e)}
                            onRowInserted={(e) => this.onRowInserted(e.data)}
                            onRowUpdating={(e) => this.onRowUpdating(e)}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                            // onEditorPreparing={this.onEditorPreparing}
                            // onToolbarPreparing={this.onToolbarPreparing}
                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <HeaderFilter visible={true} />
                            <LoadPanel enabled={true} />

                            <Paging enabled={false} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Texts
                                    confirmDeleteMessage="האם אתם בטוחים שברצונכם למחוק את השורה הזו?"
                                />
                                <Popup title={'עדכון סיבות העברה'} showTitle={true} width={350} height={210}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        {/* <Item dataField={'Siba'} cssClass={'Form-item-texteditor'} /> */}
                                        <Item dataField={'Description'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'Siba'} visible={false} allowEditing={false} lookup={{
                                dataSource: () => this.state.sibares,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>
                            <Column dataField={'Description'} caption={'תאור'}><RequiredRule /></Column>
                        </DataGrid>
                    </div>
                </div>
            </div>
        );
    }
}
