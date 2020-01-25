import React, { Component } from 'react';
import DataGrid, {
    Column,
    FilterRow,
    HeaderFilter,
    LoadPanel,
    Editing,
    Paging,
    Scrolling,
    Popup,
    Form,
    RequiredRule,
    Texts,
} from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
import { CatalogItem, Peruk, PerukName } from 'shared/interfaces/models/SystemModels';
import { getCatalogItems, getPeruks, addPeruk, updatePeruk, deletePeruk } from 'shared/api/peruk.provider';
import { uiNotify } from 'shared/components/Toast';
import { checkPageVersion } from 'shared/components/Version-control';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { AppState } from 'shared/store/app.reducer';
import { RouteComponentProps } from 'react-router';
import { connect } from "react-redux"
import { getPermission } from 'shared/auth/auth.service';
import DataSource from 'devextreme/data/data_source';

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps) => ({
    ...ownProps,
    user: state.auth.user,
    permissions: state.auth.permissions
})

type PerukDetailState = {
    catalogs: CatalogItem[],
    peruks: Peruk[],
    loading: boolean,
    perukNames: PerukName[]
}

class PerukDetailTemplate extends Component<ReturnType<typeof mapStateToProps>> {
    constructor(props: any) {
        super(props);
        this.Key = props.data.key;
    }
    Key: string = '';
    permission = getPermission("manage/peruk", this.props.permissions);
    state: PerukDetailState = {
        catalogs: [],
        peruks: [],
        loading: false,
        perukNames: []
    };

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
            // check it is child and that the parentName (from key) and remark (from key, after trim) is the same
            if (this.state.peruks[i].Level === 'child' && 
            parseInt(this.state.peruks[i].Key.substr(0, this.state.peruks[i].Key.indexOf('#')), 10) 
                    == parseInt(this.Key.substr(0, this.Key.indexOf('#')), 10) &&
            this.state.peruks[i].Key.substr(this.state.peruks[i].Key.indexOf('#') + 1, this.state.peruks[i].Key.length).trim() 
                    == this.Key.substr(this.Key.indexOf('#') + 1, this.Key.length).trim()) {
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

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoving = async (e: any) => {
        if (e.data.ChildName === 9999) {
            uiNotify('-   אי אפשר למחוק את שורת הפחת', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            // first I update the line amount to 0 so that the server will update the child line 9999 percent
            let parentName = parseInt(this.Key.substr(0, this.Key.indexOf('#')), 10);
            let remark = this.Key.substr(this.Key.indexOf('#') + 1, this.Key.length);
            remark = remark.trim();
            let childName = e.data.ChildName;
            try {
                await this.updatePeruk(e.data.Id, parentName, childName, remark, "child", 0);
            } catch (err) {
                console.error(err);
                uiNotify(err, 'error');
            }
        }
    }

    onRowRemoved = async (e: any) => {
        console.log("deleting child", e.data.Id);
        await this.deletePeruk(e.data.Id).then(() => {
            // update the page to reflect the new peruk code
            this.reloadAllPeruks();
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onRowInserting = async (e: any) => {
        // create new child
        if (e.data.ChildName === '' || e.data.Percent === '') {
            uiNotify('-   השדה לא יכול להיות ריק', 'error');
            // cancel the event
            e.cancel = true;
        }
        if (e.data.ChildName === '9999') {
            uiNotify('-   אין אפשרות להוסיף עוד שורת פחת', 'error');
            // cancel the event
            e.cancel = true;
        }
        let newItem = this.state.peruks.filter(peruk => peruk.BarCodeChild === parseInt(e.data.ChildName, 10))[0];
        if (typeof newItem != 'undefined') {
            uiNotify('-   אין אפשרות להוסיף פריט שקיים כבר בעץ המוצר', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            // verify that the new line dosn't get the total percent over 100
            let childName = parseInt(e.data.ChildName, 10);
            let childPercent = 0;
            // get the total percent of children that are not 9999
            for (let i = 0; i < this.state.perukNames.length; i++) {
                if (this.state.perukNames[i].BarCodeChild != 9999) {
                    childPercent = childPercent + this.state.perukNames[i].Percent;
                }
            }
            // add the percent value of the new item
            childPercent = childPercent + parseInt(e.data.Percent, 10);
            // let defPercent = this.state.peruks.filter(peruk => peruk.serialNumberChild === 9999)[0].percent;
            if ((100 - childPercent) < 1) {
                uiNotify('-   האחוז הכולל של עץ המוצר לא יכול להיות יותר מ 100', 'error');
                // cancel the event
                e.cancel = true;
            } else {
                let parentName = parseInt(this.Key.substr(0, this.Key.indexOf('#')), 10);
                let remark = this.Key.substr(this.Key.indexOf('#') + 1, this.Key.length);
                remark = remark.trim();
                let percent = e.data.Percent;
                await this.addPeruk(parentName, childName, remark, "child", percent).then(() => {
                    // update the page to reflect the new peruk code
                    this.reloadAllPeruks();
                    // close the create popup form
                    //this.closeForm();

                }).catch(err => {
                    uiNotify(err, 'error');
                })
            }
        }

    }

    onRowUpdating = async (e: any) => {
        if (e.key.ChildName === 9999) {
            uiNotify('-   אי אפשר לשנות את שורת הפחת', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            // verify that the new line dosn't get the total percent over 100
            let childName = e.key.ChildName;
            if (typeof e.newData.ChildName != 'undefined') childName = e.newData.ChildName;
            let percent = e.key.Percent;
            if (!isNaN(e.newData.Percent)) percent = e.newData.Percent;

            let childPercent = 0;
            let length = this.state.perukNames.length;
            for (let i = 0; i < length; i++) {
                if (this.state.perukNames[i].BarCodeChild != 9999) {
                    if (this.state.perukNames[i].BarCodeChild != childName) {
                        childPercent = childPercent + this.state.perukNames[i].Percent;
                    } else {
                        // add the percent value of the new item
                        childPercent = childPercent + parseInt(percent, 10);
                    }
                }
            }
            // let defPercent = this.state.peruks.filter(peruk => peruk.serialNumberChild === 9999)[0].percent;
            if ((100 - childPercent) < 1) {
                uiNotify('-   האחוז הכולל של עץ המוצר לא יכול להיותר יותר מ 100', 'error');
                // cancel the event
                e.cancel = true;
            } else {
                let parentName = parseInt(this.Key.substr(0, this.Key.indexOf('#')), 10);
                let remark = this.Key.substr(this.Key.indexOf('#') + 1, this.Key.length);
                remark = remark.trim();
                // let defPercent = this.state.peruks.filter(peruk => peruk.serialNumberChild === 9999)[0].percent;                
                try {
                    await this.updatePeruk(e.key.Id, parentName, childName, remark, "child", percent);
                    // update the page to reflect the new peruk code
                    this.reloadAllPeruks();
                } catch (err) {
                    console.error(err);
                    uiNotify(err, 'error');
                }
            }
        }
    }

    render() {
        const { perukNames } = this.state;

        // DO NOT ADD THIS. CREATES ERROR: Uncaught TypeError: this._contentReadyAction is not a function
        // if (this.state.loading)
        //     return (
        //         <div className="app-loader">
        //             <div className="loader" />
        //         </div>
        //     );

        return (
            <div style={{ height: "100%" }}>
                <React.Fragment>
                    <DataGrid
                        dataSource={perukNames}
                        showBorders={true}
                        // columnAutoWidth={true}
                        rtlEnabled={true}
                        rowAlternationEnabled={true}
                        // className="grid-element"
                        width={'100%'} //Hardcoded
                        onRowInserting={(e) => this.onRowInserting(e)}
                        onRowUpdating={(e) => this.onRowUpdating(e)}
                        onRowRemoving={(e) => this.onRowRemoving(e)}
                        onRowRemoved={(e) => this.onRowRemoved(e)}
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
                            allowUpdating={this.permission.edit}
                            allowDeleting={this.permission.delete}
                            allowAdding={this.permission.create}
                            useIcons={true}>
                            <Texts
                                confirmDeleteMessage="האם אתם בטוחים שברצונכם למחוק את השורה הזו?"
                            />
                            <Popup key="UPDATE_PERUK_POP" title={'עדכון עץ מוצר'} showTitle={true} width={300} height={250} >
                            </Popup>
                            <Form key="UPDATE_PERUK_FORM">
                                <Item itemType={'group'} colSpan={2}>
                                    <Item dataField={'ChildName'} colSpan={2} />
                                    <Item dataField={'Percent'} colSpan={2} />
                                </Item>
                            </Form>
                        </Editing>
                        <Column dataField={'BarCodeChild'} caption={'קוד פריט'}></Column>
                        <Column dataField={'ChildName'} caption={'שם פריט'}
                            lookup={{
                                dataSource: () => this.state.catalogs,
                                displayExpr: "Name",
                                valueExpr: "BarCode"
                            }}
                        ><RequiredRule /></Column>
                        <Column dataField={'Percent'} caption={'אחוז'} ><RequiredRule /></Column>
                    </DataGrid>
                </React.Fragment>
            </div>
        );
    }

}

export default connect(mapStateToProps)(PerukDetailTemplate);