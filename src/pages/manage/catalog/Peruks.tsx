import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule as devRequired, Scrolling, Export, MasterDetail, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Button } from 'devextreme-react/button';
import {
    Validator,
    RequiredRule,
} from 'devextreme-react/validator';
import { Item } from 'devextreme-react/form';
import { Peruk, CatalogItem, PerukName } from 'shared/interfaces/models/SystemModels';
import { getPeruks, getCatalogItems, addPeruk, updatePeruk, deletePeruk } from 'shared/api/peruk.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { confirm } from 'devextreme/ui/dialog';
import PerukDetailTemplate from './PerukDetail';

type PeruksProps = {
    permission: RbacPermission;
} & RouteComponentProps;

type PeruksState = {
    peruks: Peruk[],
    perukNames: PerukName[],
    catalogs: CatalogItem[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class Peruks extends Component<PeruksProps> {
    dataGrid: any | null = null;
    selectBoxRef: any = React.createRef();
    textBoxRef: any = React.createRef();
    state: PeruksState = {
        peruks: [],
        perukNames: [],
        catalogs: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    get textBox() {
        return this.textBoxRef.current.instance;
    }

    get selectBox() {
        return this.selectBoxRef.current.instance;
    }

    resetTextBox = () => {
        //this.textBox.reset()
    };

    resetSelectBox = () => {
        //this.selectBox.reset()
    };

    closeForm() {
        this.updatePopupVisibility(false);
        // clear the Form data fields
        this.resetTextBox();
        this.resetSelectBox();
        //e.target.reset();
    }

    updatePopupVisibility = (isPopupVisible: boolean): void => {
        this.setState({ isPopupVisible });
    }

    updateLoading = (loading: boolean): void => {
        this.setState({ loading: loading });
    }

    reloadDataGrid = (): void => {
        this.reloadAllPeruks();
    }

    loadAllCatalogItems = async (): Promise<void> => {
        try {
            const catalogs = await getCatalogItems();
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllPeruks = async (): Promise<void> => {
        try {
            const peruks = await getPeruks();
            this.setState({ peruks });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
        let perukNames = [];
        this.setState({ perukNames: [] });
        let length = this.state.peruks.length;
        for (let i = 0; i < length; i++) {
            let perukName = {
                Id: this.state.peruks[i].Id,
                BarCodeParent: this.state.peruks[i].BarCodeParent,
                ParentName: this.state.peruks[i].BarCodeParent,
                BarCodeChild: this.state.peruks[i].BarCodeChild,
                ChildName: this.state.peruks[i].BarCodeChild,
                Remark: this.state.peruks[i].Remark,
                Level: this.state.peruks[i].Level,
                Percent: this.state.peruks[i].Percent,
                Key: this.state.peruks[i].Key
            };
            perukNames.push(perukName);
        }
        this.setState({ perukNames });
    }

    addPeruk = async (BarCodeParent: number, BarCodeChild: number, Remark: string, Level: string, Percent: number): Promise<void> => {
        await addPeruk(BarCodeParent, BarCodeChild, Remark, Level, Percent);
    }

    updatePeruk = async (Id: number, BarCodeParent: number, BarCodeChild: number, Remark: string, Level: string, Percent: number): Promise<void> => {
        await updatePeruk(Id, BarCodeParent, BarCodeChild, Remark, Level, Percent);
    }

    deletePeruk = async (Id: number): Promise<void> => {
        await deletePeruk(Id);
    }

    init = async () => {
        await this.loadAllCatalogItems();
        await this.reloadAllPeruks();
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
    }

    createParent(e: any) {
        if (e.target.ParentName.value === '' || e.target.Remark.value === '') {
            uiNotify('-   השדה לא יכול להיות ריק', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            if (typeof this.state.perukNames.filter(record => record.ParentName === parseInt(e.target.ParentName.value, 10) &&
                record.Remark === e.target.Remark.value)[0] !== 'undefined') {
                uiNotify('אי אפשר להוסיף את הצירוף הזה - הוא כבר קיים בטבלה', 'error');
                // cancel the event
                e.cancel = true;
            } else {
                let ParentName = e.target.ParentName.value;
                let Remark = e.target.Remark.value;
                this.addPeruk(ParentName, 0, Remark, "parent", 0);
                // update the page to reflect the new peruk code
                this.reloadAllPeruks();
                //close the form
                this.closeForm();
            }
        }
    }

    render() {
        if (this.state.loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        return (
            <div style={{ height: "100%" }}>
                <PerukDataGrid
                    catalogs={this.state.catalogs}
                    perukNames={this.state.perukNames}
                    isPopupVisible={this.state.isPopupVisible}
                    updatePopupVisibility={this.updatePopupVisibility}
                    permission={this.props.permission}
                    updateLoading={this.updateLoading}
                    reloadDataGrid={this.reloadDataGrid}
                ></PerukDataGrid>
                <div>
                    <OutsidePopup title={'עץ מוצר חדש'}
                        key="OUTSIDE_MIGVAN_POP"
                        deferRendering
                        dragEnabled={true}
                        showTitle={true}
                        rtlEnabled
                        closeOnOutsideClick={false}
                        width={350}
                        height={250}
                        visible={this.state.isPopupVisible}
                        //onHiding={() => this.updatePopupVisibility(false)}
                        onHiding={() => this.closeForm()}
                        contentRender={(pros: any) => {
                            return (
                                <div className='grid-wrapper' >
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        this.createParent(e);
                                    }}>
                                        <div className="popup-container">
                                            <div className="popup-row">
                                                <div className="popup-field-label">שם פריט:</div>
                                                <div className="popup-field">
                                                    <SelectBox id="ParentName" name="ParentName"
                                                        //ref={(ref) => this.selectBoxRef = ref}
                                                        ref={this.selectBoxRef}
                                                        searchEnabled={true}
                                                        dataSource={{
                                                            store: this.state.catalogs,
                                                            paginate: true,
                                                            pageSize: 15
                                                        }}
                                                        valueExpr={'BarCode'}
                                                        displayExpr={'Name'}
                                                        placeholder={'בחר פריט'}
                                                        rtlEnabled={true}
                                                        showClearButton={true}>
                                                    </SelectBox>
                                                </div>
                                            </div>
                                            <div className="popup-row">
                                                <div className="popup-field-label">תאור:</div>
                                                <div className="popup-field">
                                                    <TextBox id="Remark" name="Remark"
                                                        //ref={(ref) => this.textBoxRef = ref}
                                                        ref={this.textBoxRef}
                                                        showClearButton={true}
                                                    >
                                                    </TextBox>
                                                </div>
                                            </div>
                                            <div className="popup-row-buttons">
                                                <div className="popup-buttons">
                                                    <Button text={'בצע'} useSubmitBehavior style={{ margin: "10px 0px 3px 0px" }}></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )
                        }}>
                    </OutsidePopup>
                </div>
            </div>
        );
    }

}

/************************************************************************ Class PerukDataGrid *************************************************************************/
type PerukDataGridProps = {
    catalogs: CatalogItem[];
    perukNames: PerukName[];
    isPopupVisible: boolean;
    permission: RbacPermission;
    updatePopupVisibility: (popupIsVisible: boolean) => void;
    updateLoading: (loading: boolean) => void;
    reloadDataGrid: () => void;
};

class PerukDataGrid extends Component<PerukDataGridProps>
{
    dataGrid: any | null = null;
    filteredDataSource: any | null = null;
    perukNames: PerukName[] = this.props.perukNames;


    componentDidMount = async () => {
    }

    addPeruk = async (BarCodeParent: number, BarCodeChild: number, Remark: string, Level: string, Percent: number): Promise<void> => {
        await addPeruk(BarCodeParent, BarCodeChild, Remark, Level, Percent);
    }

    updatePeruk = async (Id: number, BarCodeParent: number, BarCodeChild: number, Remark: string, Level: string, Percent: number): Promise<void> => {
        await updatePeruk(Id, BarCodeParent, BarCodeChild, Remark, Level, Percent);
    }

    deletePeruk = async (Id: number): Promise<void> => {
        await deletePeruk(Id);
    }

    onInitialized = async (e: any) => {
        this.dataGrid = e.component;
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdating = async (e: any) => {
        // get all parents AND children that match the row key        
        let updateArray = this.props.perukNames.filter((perukName) => {
            return perukName.Key == e.Key;
        });
        // this.props.updateLoading(true);
        let length = updateArray.length;
        for (let i = 0; i < length; i++) {
            let newRemark = updateArray[i].Remark;
            let newParentName = updateArray[i].ParentName;
            if (!isNaN(e.newData.ParentName)) { newParentName = e.newData.ParentName }
            if (typeof e.newData.Remark !== 'undefined') { newRemark = e.newData.Remark }
            // Update all parents AND children that match the row key
            this.updatePeruk(updateArray[i].Id, newParentName, updateArray[i].BarCodeChild, newRemark, updateArray[i].Level, updateArray[i].Percent).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
        }
        // send refresh request to Parent
        this.props.reloadDataGrid();
        // this.props.updateLoading(false);
        // e.cancel = true;
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        // get all parents AND children that match the row key
        let deleteArray = this.props.perukNames.filter((perukName) => {
            return perukName.Key == e.Key;
        });
        let length = deleteArray.length;
        for (let i = 0; i < length; i++) {
            // delete all parents AND children that match the row key
            this.deletePeruk(deleteArray[i].Id).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
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
        if (this.props.permission.create)
            e.toolbarOptions.items.push({
                widget: 'dxButton',
                location: 'after',
                options: {
                    icon: 'add',
                    onClick: this.showPopup
                }
            });
        // e.toolbarOptions.items.push({
        //     widget: 'dxButton',
        //     location: 'after',
        //     options: {
        //         text: 'טעינה מקובץ',
        //         onClick: this.showPopup
        //     }
        // }, {
        //     widget: 'dxButton',
        //     location: 'after',
        //     options: {
        //         text: 'מחיקת החיתוך',
        //         onClick: this.deleteFiltered
        //     }
        // });
    }

    showPopup = () => {
        this.props.updatePopupVisibility(true);
    }

    refreshDataGrid() {
        // https://js.devexpress.com/Documentation/Guide/Widgets/DataGrid/Filtering_and_Searching/
        this.dataGrid.clearFilter();
    }

    // cannot add this since if we eliminate the this.dataGrid pointer we cannot preform deleteFiltered
    componentWillUnmount() {
        this.dataGrid = null;
    }

    shouldComponentUpdate(nextProps: PerukDataGridProps, nextState: any) {
        if (this.props.perukNames === nextProps.perukNames)
            return false;
        return true;
    }

    render() {
        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"ניהול עץ מוצר"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(e) => this.onInitialized(e)}
                            // onInitialized={(ref) => { this.dataGrid = ref.component }}
                            className="grid-element"
                            // dataSource={this.filteredDataSource}
                            dataSource={this.props.perukNames.filter(perukName => perukName.Level === "parent")}
                            activeStateEnabled={false}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            // columnAutoWidth={true}
                            onRowUpdating={(e) => this.onRowUpdating(e)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                            rowAlternationEnabled={true}
                            onToolbarPreparing={this.onToolbarPreparing}
                            keyExpr={'Key'}
                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <HeaderFilter visible={true} />
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />

                            <Paging enabled={false} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={false}
                                useIcons={true}>
                                <Texts
                                    confirmDeleteMessage="האם אתם בטוחים שברצונכם למחוק את השורה הזו?"
                                />
                                <Popup key="UPDATE_PERUK_POP" title={'עדכון עץ מוצר'} showTitle={true} width={300} height={250} >
                                </Popup>
                                <Form key="UPDATE_PERUK_FORM">
                                    <Item itemType={'group'} colSpan={2}>
                                        <Item dataField={'ParentName'} colSpan={2} />
                                        <Item dataField={'Remark'} colSpan={2} />
                                    </Item>
                                </Form>
                            </Editing>
                            <Export enabled={true} fileName={'peruk'} />
                            <Column key='b_BarCode' dataField={'BarCodeParent'} caption={'קוד פריט'} width={90}></Column>
                            <Column key='b_ParentName' dataField={'ParentName'} caption={'שם פריט'} lookup={{
                                dataSource: () => this.props.catalogs,
                                displayExpr: "Name",
                                valueExpr: "BarCode"
                            }}><RequiredRule /></Column>
                            <Column key='b_Remark' dataField={'Remark'} caption={'תאור'} ><RequiredRule /></Column>
                            <MasterDetail
                                enabled={true}
                                component={PerukDetailTemplate}
                            />
                        </DataGrid>
                    </div>
                </div>
            </div >
        );
    }
}


