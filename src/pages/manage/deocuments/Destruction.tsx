import React, { Component } from 'react';
import { Item } from 'devextreme-react/form';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Validator, RangeRule, } from 'devextreme-react/validator';
import { Destructions, Siba, SibaRes, Branch, User } from 'shared/interfaces/models/SystemModels';
import { getDestructions, getBranches, getSibaRes, getSibas, getUsers, updateDestruction } from 'shared/api/destructionW.provider';
import { uiNotify } from 'shared/components/Toast';
import { number } from 'prop-types';
import DataGrid, { Column, LoadPanel, Export, Editing, Paging, Scrolling, Popup, Form, RequiredRule as devRequired, MasterDetail, Lookup } from 'devextreme-react/data-grid';
import DestructionDetail from './DestructionDetail';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';



const statusOptions = ['אושר', 'בירור', 'לא אושר'];

type DestructionWState = {
    loading: boolean,
    destructions: Destructions[],
    destructionsUniq: Destructions[],
    branches: Branch[],
    sibas: Siba[],
    sibares: SibaRes[],
    sibaResFiltered: SibaRes[],
    users: User[],
}

class Destruction extends React.Component {

    constructor(props: any) {
        super(props);
    }

    state: DestructionWState = {
        loading: true,
        destructions: [],
        destructionsUniq: [],
        branches: [],
        sibas: [],
        sibares: [],
        sibaResFiltered: [],
        users: [],
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
        await this.loadAllSibas();
        await this.loadAllSibaRes();
        await this.loadAllBranches();
        await this.loadAllDestructions();
        await this.loadAllUsers();
    }

    loadAllSibas = async (): Promise<void> => {
        try {
            const sibas = await getSibas();
            this.setState({ sibas });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSibaRes = async (): Promise<void> => {
        try {
            const sibares = await getSibaRes();
            this.setState({ sibares });
            const sibaResFiltered = sibares.filter(sibares => sibares.Id == 1);
            this.setState({ sibaResFiltered });
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

    loadAllDestructions = async (): Promise<void> => {
        try {
            const destructions = await getDestructions();
            this.setState({ destructions });
            this.mapDestructions();
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllUsers = async (): Promise<void> => {
        try {
            const users = await getUsers();
            this.setState({ users });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    onEditorPreparing = (event: any) => {
        let updating = false;

        if ((typeof (event.row) != 'undefined') && (typeof (event.row.data.DestructionNumber) != 'undefined')) {
            updating = true;
        }
        const notEditableOnUpdate: any = ['DestructionNumber']; // data field names of columns not editable on update  
        if (updating && notEditableOnUpdate.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        }
    }

    onRowUpdating = async (e: any) => {
        let DestructionNumber = e.oldData.DestructionNumber;
        let Status = e.oldData.Status;
        let Notes = e.oldData.Notes;
        if (typeof e.newData.DestructionNumber != 'undefined') {
            DestructionNumber = e.newData.DestructionNumber;
        }
        if (typeof e.newData.Status != 'undefined') {
            Status = e.newData.Status;
        }
        if (typeof e.newData.Notes != 'undefined') {
            Notes = e.newData.Notes;
        }

        await updateDestruction(DestructionNumber, Status, Notes).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })

        this.loadAllDestructions();
    }

    mapDestructions() {
        const map = new Map();
        let length = this.state.destructions.length;
        const destructionsUniq: Destructions[] = [];

        for (let i = 0; i < length; i++) {
            if (!map.has(this.state.destructions[i].DestructionNumber)) {
                map.set(this.state.destructions[i].DestructionNumber, true);    // set a unique value to Map
                destructionsUniq.push({
                    DestructionNumber: this.state.destructions[i].DestructionNumber,
                    DestructionReason: this.state.destructions[i].DestructionReason,
                    DestructionAuth: this.state.destructions[i].DestructionAuth,
                    BarCode: this.state.destructions[i].BarCode,
                    Amount: this.state.destructions[i].Amount, // created date
                    BranchId: this.state.destructions[i].BranchId, // created by
                    NetworkId: this.state.destructions[i].NetworkId,
                    CreatedDate: this.state.destructions[i].CreatedDate,
                    CreatedBy: this.state.destructions[i].CreatedBy,
                    Comex: this.state.destructions[i].Comex,
                    Status: this.state.destructions[i].Status,
                    Notes: this.state.destructions[i].Notes,
                });
            }
        }
        this.setState({ destructionsUniq });
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
                        <DataGrid id={'gridContainer'}
                            onRowUpdating={(e) => this.onRowUpdating(e)}
                            className="grid-element"
                            dataSource={this.state.destructionsUniq}
                            activeStateEnabled={false}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            allowColumnResizing={false}
                            allowColumnReordering={false}
                            rowAlternationEnabled={true}
                            onEditorPreparing={this.onEditorPreparing}
                        >
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />
                            <Paging enabled={false} />
                            <Editing
                                mode={'popup'}
                                allowUpdating={true}
                                allowAdding={false}
                                useIcons={true}>
                                <Popup key="UPDATE_DESTRUCTION_POP" title={'עדכון השמדה'} showTitle={true} width={330} height={250} >
                                </Popup>
                                <Form key="UPDATE_DESTRUCTION_FORM">
                                    <Item itemType={'group'} >
                                        <Item dataField={'DestructionNumber'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Status'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Notes'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>
                            <Column dataField={'BranchId'} caption={'שם סניף'} allowEditing={false} lookup={{
                                dataSource: () => this.state.branches,
                                displayExpr: "Name",
                                valueExpr: "BranchId"
                            }}
                            ></Column>
                            <Column dataField={'CreatedDate'} caption={'תאריך'} allowEditing={false} width={140}></Column>
                            <Column dataField={'DestructionReason'} caption={' סיבת השמדה'} allowEditing={false} width={140} lookup={{
                                dataSource: () => this.state.sibas,
                                displayExpr: "Description",
                                valueExpr: "Id"
                            }}
                            ></Column>
                            <Column dataField={'CreatedBy'} caption={' שם מאשר'} allowEditing={false} lookup={{
                                dataSource: () => this.state.users,
                                displayExpr: "name",
                                valueExpr: "id"
                            }}

                            ></Column>
                            <Column dataField={'DestructionNumber'} caption={' קוד מסמך'} allowEditing={false}></Column>
                            <Column dataField={'Status'} caption={' סטטוס'} allowEditing={true}>
                                <Lookup dataSource={statusOptions} />
                            </Column>
                            <Column dataField={'Comex'} caption={' מס קומקס'} allowEditing={true}></Column>
                            <Column dataField={'Notes'} caption={' הערות'} allowEditing={true}></Column>

                            <MasterDetail
                                enabled={true}
                                component={DestructionDetail}
                            />
                        </DataGrid>
                    </div>

                </div>
            </div >
        );
    }

}

export default Destruction;
