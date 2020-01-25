import React, { Component } from 'react';
import { Item } from 'devextreme-react/form';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Validator, RangeRule, } from 'devextreme-react/validator';
import { Yedmivs } from 'shared/interfaces/models/SystemModels';
import { getYedmivItems, updateYedmivItem, deleteYedmivItem, addYedmivItem } from 'shared/api/yedmiv.provider';
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
 
type YedmivState = {
    loading: boolean,
    YedmivItems: Yedmivs[];
}

class Yedmiv extends React.Component {

    state: YedmivState = {
        loading: true,
        YedmivItems: [],
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
        await this.loadAllYedmivItems();

    }

    loadAllYedmivItems = async (): Promise<void> => {
        try {
            const YedmivItems = await getYedmivItems();
            this.setState({ YedmivItems });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    onRowUpdating = async (e: any) => {
        let Name = e.oldData.Name;
        let Id = e.oldData.Id;

        if (typeof e.newData.Name != 'undefined') {
            Name = e.newData.Name;
        }
        await updateYedmivItem(Id, Name).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllYedmivItems();
    }

    onRowRemoved = async (e: any) => {
        let Id = e.data.Id;

        await deleteYedmivItem(Id).then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllYedmivItems();
    }

    onRowInserted = async (e: any) => {
        await addYedmivItem(e.data.Name).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.loadAllYedmivItems();
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
                            dataSource={this.state.YedmivItems}
                            activeStateEnabled={false}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            allowColumnResizing={false}
                            allowColumnReordering={false}
                            rowAlternationEnabled={true}
                            width={'60%'} //Hardcoded

                        >
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />
                            <Export enabled={true} fileName={'yedmivs'} />
                            <Paging enabled={false} />
                            <Editing
                                mode={'popup'}
                                allowUpdating={true}
                                allowDeleting={true}
                                allowAdding={true}

                                useIcons={true}>
                                <Popup key="UPDATE_DESTRUCTION_POP" title={'מבצע'} showTitle={true} width={500} height={250} >
                                </Popup>
                                <Form key="UPDATE_YEDMIV_FORM">
                                    <Item itemType={'group'} >
                                        <Item dataField={'Name'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>
                            <Column dataField={'Name'} caption={'מבצע'} width={200}></Column>
                        </DataGrid>
                    </div>

                </div>
            </div >
        );
    }

}

export default Yedmiv;
