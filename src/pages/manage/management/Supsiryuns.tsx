import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { Sapak, Group, Supsiryun, SupsiryunName, Scrmenu } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { getGroups, getSapaks, getSupsiryuns, addSupsiryun, updateSupsiryun, getScrmenus, deleteSupsiryun } from 'shared/api/supsiryun.provider';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { placeholder, stringLiteral } from '@babel/types';
import { confirm } from 'devextreme/ui/dialog';

type SupsiryunsProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type SupsiryunsState = {
    groups: Group[],
    sapakim: Sapak[],
    scrmenus: Scrmenu[],
    supsiryuns: Supsiryun[],
    supsiryunNames: SupsiryunName[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class Supsiryuns extends Component<SupsiryunsProps> {
    dataGrid: any | null = null;
    dataLoading: boolean = false;
    state: SupsiryunsState = {
        groups: [],
        sapakim: [],
        scrmenus: [],
        supsiryuns: [],
        supsiryunNames: [],
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

    loadAllSapaks = async (): Promise<void> => {
        try {
            const sapakim = await getSapaks();
            this.setState({ sapakim });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllScrmenus = async (): Promise<void> => {
        try {
            const scrmenus = await getScrmenus();
            this.setState({ scrmenus });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllSupsiryuns = async (): Promise<void> => {
        try {
            const supsiryuns = await getSupsiryuns();
            this.setState({ supsiryuns });
            const supsiryunNames = [];
            this.setState({ supsiryunNames: [] });
            let length = supsiryuns.length;
            for (let i = 0; i < length; i++) {
                let supsiryunName = {
                    Id: supsiryuns[i].Id,
                    SapakId: supsiryuns[i].SapakId,
                    SapakName: supsiryuns[i].SapakId,
                    GroupId: supsiryuns[i].GroupId,
                    GroupName: supsiryuns[i].GroupId,
                    ScrId: supsiryuns[i].ScrId,
                    Place: supsiryuns[i].Place
                }
                supsiryunNames.push(supsiryunName);
            }
            this.setState({ supsiryunNames });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    addSupsiryun = async (SapakId: number, GroupId: number, ScrId: number, Place: number): Promise<void> => {
        await addSupsiryun(SapakId, GroupId, ScrId, Place);
    }

    updateSupsiryun = async (Id: number, SapakId: number, GroupId: number, ScrId: number, Place: number): Promise<void> => {
        await updateSupsiryun(Id, SapakId, GroupId, ScrId, Place);
    }

    deleteSupsiryun = async (Id: number): Promise<void> => {
        await deleteSupsiryun(Id);
    }

    init = async () => {
        await this.loadAllGroups();
        await this.loadAllSapaks();
        await this.loadAllScrmenus();
        await this.reloadAllSupsiryuns();
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
        if (typeof this.state.supsiryuns.filter(supsiryun => supsiryun.SapakId === parseInt(e.data.SapakId, 10)
            && supsiryun.GroupId === parseInt(e.data.GroupId, 10) && supsiryun.ScrId === parseInt(e.data.ScrId, 10))[0] !== 'undefined') {
            uiNotify('-   אי אפשר להוסיף את הצירוף הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            if (typeof this.state.supsiryuns.filter(supsiryun => supsiryun.ScrId === parseInt(e.data.ScrId, 10)
                && supsiryun.Place === parseInt(e.data.Place, 10))[0] !== 'undefined') {
                uiNotify('-   יש ספק אחר במיקום הזה. אנא הזן מיקום אחר', 'error');
                // cancel the event
                e.cancel = true;
            }
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        this.addSupsiryun(e.SapakName, e.GroupName, e.ScrId, e.Place).then(() => {
            // update the page to reflect the new peruk code
            this.reloadAllSupsiryuns();
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onRowUpdating(e: any) {
        let Id = e.key.Id;
        let SapakId = parseInt(e.oldData.SapakName, 10);
        let GroupId = parseInt(e.oldData.GroupName, 10);
        let Place = parseInt(e.oldData.Place, 10);
        let ScrId = parseInt(e.oldData.ScrId, 10);
        if (typeof e.newData.SapakName != 'undefined') {
            SapakId = e.newData.SapakName;
        }
        if (typeof e.newData.GroupName != 'undefined') {
            GroupId = e.newData.GroupName;
        }
        if (typeof e.newData.ScrId != 'undefined') {
            ScrId = e.newData.ScrId;
        }
        if (typeof e.newData.Place != 'undefined') {
            Place = e.newData.Place;
        }
        if (SapakId === 0 || GroupId === 0
            || Place === 0 || ScrId === 0) {
            uiNotify('-   השדה לא יכול להיות ריק', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            // check there is no other row in that screen place
            let supsiryunPlace = this.state.supsiryunNames.filter(function (supsiryunName) {
                return supsiryunName.ScrId === ScrId &&
                    supsiryunName.Place === Place;
            });
            if (typeof supsiryunPlace[0] != 'undefined') {
                uiNotify('-   יש ספק אחר במיקום הזה. אנא הזן מיקום אחר', 'error');
                // cancel the event
                e.cancel = true;
            } else {
                this.updateSupsiryun(Id, SapakId, GroupId, ScrId, Place).then(() => {
                    // update the page to reflect the new siba code
                    this.reloadAllSupsiryuns();
                }).catch(err => {
                    uiNotify(err, 'error');
                })
            }
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        this.updateSupsiryun(e.Id, e.SapakName, e.GroupName, e.ScrId, e.Place).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteSupsiryun(e.Id).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
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
        e.toolbarOptions.items.push({
            widget: 'dxButton',
            location: 'after',
            options: {
                text: 'טעינה מקובץ',
                onClick: this.showPopup.bind(this)
            }
        });
    }

    showPopup() {
        this.setState({ isPopupVisible: true, userMessage: '' });
    }

    hidePopup() {
        this.setState({ isPopupVisible: false, userMessage: '' });
    }

    // loadXLSX(e: any) {
    //     let file = e.target.file.files[0];
    //     if (typeof file === 'undefined') {
    //         console.log('file empty');
    //         uiNotify('אין אפשרות להשתמש בקובץ ריק', 'error');
    //         return;
    //     }
    //     if (!file.name.endsWith(".xlsx")) {
    //         console.log('file not of type XLSX');
    //         uiNotify('- אין אפשרות להשתמש בקובץ מסוג אחר מלבד אקסל', 'error');
    //         return;
    //     }
    //     let reader = new FileReader();
    //     reader.readAsBinaryString(file);
    //     reader.onloadend = async (e: any): Promise<void> => {
    //         console.log('uploading file', e);
    //         var data = e.target.result;
    //         var workLine = await XLSX.read(data, { type: 'binary' });
    //         var fileData: any[] = await XLSX.utils.sheet_to_json(workLine.Sheets[workLine.SheetNames[0]]);
    //         console.log('working', fileData, fileData.length);
    //         var excelLine: number = 1; // Line begins at 1 but in the file it is actually 2
    //         var message = '';
    //         for (var i = 0; i < fileData.length; i++) {
    //             if (!isNaN(fileData[i].BranchId) && typeof (fileData[i].Name) != 'undefined'
    //                 // && !isNaN(fileData[i].accessCode)
    //             ) {
    //                 // check if branch id already exists in this.state.branches
    //                 let id = this.state.branches.filter(branch => branch.BranchId === fileData[i].BranchId);
    //                 if (typeof id[0] !== 'undefined') {
    //                     // branch exists - we update the name for the line and the user message about the line
    //                     message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> מעדכן סניף ' + fileData[i].id;
    //                     console.log(message);
    //                     this.setState({ userMessage: message });
    //                     // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
    //                     await this.updateBranch(fileData[i].BranchId, fileData[i].Name, 0, 0, null, null, null)
    //                         .then(() => {
    //                         }).catch(err => {
    //                             uiNotify(err, 'error');
    //                         });
    //                 } else {
    //                     // branch dosn't exist - we add line and update the user message
    //                     message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> סניף ' + fileData[i].BranchId + ' ושם ' + fileData[i].Name + ' התווסף לטבלה';
    //                     console.log(message);
    //                     this.setState({ userMessage: message });
    //                     // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
    //                     await this.addBranch(fileData[i].BranchId, fileData[i].Name, 0, 0, null, null, null)
    //                         .then(() => {
    //                         }).catch(err => {
    //                             uiNotify(err, 'error');
    //                         });
    //                 }
    //                 excelLine++;
    //             } else {
    //                 message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> שם הסניף, מספר הסניף או קוד הגישה אינם תקינים';
    //                 console.log(message);
    //                 this.setState({ userMessage: message });
    //                 return;
    //             }
    //         }
    //         message = ' כל השורות בקובץ התעדכנו כראוי ';
    //         console.log(message);
    //         this.setState({ userMessage: message });
    //         // regradless of updates, we now need to re-load everything
    //         this.init().then(() => {
    //             this.setState({ loading: false })
    //         }).catch(err => {
    //             uiNotify(err, 'error');
    //         })
    //     }
    // }

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
                        <div className='header-text'>{"הגדרות חלוקה"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.supsiryunNames, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            //className="grid-element"
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

                            {/* <Scrolling mode={'virtual'}></Scrolling> */}
                            <Paging enabled={false} />
                            <Export enabled={true} fileName={'supsiryun'} />
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
                                <Popup title={'חלוקה'} showTitle={true} width={350} height={380}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'SapakName'} cssClass={'Form-item-texteditor'}/>
                                        <Item dataField={'GroupName'} cssClass={'Form-item-texteditor'}/>
                                        <Item dataField={'Place'} cssClass={'Form-item-texteditor'}/>
                                        <Item dataField={'ScrId'} cssClass={'Form-item-texteditor'}/>
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'SapakId'} caption={'קוד ספק'}><RequiredRule /></Column>
                            <Column dataField={'SapakName'} caption={'שם ספק'}
                                lookup={{
                                    dataSource: () => this.state.sapakim,
                                    displayExpr: "Name",
                                    valueExpr: "Id",
                                }}><RequiredRule /></Column>
                            <Column dataField={'GroupId'} caption={'קוד קבוצה'}><RequiredRule /></Column>
                            <Column dataField={'GroupName'} caption={'שם קבוצה'}
                                lookup={{
                                    dataSource: () => this.state.groups,
                                    displayExpr: "Name",
                                    valueExpr: "Id",
                                }}><RequiredRule /></Column>    
                            <Column dataField={'Place'} caption={'מיקום'}></Column>
                            <Column dataField={'ScrId'} caption={'מסך'}
                                lookup={{
                                    dataSource: () => this.state.scrmenus,
                                    displayExpr: "Name",
                                    valueExpr: "Id",
                                }}><RequiredRule /></Column>    
                        </DataGrid>
                        {/* <OutsidePopup title={'טעינה מקובץ'} showTitle={true} width={350} height={350} visible={this.state.isPopupVisible} onHiding={() => this.hidePopup()}>
                            <div className='grid-wrapper' dir='rtl'>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    this.loadXLSX(e);
                                }}>
                                    <input type="file" id="file" name="file" style={{ width: "235px", margin: "0 0 0 10px" }} />
                                    <Button text={'בצע'} useSubmitBehavior style={{ margin: "0px 0px 3px 0px" }}></Button>
                                </form>
                                <p>
                                    <b>{this.state.userMessage}</b>
                                </p>
                            </div>
                        </OutsidePopup> */}
                    </div>
                </div>
            </div>
        );
    }
}
