import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { NavBarSection, Degem } from 'shared/interfaces/models/SystemModels';
import { getDegems, addDegem, updateDegem, deleteDegem } from 'shared/api/degem.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';


type DegemsProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type DegemsState = {
    degems: Degem[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class Degems extends Component<DegemsProps> {
    dataGrid: any | null = null;
    state: DegemsState = {
        degems: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    // function for reloading all Degems
    reloadAllDegems = async (): Promise<void> => {
        // get all the lines in table 'classes' from the node server
        try {
            const degems = await getDegems();
            this.setState({ degems });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for adding a Degem
    addDegem = async (Id: number, Name: string): Promise<void> => {
        await addDegem(Id, Name);
    }

    // function for updating a Degem
    updateDegem = async (Id: number, Name: string): Promise<void> => {
        await updateDegem(Id, Name);
    }

    // function for deleting a Degem
    deleteDegem = async (Id: number): Promise<void> => {
        await deleteDegem(Id);
    }

    componentDidMount() {
        // check page version
        checkPageVersion();
        // check token expDate
        checkPageToeknTime();

        this.setState({ loading: true })
        this.reloadAllDegems().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })
    };

    // part of the DataGrid life-cycle. Happens as soon as a line is added into the page table
    onRowInserting = (e: any) => {
        if (typeof this.state.degems.filter(degem => degem.Id === parseInt(e.data.Id, 10))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הקוד הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        // insert row with e.id and e.Name into table 'classes'
        this.addDegem(e.Id, e.Name).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        // update row with e.id's name to e.Name in table 'classes'
        this.updateDegem(e.Id, e.Name).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteDegem(e.Id).then(() => {

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
        e.toolbarOptions.items.unshift(
            // {
            //     location: 'after',
            //     widget: 'dxButton',
            //     options: {
            //         icon: 'refresh',
            //         onClick: this.refreshDataGrid.bind(this)
            //     }
            // },
            {
                widget: 'dxButton',
                location: 'before',
                options: {
                    text: 'טעינה מקובץ',
                    onClick: this.showPopup.bind(this)
                }
            }
        );
    }

    showPopup() {
        this.setState({ isPopupVisible: true, userMessage: '' });
    }

    hidePopup() {
        this.setState({ isPopupVisible: false, userMessage: '' });
    }

    loadXLSX(e: any) {
        let file = e.target.file.files[0];
        if (typeof file === 'undefined') {
            console.log('file empty');
            uiNotify('אין אפשרות להשתמש בקובץ ריק', 'error');
            return;
        }
        if (!file.name.endsWith(".xlsx")) {
            console.log('file not of type XLSX');
            uiNotify('- אין אפשרות להשתמש בקובץ מסוג אחר מלבד אקסל', 'error');
            return;
        }
        let reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onloadend = async (e: any): Promise<void> => {
            console.log('uploading file', e);
            var data = e.target.result;
            var workLine = await XLSX.read(data, { type: 'binary' });
            var fileData: any[] = await XLSX.utils.sheet_to_json(workLine.Sheets[workLine.SheetNames[0]]);
            console.log('working', fileData, fileData.length);
            var excelLine: number = 1; // Line begins at 1 but in the file it is actually 2
            var message = '';
            for (var i = 0; i < fileData.length; i++) {
                if (!isNaN(fileData[i].Id) && typeof (fileData[i].Name) != 'undefined') {
                    if (typeof this.state.degems.filter(degem => degem.Id === fileData[i].Id)[0] !== 'undefined') {
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> מעדכן סדרה ' + fileData[i].Id;
                        console.log(message);
                        this.setState({ userMessage: message });
                        await this.updateDegem(fileData[i].Id, fileData[i].Name)
                            .then(() => {
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    } else {
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> סדרה ' + fileData[i].Id + ' ושם ' + fileData[i].Name + ' התווסף לטבלה';
                        console.log(message);
                        this.setState({ userMessage: message });
                        await this.addDegem(fileData[i].Id, fileData[i].Name)
                            .then(() => {
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    }
                    excelLine++;
                } else {
                    message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> שם סדרה או מספר סדרה אינם תקינים';
                    console.log(message);
                    this.setState({ userMessage: message });
                    return;
                }
            }
            message = ' כל השורות בקובץ התעדכנו כראוי ';
            console.log(message);
            this.setState({ userMessage: message });
            this.reloadAllDegems().then(() => {
                this.setState({ loading: false })
            }).catch(err => {
                uiNotify(err, 'error');
            })
        }
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
                        <div className='header-text'>{"סדרה"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.degems, paginate: false })}
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
                            // onToolbarPreparing={this.onToolbarPreparing}
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
                            <Export enabled={true} fileName={'degems'} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Popup title={'סדרה'} showTitle={true} width={400} height={250}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'Id'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Name'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'Id'} caption={'מספר סדרה'}><RequiredRule /></Column>
                            <Column dataField={'Name'} caption={'סדרה'}><RequiredRule /></Column>
                        </DataGrid>
                        <OutsidePopup title={'טעינה מקובץ'} showTitle={true} width={350} height={250} visible={this.state.isPopupVisible} onHiding={() => this.hidePopup()}>
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
                        </OutsidePopup>
                    </div>
                </div>
            </div>
        );
    }
}
