import React, { Component } from 'react';
import DataGrid, { Column, HeaderFilter, RequiredRule, LoadPanel, Paging, Scrolling, RequiredRule as devRequired, MasterDetail } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Validator, RangeRule, } from 'devextreme-react/validator';
import { Destructions, CatalogItem } from 'shared/interfaces/models/SystemModels';
import { getDestructions, getCatalogItems } from 'shared/api/destructionW.provider';
import { uiNotify } from 'shared/components/Toast';
import { number } from 'prop-types';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

type DestructionWState = {
    loading: boolean,
    destructions: Destructions[],
    catalogs: CatalogItem[],
    destructionsFiltered: Destructions[],
    destructionId: number,
}

class DetailTemplate extends React.Component {
    constructor(props: any) {
        super(props);
        this.destructionId = props.data.key.DestructionNumber;

    }

    destructionId: number = 0;
    selectBoxRef: any = React.createRef();
    textBoxRef: any = React.createRef();
    state: DestructionWState = {
        loading: false,
        destructions: [],
        catalogs: [],
        destructionsFiltered: [],
        destructionId: 0
    };


    loadAllDestructions = async (): Promise<void> => {
        try {
            const destructions = await getDestructions();
            this.setState({ destructions });
            const destructionsFiltered = destructions.filter(destruction => destruction.DestructionNumber === this.destructionId);
            this.setState({ destructionsFiltered });

        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllCatalogs = async (): Promise<void> => {
        try {
            const catalogs = await getCatalogItems();
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }


    init = async () => {
        await this.loadAllDestructions();
        await this.loadAllCatalogs();
    }


    componentDidMount() {
        this.init().then(() => {
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }


    render() {

        if (this.state.loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        return (
            <div style={{ height: "100%",width:"70%", marginLeft:"auto",marginRight:"auto"}}>
                <React.Fragment>
                    <DataGrid
                        dataSource={this.state.destructionsFiltered}
                        showBorders={true}  
                        rtlEnabled={true}
                        >
                        <Scrolling mode={'virtual'} />
                        <LoadPanel enabled={true} />
                        <Paging enabled={false} />
                        >
                    <Column dataField={'BarCode'} caption={'קוד פריט'} ><RequiredRule /></Column>
                        <Column dataField={'BarCode'} caption={'שם פריט'} lookup={{
                            dataSource: () => this.state.catalogs,
                            displayExpr: "Name",
                            valueExpr: "CatalogId"
                        }}
                        ></Column>
                        <Column dataField={'Amount'} caption={'כמות'} ></Column>
                    </DataGrid>
                </React.Fragment>
            </div>
        );
    }


}



export default DetailTemplate;