import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Column, Scrolling, Summary } from 'devextreme-react/data-grid';
import { CatalogItem, Supsiryun, Group, Sapak, Siryun } from 'shared/interfaces/models/SystemModels';
import { getItems, getGroups, getSupSiryuns, getSapakim, getSiryunByDate, addSiryun, updateSiryun, getSiryunTable } from 'shared/api/reserveChicken.provider';
import { uiNotify } from 'shared/components/Toast';
import { checkPageVersion } from 'shared/components/Version-control';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { AuthUser } from 'shared/interfaces/models/User';
import Moment from 'moment';

type ReserveChickensProps = {
    permission: RbacPermission,
    user: AuthUser;
} & RouteComponentProps;

type ReserveChickensState = {
    catalogs: CatalogItem[],
    supSiryuns: Supsiryun[],
    siryuns: Siryun[],
    sapakim: Sapak[],
    groups: Group[],
    mySiryuns: any[],
    searchDate: Date,
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class ReserveChickens extends Component<ReserveChickensProps> {
    dataGrid: any | null = null;
    state: ReserveChickensState = {
        catalogs: [],
        supSiryuns: [],
        siryuns: [],
        sapakim: [],
        groups: [],
        mySiryuns: [],
        searchDate: new Date(),
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    loadAllItems = async (): Promise<void> => {
        try {
            let catalogs = await getItems();
            // Since we only work with FISH in this screen we only need items
            // where ClassesId == 1 (Department עוף)
            catalogs = catalogs.filter(catalog => catalog.ClassesId == 1);
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllGroups = async (): Promise<void> => {
        try {
            let groups = await getGroups();
            this.setState({ groups });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSapakim = async (): Promise<void> => {
        try {
            let sapakim = await getSapakim();
            this.setState({ sapakim });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSupSiryuns = async (): Promise<void> => {
        try {
            let allSupSiryuns = await getSupSiryuns();
            // Since we only work with FISH in this screen we only need groups
            // where ClassesId == 1 (Department עוף)
            let availGroups = this.state.groups.filter(group => group.ClassId == 1);
            let supSiryuns: Supsiryun[] = [];
            for (let i = 0; i < allSupSiryuns.length; i++) {
                let availGroup = availGroups.filter(group => group.Id == allSupSiryuns[i].GroupId)[0];
                if (availGroup && typeof availGroup != undefined) {
                    // console.log('loadAllSupSiryuns',allSupSiryuns[i].GroupId,availGroup.ClassId);
                    supSiryuns.push(allSupSiryuns[i]);
                }
            }
            this.setState({ supSiryuns });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllSiryuns = async (): Promise<void> => {
        try {
            this.setState({ loading: true })
            let mySiryuns = await getSiryunTable(this.state.searchDate.getTime());
            this.setState({ mySiryuns });
            this.setState({ loading: false })
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
        // const { user } = this.props;
        // try {
        //     // create the data source object for this page
        //     let mySiryuns = [];
        //     for (let y = 0; y < this.state.catalogs.length; y++) {
        //         let line: any = {};
        //         line = {
        //             BarCode: this.state.catalogs[y].BarCode,
        //             CreateDate: null,
        //             TotSiryun: 0,
        //             TotHaluka: 0
        //         }
        //         for (let n = 0; n < this.state.supSiryuns.length; n++) {
        //             let sup2 = "sup_siryun_" + this.state.supSiryuns[n].SapakId;
        //             let sup3 = "sup_haluka_" + this.state.supSiryuns[n].SapakId;
        //             line[sup2] = null;
        //             line[sup3] = null;
        //         }
        //         mySiryuns.push(line);
        //     }
        //     let siryuns = await getSiryunByDate(Moment(this.state.searchDate).format('YYYY-MM-DD'));
        //     this.setState({ siryuns });
        //     // console.log('siryuns for date', Moment(this.state.searchDate).format('YYYY-MM-DD'),siryuns);
        //     let length = this.state.catalogs.length;
        //     for (let i = 0; i < length; i++) {
        //         // console.log(this.state.catalogs[i].BarCode)
        //         let siryunBar = siryuns.filter(siryun => siryun.BarCode == this.state.catalogs[i].BarCode);
        //         if (typeof siryunBar[0] === 'undefined') {
        //             // console.log('addSiryun', this.state.catalogs[i].BarCode);
        //             for (let n = 0; n < this.state.supSiryuns.length; n++) {
        //                 //console.log("addSiryun",this.state.catalogs[i].BarCode,this.state.supSiryuns[n].SapakId);
        //                 this.addSiryun(
        //                     new Date(Moment(this.state.searchDate).format('YYYY-MM-DD')),
        //                     this.state.catalogs[i].BarCode,
        //                     this.state.catalogs[i].ClassesId,
        //                     this.state.catalogs[i].GroupId,
        //                     this.state.supSiryuns[n].SapakId,
        //                     null,
        //                     user.id)
        //             }
        //         } else {
        //             let bLength = siryunBar.length;
        //             // console.log('update amounts for',this.state.catalogs[i].BarCode);
        //             for (let y = 0; y < mySiryuns.length; y++) {
        //                 // DOSN'T WORK - let index = mySiryuns.indexOf((line: any) => line.BarCode == siryunBar[b].BarCode);
        //                 if (mySiryuns[y].BarCode == siryunBar[0].BarCode) {
        //                     for (let b = 0; b < bLength; b++) {
        //                         //console.log(y, b, mySiryuns[y].BarCode, mySiryuns[y].TotSiryun);
        //                         let sup2 = "sup_siryun_" + siryunBar[b].SapakId;
        //                         mySiryuns[y][sup2] = siryunBar[b].SapakSiryun;
        //                         mySiryuns[y].TotSiryun = mySiryuns[y].TotSiryun + siryunBar[b].SapakSiryun;
        //                         mySiryuns[y].CreateDate = siryunBar[b].CreateDate;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     this.setState({mySiryuns});
        // } catch (err) {
        //     console.error(err);
        //     uiNotify(err, 'error');
        // }
    }

    addSiryun = async (CreateDate: Date, BarCode: number, ClassId: number, GroupId: number, SapakId: number, SapakSiryun: number | null, CreatedBy: number): Promise<void> => {
        await addSiryun(new Date(Moment(CreateDate).format('YYYY-MM-DD')), BarCode, ClassId, GroupId, SapakId, SapakSiryun, CreatedBy);
    }

    updateSiryun = async (CreateDate: Date, BarCode: number, SapakId: number, SapakSiryun: number | null): Promise<void> => {
        await updateSiryun(Moment(CreateDate).format('YYYY-MM-DD'), BarCode, SapakId, SapakSiryun);
    }

    // deleteDepartment = async (Id: number): Promise<void> => {
    //     await deleteDepartment(Id);
    // }

    init = async () => {
        await this.loadAllItems();
        await this.loadAllGroups();
        await this.loadAllSapakim();
        await this.loadAllSupSiryuns();
        await this.reloadAllSiryuns();
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


    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        let length = this.state.supSiryuns.length;
        for (let n = 0; n < length; n++) {
            let sup2 = "sup_siryun_" + this.state.supSiryuns[n].SapakId;
            // console.log('onRowUpdated',e.CreateDate,e.BarCode,this.state.supSiryuns[n].SapakId, e[sup2]);
            let amount: number | null;
            e[sup2] > 0 ? amount = e[sup2] : amount = null;
            this.updateSiryun(e.CreateDate, e.BarCode, this.state.supSiryuns[n].SapakId, amount).then(() => {
            }).catch(err => {
                uiNotify(err, 'error');
            })
        }
        this.reloadAllSiryuns();
    }

    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.unshift(
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    visible: false,
                    icon: 'refresh',
                    onClick: this.refreshDataGrid.bind(this)
                }
            },{
                location: 'after',
                widget: 'dxButton',
                options: {
                    icon: 'refresh',
                    onClick: this.refreshDataGrid.bind(this)
                }
            }
        );
        e.toolbarOptions.items.push(
            {
                widget: 'dxDateBox',
                location: 'after',
                options: {
                    value: this.state.searchDate,
                    rtlEnabled: true,
                    placeholder: "בחר תאריך...",
                    displayFormat: "dd/MM/yyyy",
                    acceptCustomValue: false,
                    editEnabled: false,
                    width: "120px",
                    onValueChanged: this.changeDate.bind(this),
                    onOpened: (e: any) => {
                        if (!e.component.option('isValid'))
                            e.component.reset();
                    },
                },

            }
        );
    }

    changeDate = (e: any) => {
        // console.log('date', e.value);
        this.setState({ searchDate: e.value });
        this.reloadAllSiryuns();
    }

    refreshDataGrid() {
        this.dataGrid.clearFilter();
    }

    componentWillUnmount() {
        this.dataGrid = null;
    }

    onCellPrepared = (e: any) => {
        if (e.rowType == 'data' && typeof e.column.dataField != 'undefined' && e.column.dataField.indexOf('sup_husman') >= 0) {
            if (e.displayValue == '1001') {
                e.cellElement.style.color = 'green';
            }
            else {
                e.cellElement.style.backgroundColor = 'pink';
            }
        }
    }

    customizeText = (cellInfo: any) => {
        if (cellInfo.value == 0 || 
            //typeof cellInfo.value == 'undefined' || 
            cellInfo.value == null) {
            return '';
        } else return cellInfo.value + '';
    }

    render() {
        const { loading, supSiryuns, sapakim, catalogs } = this.state;
        let columns = [
            <Column key='b_BarCode' dataField={'BarCode'} caption={'פריט'} allowEditing={false} dataType={'string'} fixed={true} fixedPosition={'right'}
                width={170}
                lookup={{
                    dataSource: () => catalogs,
                    displayExpr: "Name",
                    valueExpr: "BarCode"
                }} />,
            <Column key='b_TotSiryun' dataField={'TotSiryun'} caption={'סהכ מוזמן'}
                customizeText={this.customizeText}
                allowEditing={false} allowFiltering={false} dataType={'number'} fixed={true} fixedPosition={'right'} />,
            <Column key='b_TotHaluka' dataField={'TotHaluka'} caption={'סהכ חלוקה'}
                customizeText={this.customizeText}
                allowEditing={false} allowFiltering={false} dataType={'number'} fixed={true} fixedPosition={'right'} />
        ];

        let totalItems: any = [];

        for (let i = 0; i < supSiryuns.length; i++) {
            let sup2 = "sup_siryun_" + supSiryuns[i].SapakId;
            let sup3 = "sup_husman_" + supSiryuns[i].SapakId;
            columns.push(
                <Column key={'b_sup' + supSiryuns[i].SapakId} alignment={'center'} caption={sapakim.filter(sapak => sapak.Id == supSiryuns[i].SapakId)[0].Name} columns={
                    [{
                        caption: 'שיריון',
                        dataField: sup2,
                        allowFiltering: false,
                        dataType: 'number',
                        alignment: 'center',
                        customizeText: this.customizeText
                    }, {
                        caption: 'הוזמן',
                        dataField: sup3,
                        allowEditing: false,
                        allowFiltering: false,
                        dataType: 'number',
                        alignment: 'center',
                        customizeText: this.customizeText
                    }]
                }>
                </Column>
            );
            totalItems.push({column:sup2,summaryType:'sum',displayFormat: "{0}"});
            totalItems.push({column:sup3,summaryType:'sum',displayFormat: "{0}"});
        }

        if (loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        return (
            <div className='grid-wrapper'>
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.mySiryuns, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            wordWrapEnabled={true}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onCellPrepared={(e) => this.onCellPrepared(e)}
                            onToolbarPreparing={this.onToolbarPreparing}
                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <HeaderFilter visible={true} />
                            <LoadPanel enabled={true} />

                            <Scrolling mode={'virtual'}></Scrolling>
                            <Paging enabled={false} />
                            {/* <Export enabled={true} fileName={'departments'} /> */}
                            <Editing
                                mode={'batch'}
                                allowUpdating={this.props.permission.edit}
                                // allowDeleting={this.props.permission.delete}
                                // allowAdding={this.props.permission.create}
                                useIcons={true}>
                            </Editing>

                            {columns}

                            <Summary totalItems={totalItems}></Summary>
                        </DataGrid>
                    </div>
                </div>
            </div>
        );
    }
}