import React, { Component } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling } from 'devextreme-react/data-grid';
import { NavBarSection, Subgroup, Group } from 'shared/interfaces/models/SystemModels';
import { getSubgroups, addSubgroup, updateSubgroup, deleteSubgroup, getGroups } from 'shared/api/subgroup.provider';
import { uiNotify } from 'shared/components/Toast';
import { Item } from 'devextreme-react/form';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';

type SubgroupsProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type SubgroupsState = {
    subgroups: Subgroup[],
    groups:Group[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class SubGroups extends Component<SubgroupsProps> {
    dataGrid: any | null = null;
    state: SubgroupsState = {
        subgroups: [],
        groups:[],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    loadAllGroups = async (): Promise<void> => {
        try {
            const groups = await getGroups();
            this.setState({ groups });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for reloading all Subgroups
    reloadAllSubgroups = async (): Promise<void> => {
        // get all the lines in table 'sub_group' from the node server
        try {
            const subgroups = await getSubgroups();
            this.setState({ subgroups });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for adding a Subgroup
    addSubgroup = async (Id: number, Name: string, GroupId: number): Promise<void> => {
        await addSubgroup(Id, Name, GroupId);
    }

    // function for updating a Subgroup
    updateSubgroup = async (Id: number, Name: string, GroupId: number): Promise<void> => {
        await updateSubgroup(Id, Name, GroupId);
    }

    // function for deleting a Subgroup
    deleteSubgroup = async (Id: number): Promise<void> => {
        await deleteSubgroup(Id);
    }

    init = async () => {
        await this.loadAllGroups();
        await this.reloadAllSubgroups();
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
        if (typeof this.state.subgroups.filter(subgroup => subgroup.Id === parseInt(e.data.Id, 10))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הקוד הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        // insert row with e.id and e.Name into table 'sub_group'
        this.addSubgroup(e.Id, e.Name, e.GroupId).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        // update row with e.id's name to e.Name in table 'sub_group'
        this.updateSubgroup(e.Id, e.Name, e.GroupId).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteSubgroup(e.Id).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onEditorPreparing = (event: any) => {
        // https://www.devexpress.com/Support/Center/Question/Details/T749901/datagrid-allow-column-editing-on-insert-but-not-on-update
        let inserting = false;
        let updating = false;
        if ((typeof (event.row) != 'undefined') && (typeof (event.row.data.Id) != 'undefined')) {
            updating = true;
        } else {
            inserting = true;
        }

        const notEditableOnUpdate: any = ['Id']; // data field names of columns not editable on update  
        const notEditableOnInsert: any = []; // data field names of columns not editable on insert  

        if (inserting && notEditableOnInsert.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        } else if (updating && notEditableOnUpdate.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        }
    }

    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.unshift({
            location: 'before',
        }, {
            location: 'after',
            widget: 'dxButton',
            options: {
                icon: 'refresh',
                onClick: this.refreshDataGrid.bind(this)
            }
        });
    }

    refreshDataGrid() {
        this.dataGrid.clearFilter();
    }

    componentWillUnmount() {
        this.dataGrid = null;
    }

    render() {
        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"קבוצות משנה"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.subgroups, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            onRowInserting={(e) => this.onRowInserting(e)}
                            onRowInserted={(e) => this.onRowInserted(e.data)}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                            onEditorPreparing={this.onEditorPreparing}
                        //onToolbarPreparing={this.onToolbarPreparing}
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
                            <Export enabled={true} fileName={'subgroups'} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Popup title={'קבוצות משנה'} showTitle={true} width={400} height={230}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'Id'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Name'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'GroupId'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'Id'} caption={'מספר קבוצת משנה'}><RequiredRule /></Column>
                            <Column dataField={'Name'} caption={'קבוצת משנה'}><RequiredRule /></Column>
                            <Column dataField={'GroupId'} caption={'קבוצה'} width={150} lookup={{
                                dataSource: () => this.state.groups,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>
                        </DataGrid>
                    </div>
                </div>
            </div>
        );
    }
}
