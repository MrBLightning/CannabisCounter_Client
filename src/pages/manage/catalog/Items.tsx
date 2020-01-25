import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling, Pager, Texts, Lookup } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { NavBarSection, CatalogItem, Department, Subgroup, Degem, Sapak, UnitSize } from 'shared/interfaces/models/SystemModels';
import { getItems, addItem, updateItem, deleteItem, getDepartments, getGroups, getSubgroups, getDegems, getSapaks, getUnitSizes } from 'shared/api/catalogItem.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { Group } from 'devextreme-react/tree-map';
import { element } from 'prop-types';
import { Title } from 'devextreme-react/bar-gauge';
import { RbacPermission } from 'shared/store/auth/auth.types';

type ItemsProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type ItemsState = {
    departments: Department[],
    groups: Group[],
    subgroups: Subgroup[],
    degems: Degem[],
    sapaks: Sapak[],
    unitSizes: UnitSize[],
    items: CatalogItem[],
    itemsFiltered: CatalogItem[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
    archiveValue: number,
    autoArchiveValue: number,
    pesachValue: number
}
export class Items extends Component<ItemsProps> {
    dataGrid: any | null = null;
    archiveOptions = [{
        "Id": 0,
        "Name": "ללא",
    }, {
        "Id": 1,
        "Name": "בלבד",
    }, {
        "Id": 2,
        "Name": "כולל",
    }];
    state: ItemsState = {
        departments: [],
        groups: [],
        subgroups: [],
        degems: [],
        sapaks: [],
        unitSizes: [],
        items: [],
        itemsFiltered: [],
        isPopupVisible: false,
        loading: true,
        userMessage: '',
        archiveValue: 0,
        autoArchiveValue: 0,
        pesachValue: 0

    }

    // function for reloading all catalog items
    reloadAllItems = async (): Promise<void> => {
        // get all the lines in table 'catalog' from the node server
        try {
            const items = await getItems();
            this.setState({ items });
            // const itemsFiltered = items.filter(item => item.Archives === 0 && item.ArchivesUser === 0 && (item.Pesach === null || item.Pesach === 0));
            const itemsFiltered = items.filter(item => item.Archives === 0 && item.ArchivesUser === 0 && (item.Pesach === null || item.Pesach === false));
            this.setState({ itemsFiltered });
            // console.log('itemsFiltered',items.length);
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllDepartments = async (): Promise<void> => {
        try {
            const departments = await getDepartments();
            this.setState({ departments });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
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

    loadAllSubgroups = async (): Promise<void> => {
        try {
            const subgroups = await getSubgroups();
            this.setState({ subgroups });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllDegems = async (): Promise<void> => {
        try {
            const degems = await getDegems();
            this.setState({ degems });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSapaks = async (): Promise<void> => {
        try {
            const sapaks = await getSapaks();
            this.setState({ sapaks });
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

    init = async () => {
        await this.loadAllDepartments();
        await this.loadAllGroups();
        await this.loadAllSubgroups();
        await this.loadAllDegems();
        await this.loadAllSapaks();
        await this.loadAllUnitSizes();
        await this.reloadAllItems();
    }

    // function for adding a catalog item
    addItem = async (
        BarCode: number,
        Name: string,
        ClassesId: number,
        GroupId: number,
        SubGroupId: number,
        SapakId: number,
        DegemId: number,
        Adegem: number,
        p_loss: boolean,
        Shakele: boolean,
        Ariza: number,
        UnitAriza: number,
        statusCalMlay: boolean,
        Archives: number,
        Create_Date: Date | null,
        BL_datebuy: Date | null,
        Pesach: boolean | null,
        length: number | null,
        lengthSize: number | null,
        width: number | null,
        widthSize: number | null,
        height: number | null,
        heightSize: number | null,
        scope: number | null,
        scopeSize: number | null,
        weightGross: number | null,
        weightGrossSize: number | null,
        weightNeto: number | null,
        weightNetoSize: number | null,
        techula: number | null,
        techulaSize: number | null
    ): Promise<void> => {
        await addItem(
            BarCode,
            Name,
            ClassesId,
            GroupId,
            SubGroupId,
            SapakId,
            DegemId,
            Adegem,
            p_loss,
            Shakele,
            Ariza,
            UnitAriza,
            statusCalMlay,
            Archives,
            Create_Date,
            BL_datebuy,
            Pesach,
            length,
            lengthSize,
            width,
            widthSize,
            height,
            heightSize,
            scope,
            scopeSize,
            weightGross,
            weightGrossSize,
            weightNeto,
            weightNetoSize,
            techula,
            techulaSize
        );
    }

    // function for updating a catalog item
    updateItem = async (
        BarCode: number,
        Name: string,
        ClassesId: number,
        GroupId: number,
        SubGroupId: number,
        SapakId: number,
        DegemId: number,
        Adegem: number,
        p_loss: boolean,
        Shakele: boolean,
        Ariza: number,
        UnitAriza: number,
        statusCalMlay: boolean,
        Archives: number,
        Create_Date: Date | null,
        BL_datebuy: Date | null,
        Pesach: boolean | null,
        length: number | null,
        lengthSize: number | null,
        width: number | null,
        widthSize: number | null,
        height: number | null,
        heightSize: number | null,
        scope: number | null,
        scopeSize: number | null,
        weightGross: number | null,
        weightGrossSize: number | null,
        weightNeto: number | null,
        weightNetoSize: number | null,
        techula: number | null,
        techulaSize: number | null
    ): Promise<void> => {
        await updateItem(
            BarCode,
            Name,
            ClassesId,
            GroupId,
            SubGroupId,
            SapakId,
            DegemId,
            Adegem,
            p_loss,
            Shakele,
            Ariza,
            UnitAriza,
            statusCalMlay,
            Archives,
            Create_Date,
            BL_datebuy,
            Pesach,
            length,
            lengthSize,
            width,
            widthSize,
            height,
            heightSize,
            scope,
            scopeSize,
            weightGross,
            weightGrossSize,
            weightNeto,
            weightNetoSize,
            techula,
            techulaSize
        );
    }

    // function for deleting a catalog item
    deleteItem = async (BarCode: number): Promise<void> => {
        await deleteItem(BarCode);
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
        if (typeof this.state.items.filter(item => item.BarCode === parseInt(e.data.BarCode, 10))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הקוד הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        // insert row into table 'catalog'
        this.addItem(
            e.BarCode,
            e.Name,
            e.ClassesId,
            e.GroupId,
            e.SubGroupId,
            e.SapakId,
            e.DegemId,
            e.Adegem,
            e.p_loss,
            e.Shakele,
            e.Ariza,
            e.UnitAriza,
            e.statusCalMlay,
            e.Archives,
            e.Create_Date,
            e.BL_datebuy,
            e.Pesach,
            e.length,
            e.lengthSize,
            e.width,
            e.widthSize,
            e.height,
            e.heightSize,
            e.scope,
            e.scopeSize,
            e.weightGross,
            e.weightGrossSize,
            e.weightNeto,
            e.weightNetoSize,
            e.techula,
            e.techulaSize
        ).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        // update row with e.id's name to e.Name in table 'catalog'
        this.updateItem(
            e.BarCode,
            e.Name,
            e.ClassesId,
            e.GroupId,
            e.SubGroupId,
            e.SapakId,
            e.DegemId,
            e.Adegem,
            e.p_loss,
            e.Shakele,
            e.Ariza,
            e.UnitAriza,
            e.statusCalMlay,
            e.Archives,
            e.Create_Date,
            e.BL_datebuy,
            e.Pesach,
            e.length,
            e.lengthSize,
            e.width,
            e.widthSize,
            e.height,
            e.heightSize,
            e.scope,
            e.scopeSize,
            e.weightGross,
            e.weightGrossSize,
            e.weightNeto,
            e.weightNetoSize,
            e.techula,
            e.techulaSize
        ).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteItem(e.BarCode).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onEditorPreparing = (event: any) => {
        // prevent editing of Group if there is no Department (ClassesId)
        if (event.parentType === 'dataRow' && event.dataField === 'GroupId') {
            event.editorOptions.disabled = (typeof event.row.data.ClassesId !== 'number');
        }

        // prevent editing of SubGroup if there is no Group (GroupId)
        if (event.parentType === 'dataRow' && event.dataField === 'SubGroupId') {
            event.editorOptions.disabled = (typeof event.row.data.GroupId !== 'number');
        }

        // https://www.devexpress.com/Support/Center/Question/Details/T749901/datagrid-allow-column-editing-on-insert-but-not-on-update
        let inserting = false;
        let updating = false;
        if ((typeof (event.row) != 'undefined') && (typeof (event.row.data.Id) != 'undefined')) {
            updating = true;
        } else {
            inserting = true;
        }

        const notEditableOnUpdate: any = ['BarCode']; // data field names of columns not editable on update  
        const notEditableOnInsert: any = []; // data field names of columns not editable on insert  

        if (inserting && notEditableOnInsert.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        } else if (updating && notEditableOnUpdate.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        }
    }


    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.push({
            location: "before",
            locateInMenu: 'never',
            template: function () {
                return ("<div className='toolbar-label'> ארכיון: </div>");
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
                dataSource: this.archiveOptions,
                displayExpr: "Name",
                valueExpr: "Id",
                value: this.state.archiveValue,
                onValueChanged: this.archiveChanged.bind(this)
            }
        }, {
            location: "before",
            locateInMenu: 'never',
            template: function () {
                return ("<div className='toolbar-label'> ארכיון אוטומטי: </div>");
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
                dataSource: this.archiveOptions,
                displayExpr: "Name",
                valueExpr: "Id",
                value: this.state.autoArchiveValue,
                onValueChanged: this.autoArchiveChanged.bind(this)
            }
        }, {
            location: "before",
            locateInMenu: 'never',
            template: function () {
                return ("<div className='toolbar-label'> פסח: </div>");
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
                dataSource: this.archiveOptions,
                displayExpr: "Name",
                valueExpr: "Id",
                value: this.state.pesachValue,
                onValueChanged: this.pesachChanged.bind(this)
            }
        });
        // e.toolbarOptions.items.push({
        //     widget: 'dxButton',
        //     location: 'after',
        //     options: {
        //         text: 'טעינה מקובץ',
        //         onClick: this.showPopup
        //     }
        // });
    }

    archiveChanged(e: any) {
        this.setState({ loading: true })
        let filter = this.state.items;
        if (e.value === 1)
            filter = filter.filter(item => item.Archives === 1);
        if (e.value === 0)
            filter = filter.filter(item => item.Archives === 0);
        this.setState({
            itemsFiltered: filter,
            archiveValue: e.value,
            loading: false
        })
    }

    autoArchiveChanged(e: any) {
        this.setState({ loading: true })
        let filter = this.state.items;
        if (e.value === 1)
            filter = filter.filter(item => item.ArchivesUser === 0);
        if (e.value === 0)
            filter = filter.filter(item => item.ArchivesUser === 1);
        this.setState({
            itemsFiltered: filter,
            autoArchiveValue: e.value,
            loading: false
        })
    }

    pesachChanged(e: any) {
        this.setState({ loading: true })
        let filter = this.state.items;
        if (e.value === 1)
            //filter = filter.filter(item => item.Pesach === 1);
            filter = filter.filter(item => item.Pesach === true);
        if (e.value === 0)
            //filter = filter.filter(item => item.Pesach === null || item.Pesach === 0);
            filter = filter.filter(item => item.Pesach === null || item.Pesach === false);
        this.setState({
            itemsFiltered: filter,
            pesachValue: e.value,
            loading: false
        })

    }

    showPopup = () => {
        this.setState({ isPopupVisible: true, userMessage: '' });
    }

    hidePopup = () => {
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
                if (!isNaN(fileData[i].BarCode) && typeof (fileData[i].Name) != 'undefined') {
                    if (typeof this.state.items.filter(item => item.BarCode === fileData[i].BarCode)[0] !== 'undefined') {
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> מעדכן פריט ' + fileData[i].BarCode;
                        console.log(message);
                        this.setState({ userMessage: message });
                        // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
                        let archive = 0;
                        if (fileData[i].Archives === 0) archive = 1;
                        await this.updateItem(
                            fileData[i].BarCode,
                            fileData[i].Name,
                            fileData[i].ClassesId,
                            fileData[i].GroupId,
                            0,      //SubGroupId
                            fileData[i].SapakId,
                            fileData[i].DegemId,
                            0,      //Adegem,
                            false,  //p_loss: boolean,
                            fileData[i].Shakele,
                            0,      //Ariza: number,
                            fileData[i].UnitAriza,
                            false,  //statusCalMlay: boolean,
                            archive, //Archives,
                            null,   //Create_Date: Date,
                            null,   //BL_datebuy: Date,
                            null,   //Pesach: boolean,
                            null,   //length: number,
                            null,   //lengthSize: number,
                            null,   //width: number,
                            null,   //widthSize: number,
                            null,   //height: number,
                            null,   //heightSize: number,
                            null,   //scope: number,
                            null,   //scopeSize: number,
                            null,   //weightGross: number,
                            null,   //weightGrossSize: number,
                            null,   //weightNeto: number,
                            null,   //weightNetoSize: number,
                            null,   //techula: number,
                            null    //techulaSize: number
                        )
                            .then(() => {
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    } else {
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> פריט ' + fileData[i].BarCode + ' ושם ' + fileData[i].Name + ' התווסף לטבלה';
                        console.log(message);
                        this.setState({ userMessage: message });
                        // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
                        let archive = 0;
                        if (fileData[i].Archives === 0) archive = 1;
                        await this.addItem(
                            fileData[i].BarCode,
                            fileData[i].Name,
                            fileData[i].ClassesId,
                            fileData[i].GroupId,
                            0,      //SubGroupId
                            fileData[i].SapakId,
                            fileData[i].DegemId,
                            0,      //Adegem,
                            false,  //p_loss: boolean,
                            fileData[i].Shakele,
                            0,      //Ariza: number,
                            fileData[i].UnitAriza,
                            false,  //statusCalMlay: boolean,
                            archive, //Archives,
                            null,   //Create_Date: Date,
                            null,   //BL_datebuy: Date,
                            null,   //Pesach: boolean,
                            null,   //length: number,
                            null,   //lengthSize: number,
                            null,   //width: number,
                            null,   //widthSize: number,
                            null,   //height: number,
                            null,   //heightSize: number,
                            null,   //scope: number,
                            null,   //scopeSize: number,
                            null,   //weightGross: number,
                            null,   //weightGrossSize: number,
                            null,   //weightNeto: number,
                            null,   //weightNetoSize: number,
                            null,   //techula: number,
                            null    //techulaSize: number
                        )
                            .then(() => {
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    }
                    excelLine++;
                } else {
                    message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> שם פריט או מספר פריט אינם תקינים';
                    console.log(message);
                    this.setState({ userMessage: message });
                    return;
                }
            }
            message = ' כל השורות בקובץ התעדכנו כראוי ';
            console.log(message);
            this.setState({ userMessage: message });
            // regradless of updates, we now need to re-load everything
            this.reloadAllItems().then(() => {
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

    onRowPrepared(e: any) {
        //console.log(e.rowElement.RowMinHeight);
        e.rowElement.classList.add('thinRow');
    }

    setDeptValue = (rowData: any, value: any) => {
        // Based on cascading lookups: 
        // https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/CascadingLookups/AngularJS/Light/
        rowData.ClassesId = value;
        rowData.GroupId = null;
        rowData.SubGroupId = null;
    }

    getFilteredGroups = (options: any) => {
        return {
            store: this.state.groups,
            filter: options.data ? ['ClassId', '=', options.data.ClassesId] : null
        };
    }

    getFilteredSubGroups = (options: any) => {
        return {
            store: this.state.subgroups,
            filter: options.data ? ['GroupId', '=', options.data.GroupId] : null
        };
    }

    render() {
        let Shakele = [{
            "Id": 1,
            "Name": "כן",
        },
        {
            "Id": 0,
            "Name": "לא",
        },
        ];
        let statusCalMlay = [{
            "Id": 1,
            "Name": "יומי",
        },
        {
            "Id": 2,
            "Name": "שבועי",
        },
        {
            "Id": 0,
            "Name": "רגיל",
        }
        ];
        let statusArchives = [{
            "Id": 0,
            "Name": "פעיל",
        },
        {
            "Id": 1,
            "Name": "לא פעיל",
        }
        ];
        let itemInformation = [{
            itemType: 'tabbed',
            tabPanelOptions: {
                deferRendering: false
            },
            tabs: [{
                title: 'פרטי פריט',
                colCount: 2,
                items: ["Name", "BarCode", "ClassesId", "GroupId", "SubGroupId",
                    {
                        dataField: "DegemId",
                        editorType: "dxSelectBox",
                        editorOptions: {
                            showClearButton: true,
                            dataSource: {
                                store: this.state.degems,
                                paginate: true,
                                pageSize: 30,
                            },
                        },
                    }, "SapakId",
                    {
                        dataField: "Shakele",
                        editorOptions: {
                            width: "70px"
                        }
                    }, "Ariza", "statusCalMlay", "ArchivesUser", "Archives", "flagLeaven", "Pesach", "Create_Date", "BL_datebuy", "Adegem", "p_loss"
                ]
            }, {
                title: 'מידות פריט',
                colCount: 2,
                items: ["length", "lengthSize", "width", "widthSize", "height", "heightSize", "scope", "scopeSize", "weightGross", "weightGrossSize",
                    "weightNeto", "weightNetoSize", "techula", "techulaSize", "UnitAriza"]
            }]
        }
        ];

        if (this.state.loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container-wide'>
                        <div className='header-text'>{"קטלוג"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container-wide'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.itemsFiltered, paginate: true })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            columnAutoWidth={true}
                            rtlEnabled={true}
                            className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            onRowPrepared={(e) => this.onRowPrepared(e)}
                            onRowInserting={(e) => this.onRowInserting(e)}
                            onRowInserted={(e) => this.onRowInserted(e.data)}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                            onEditorPreparing={this.onEditorPreparing}
                            onToolbarPreparing={this.onToolbarPreparing}
                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <HeaderFilter visible={true} />
                            <LoadPanel enabled={true} />

                            {/* <Scrolling mode={'virtual'}></Scrolling> */}
                            <Export enabled={true} fileName={'catalogItems'} />
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
                                <Popup title={'כרטיס פריט'} showTitle={true} width={900} height={550}>
                                </Popup>
                                <Form colCount={1}>
                                    <Item itemType={'group'} items={itemInformation} />
                                </Form>
                            </Editing>
                            <Paging defaultPageSize={100} />
                            <Pager
                                showPageSizeSelector={true}
                                allowedPageSizes={[50, 100, 200]}
                                showInfo={true}
                                infoText={"עמוד {0} מתוך {1} ({2} פריטים)"} />

                            <Column dataField={'BarCode'} dataType={'string'} caption={'ברקוד'} width={120}><RequiredRule /></Column>
                            <Column dataField={'Name'} caption={'שם מוצר'} width={180}><RequiredRule /></Column>
                            {/* <Column dataField={'ClassesId'} caption={'מחלקה'} width={150} lookup={{
                                dataSource: () => this.state.departments,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'GroupId'} caption={'קבוצה'} width={150} lookup={{
                                dataSource: this.getFilteredGroups,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'SubGroupId'} caption={'תת קבוצה'} width={150} lookup={{
                                dataSource: this.getFilteredSubGroups,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column> */}
                            <Column dataField={'ClassesId'} caption={'מחלקה'} width={150} setCellValue={this.setDeptValue}>
                                <Lookup dataSource={this.state.departments} displayExpr="Name" valueExpr="Id" />
                            </Column>
                            <Column dataField={'GroupId'} caption={'קבוצה'} width={150}>
                                <Lookup dataSource={this.getFilteredGroups} displayExpr="Name" valueExpr="Id" />
                            </Column>
                            <Column dataField={'SubGroupId'} caption={'תת קבוצה'} width={150}>
                                <Lookup dataSource={this.getFilteredSubGroups} displayExpr="Name" valueExpr="Id" />
                            </Column>
                            <Column dataField={'DegemId'} caption={'סדרה'} width={150} lookup={{
                                // dataSource: new DataSource({  
                                //     paginate: true,  
                                //     pageSize: 50,  
                                //     store: this.state.degems  
                                //   }),
                                dataSource: this.state.degems,
                                displayExpr: "Name",
                                valueExpr: "Id",
                            }}></Column>
                            <Column dataField={'Adegem'} caption={'% תרומה'} width={20} dataType={"number"} visible={false}></Column>
                            <Column dataField={'p_loss'} caption={'% פחת'} width={20} dataType={"number"} visible={false}></Column>
                            <Column dataField={'SapakId'} caption={'ספק'} width={150} lookup={{
                                dataSource: () => this.state.sapaks,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'Shakele'} caption={'שקיל'} width={80} dataType={'boolean'} lookup={{
                                dataSource: Shakele,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'Ariza'} caption={'אירוז'} width={80}></Column>
                            <Column dataField={'statusCalMlay'} caption={'ס.מלאי'} width={80} lookup={{
                                dataSource: statusCalMlay,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'Archives'} caption={'ארכיון'} width={100} visible={false} lookup={{
                                dataSource: statusArchives,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'ArchivesUser'} caption={'ארכיון אוטומטי'} width={60} dataType={"boolean"} visible={false} allowEditing={false} ></Column>
                            <Column dataField={'flagLeaven'} caption={'חמץ'} width={60} dataType={"boolean"} visible={false} allowEditing={false} ></Column>
                            <Column dataField={'Pesach'} caption={'פסח'} width={60} dataType={"boolean"} visible={false} ></Column>
                            <Column dataField={'Create_Date'} caption={'תא. הקמה'} width={100} dataType={"date"} visible={false} format={'dd-MM-yyyy'}></Column>
                            <Column dataField={'BL_datebuy'} caption={'תא. חסום רכש'} width={100} dataType={"date"} visible={false} format={'dd-MM-yyyy'}></Column>
                            <Column dataField={'length'} caption={'אורך'} visible={false} ></Column>
                            <Column dataField={'lengthSize'} caption={'יחידת מידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'width'} caption={'רוחב'} visible={false} ></Column>
                            <Column dataField={'widthSize'} caption={'יחידת מידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'height'} caption={'גובה'} visible={false} ></Column>
                            <Column dataField={'heightSize'} caption={'יחידת מידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'scope'} caption={'היקף'} visible={false} ></Column>
                            <Column dataField={'scopeSize'} caption={'יחידת מידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'weightGross'} caption={'משקל'} visible={false} ></Column>
                            <Column dataField={'weightGrossSize'} caption={'יחידת מידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'weightNeto'} caption={'משקל נטו'} visible={false} ></Column>
                            <Column dataField={'weightNetoSize'} caption={'יחידת מידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'techula'} caption={'תכולה'} visible={false} ></Column>
                            <Column dataField={'techulaSize'} caption={'יחידת מידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'UnitAriza'} caption={'יחידה'} visible={false} lookup={{
                                dataSource: () => this.state.unitSizes,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
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
            </div >
        );
    }
}
