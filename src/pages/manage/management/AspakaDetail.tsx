import React, { Component } from 'react';
import DataGrid, {
    Column,
} from 'devextreme-react/data-grid';
import { AspakaRecord, AspakaDetail, AspakaUnique } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import { checkPageVersion } from 'shared/components/Version-control';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { getAspakaRecords } from 'shared/api/aspaka.provider';

type AspakaDetailState = {
    aspakaRecords: AspakaRecord[],
    aspakaDetail: AspakaDetail[],
}

class AspakaDetailTemplate extends Component {
    constructor(props: any) {
        super(props);
        this.Key = props.data.key;
    }
    //Key: string = '';
    Key:AspakaUnique={
        Id: 0,
        SapakId: 0,
        BranchId: 0,
        OrderDay_1: null,
        AspakaDay_1:null,
        OrderDay_2: null,
        AspakaDay_2:null,
        OrderDay_3: null,
        AspakaDay_3:null,
        OrderDay_4: null,
        AspakaDay_4:null,
        OrderDay_5: null,
        AspakaDay_5:null,
        OrderDay_6: null,
        AspakaDay_6:null,
        Wensell: 0,
        Key:''    
    };
    state: AspakaDetailState = {
        aspakaRecords: [],
        aspakaDetail: []
    };

    reloadAllAspakaRecords = async (): Promise<void> => {
        try {
            const aspakaRecords = await getAspakaRecords();
            this.setState({ aspakaRecords });
            const aspakaDetail: AspakaDetail[] = [];
            let key = '';
            for (const item of aspakaRecords) {
                key = item.SapakId + "#" + item.BranchId;
                // console.log("this.Key.Key=", this.Key.Key, "key=", key);
                if (
                    parseInt(key.substr(0, key.indexOf('#')), 10)
                    == parseInt(this.Key.Key.substr(0, this.Key.Key.indexOf('#')), 10) &&
                    key.substr(key.indexOf('#') + 1, key.length).trim()
                    == this.Key.Key.substr(this.Key.Key.indexOf('#') + 1, this.Key.Key.length).trim()) {
                    aspakaDetail.push({
                        Id: item.Id,
                        SapakId: item.SapakId,
                        BranchId: item.BranchId,
                        AspakaDay: item.AspakaDay,
                        OrderDay: item.OrderDay,
                        Wensell: item.Wensell,
                        days_order: item.days_order,
                        Key: key
                    });
                }
            }
            this.setState({ aspakaDetail });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    componentDidMount() {
        // check page version
        checkPageVersion();
        // check token expDate
        checkPageToeknTime();

        this.reloadAllAspakaRecords().then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    render() {
        const { aspakaDetail } = this.state;

        // DO NOT ADD THIS. CREATES ERROR: Uncaught TypeError: this._contentReadyAction is not a function
        // if (this.state.loading)
        //     return (
        //         <div className="app-loader">
        //             <div className="loader" />
        //         </div>
        //     );

        let days = [
            { "Id": 1, "Name": "ראשון", },
            { "Id": 2, "Name": "שני", },
            { "Id": 3, "Name": "שלישי", },
            { "Id": 4, "Name": "רביעי", },
            { "Id": 5, "Name": "חמישי", },
            { "Id": 6, "Name": "שישי", }
        ];

        return (
            <div style={{ height: "100%" }}>
                <React.Fragment>
                    <DataGrid
                        dataSource={aspakaDetail}
                        showBorders={true}
                        // columnAutoWidth={true}
                        rtlEnabled={true}
                        rowAlternationEnabled={true}
                        // className="grid-element"
                        width={'50%'} //Hardcoded
                    >

                        <Column dataField={'OrderDay'} caption={'יום הזמנה'}
                            lookup={{
                                dataSource: () => days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}
                        ></Column>
                        <Column dataField={'AspakaDay'} caption={'יום אספקה'}
                            lookup={{
                                dataSource: () => days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}
                        ></Column>
                    </DataGrid>
                </React.Fragment>
            </div>
        );
    }

}

export default AspakaDetailTemplate;