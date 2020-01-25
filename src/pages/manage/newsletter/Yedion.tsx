import React, { Component } from 'react';
import { Item } from 'devextreme-react/form';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { SelectBox, List } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Validator, RangeRule, } from 'devextreme-react/validator';
import { YedionType, Yeds, Yedm, Yedmivs, Yedtzs, CatalogItem, Degem, Sapak } from 'shared/interfaces/models/SystemModels';
import { getYedion, deleteYedion, getYedItems, getYedmItems, getYedmivItems, getYedtzItems, getCatalogItems, getDegemItems, updateYedionItem, addYedionItem, getSapakItems } from 'shared/api/yedion.provider';
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
import { equal } from 'assert';
import { icon } from '@fortawesome/fontawesome-svg-core';


type YedionState = {
    loading: boolean,
    isKamutMatVisible: boolean,
    isKamutSaleVisible: boolean,
    isKamutBuyVisible: boolean,
    isKamutVisible: boolean,
    isPriceVisible: boolean,
    isBarcodeVisible: boolean,
    isPopupVisible: boolean,
    yedions: YedionType[],
    yeds: Yeds[],
    yedms: Yedm[],
    yedmivs: Yedmivs[],
    yedtzs: Yedtzs[],
    catalogs: CatalogItem[],
    sapaks: Sapak[],
    listBarCodeprice: any[],
    SelectedBarcode: string,
    barcodeListP: string[],
    disableButton: boolean,
    listBarCode: any[],
    listBarCodeMat: any[],
    listDegem: any[],
    degems: Degem[],
    test7: boolean,

    kyedR: number,
    rowData: any;
}

class Yedion extends React.Component {

    dataGrid: any | null = null;
    barcodeListP: string[] = [];
    SelectedBarcode: string = '';
    selectmiv: number = 0;
    show_price: boolean = false;
    show_kamut: boolean = false;
    show_kamutbuy: boolean = false;
    show_kamutsale: boolean = false;
    show_kamutmat: boolean = false;
    show_barcode: boolean = false;

    isKamutMatVisible: boolean = false;
    isKamutSaleVisible: boolean = false;
    isKamutBuyVisible: boolean = false;
    isKamutVisible: boolean = false;
    isPriceVisible: boolean = false;
    isBarcodeVisible: boolean = false;

    barcodeRef: any = React.createRef();
    barcodeButtonRef: any = React.createRef();
    kamutRef: any = React.createRef();
    kamutBuyRef: any = React.createRef();
    kamutSaleRef: any = React.createRef();
    priceRef: any = React.createRef();
    degemRef: any = React.createRef();
    kamutMatRef: any = React.createRef();
    kyedRef: any = React.createRef();
    popupRef: any = React.createRef();
    kyedtzRef: any = React.createRef();
    remRef: any = React.createRef();
    kyedmRef: any = React.createRef();
    kyedmivRef: any = React.createRef();
    mivnameRef: any = React.createRef();
    barcodeSelectedRef: any = React.createRef();
    degemSelectedRef: any = React.createRef();
    barcodeMatRef: any = React.createRef();
    YedIdRef: any = React.createRef();
    sapakRef: any = React.createRef();
    gondolaRef: any = React.createRef();
    barcodeForDegemRef: any = React.createRef();
    catalogsJson: any = {};
    degemsJson: any = {};
    listDegem: any = [];
    sapakJson: any = [];
    catalogForDegemJson: any = [];
    abcd: any = [1, 2, 3]
    rowData: any = ''
    addBarcode: boolean = false;
    addDegem: boolean = false;
    addYedion: boolean = false;
    updateYedion: boolean = false;


    state: YedionState = {
        loading: true,
        isKamutMatVisible: false,
        isKamutSaleVisible: false,
        isKamutBuyVisible: false,
        isKamutVisible: false,
        isPriceVisible: false,
        isBarcodeVisible: false,
        isPopupVisible: false,
        yedions: [],
        yeds: [],
        yedms: [],
        yedmivs: [],
        yedtzs: [],
        catalogs: [],
        sapaks: [],
        listBarCodeprice: [],
        SelectedBarcode: '',
        barcodeListP: [],
        disableButton: true,
        listBarCode: [],
        listBarCodeMat: [],
        listDegem: [],
        degems: [],
        kyedR: 0,
        rowData: '',
        test7: false
    };


    get barcode() {
        return this.barcodeRef.current.instance;
    }
    get barcodeButton() {
        return this.barcodeButtonRef.current.instance;
    }
    get kamut() {
        return this.kamutRef.current.instance;
    }
    get kamutBuy() {
        return this.kamutBuyRef.current.instance;
    }
    get kamutSale() {
        return this.kamutSaleRef.current.instance;
    }
    get price() {
        return this.priceRef.current.instance;
    }
    get degem() {
        return this.degemRef.current.instance;
    }
    get kamutMat() {
        return this.kamutMatRef.current.instance;
    }
    get kyed() {
        return this.kyedRef.current.instance;
    }
    get popup() {
        return this.popupRef.current.instance;
    }
    get kyedtz() {
        return this.kyedtzRef.current.instance;
    }
    get rem() {
        return this.remRef.current.instance;
    }
    get kyedm() {
        return this.kyedmRef.current.instance;
    }
    get kyedmiv() {
        return this.kyedmivRef.current.instance;
    }
    get mivname() {
        return this.mivnameRef.current.instance;
    }
    get barcodeSelected() {
        return this.barcodeSelectedRef.current.instance;
    }
    get barcodeMat() {
        return this.barcodeMatRef.current.instance;
    }
    get YedId() {
        return this.YedIdRef.current.instance;
    }
    get sapak() {
        return this.sapakRef.current.instance;
    }

    get degemSelected() {
        return this.degemSelectedRef.current.instance;
    }

    get gondola() {
        return this.gondolaRef.current.instance;
    }

    get barcodeForDegem() {
        return this.barcodeForDegemRef.current.instance;
    }

    hidebarcode = () => {
        this.barcode.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('barcodeLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidebarcodeButton = () => {
        this.barcodeButton.option('visible', false);
    };

    hidekamut = () => {
        this.kamut.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('kamutLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidekamutBuy = () => {
        this.kamutBuy.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('kamutBuyLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidekamutSale = () => {
        this.kamutSale.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('kamutSaleLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hideprice = () => {
        this.price.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('priceLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidedegem = () => {
        this.degem.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('degemLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidekamutMat = () => {
        this.kamutMat.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('kamutMatLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidebarcodeSelected = () => {
        this.barcodeSelected.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('barcodeSelectedLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidebarcodeMat = () => {
        this.barcodeMat.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('barcodeMatLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidesapak = () => {
        this.sapak.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('sapakLabel');
        if (myElement)
            myElement.style.display = "none";
    };

    hidedegemSelected = () => {
        console.log("hidedegemSelected")
        this.degemSelected.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('degemSelectedLabel');
        if (myElement)
            myElement.style.display = "none";
    }

    hidebarcodeForDegem = () => {
        this.barcodeForDegem.option('visible', false);
        let myElement: HTMLElement | null = document.getElementById('barcodeForDegemLabel');
        if (myElement)
            myElement.style.display = "none";
    }



    showbarcode = () => {
        this.barcode.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('barcodeLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showbarcodeButton = () => {
        this.barcodeButton.option('visible', true);
    };
    showkamut = () => {
        this.kamut.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('kamutLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showkamutBuy = () => {
        this.kamutBuy.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('kamutBuyLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showkamutSale = () => {
        this.kamutSale.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('kamutSaleLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showprice = () => {
        this.price.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('priceLabel');
        if (myElement)
            myElement.style.display = "block";
    };

    showdegem = () => {
        this.degem.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('degemLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showkamutMat = () => {
        this.kamutMat.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('kamutMatLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showbarcodeSelected = () => {
        this.barcodeSelected.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('barcodeSelectedLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showbarcodeMat = () => {
        this.barcodeMat.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('barcodeMatLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showsapak = () => {
        this.sapak.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('sapakLabel');
        if (myElement)
            myElement.style.display = "block";
    };
    showdegemSelected = () => {

        this.degemSelected.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('degemSelectedLabel');
        if (myElement)
            myElement.style.display = "block";
    }
    showbarcodeForDegem = () => {
        this.barcodeForDegem.option('visible', true);
        let myElement: HTMLElement | null = document.getElementById('barcodeForDegemLabel');
        if (myElement)
            myElement.style.display = "block";
    }





    resetbarcode = () => {
        this.barcode.reset();
    };
    resetkamut = () => {
        this.kamut.reset();
    };
    resetkamutBuy = () => {
        this.kamutBuy.reset();
    };
    resetkamutSale = () => {
        this.kamutSale.reset();
    };
    resetprice = () => {
        this.price.reset();
    };

    resetdegem = () => {
        this.degem.reset();
    };

    resetkamutMat = () => {
        this.kamutMat.reset();
    };

    resetkyed = () => {
        this.kyed.reset();
    };

    resetkyedtz = () => {
        this.kyedtz.reset();
    };

    resetkyedm = () => {
        this.kyedm.reset();
    };

    resetkyedmiv = () => {
        this.kyedmiv.reset();
    };

    resetmivname = () => {
        this.mivname.reset();
    };

    resetrem = () => {
        this.rem.reset();
    };
    resetbarcodeSelected = () => {
        this.barcodeSelected.option('items', [])
    };
    resetbarcodeMat = () => {
        this.barcodeMat.reset();
    };
    resetYedId = () => {
        this.YedId.reset();
    };
    resetsapak = () => {
        this.sapak.reset();
    };
    resetdegemSelected = () => {
        this.degemSelected.option('items', [])
    }

    resetbarcodeForDegem = () => {
        this.barcodeForDegem.option('items', [])
    }


    componentDidMount() {
        this.setState({ loading: true })
        this.init().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }


    init = async () => {
        await this.loadAllYedions();
        await this.loadAllYedItems();
        await this.loadAllYedms();
        await this.loadAllYedmivs();
        await this.loadAllYedtzs();
        await this.loadAllCatalogs();
        await this.loadAllDegems();
        await this.loadAllSapaks();
    }



    loadAllYedions = async (): Promise<void> => {
        try {
            let yedions = await getYedion();
            this.setState({ yedions });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllYedItems = async (): Promise<void> => {
        try {
            let yeds = await getYedItems();
            this.setState({ yeds });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllYedms = async (): Promise<void> => {
        try {
            let yedms = await getYedmItems();
            this.setState({ yedms });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllYedmivs = async (): Promise<void> => {
        try {
            let yedmivs = await getYedmivItems();
            this.setState({ yedmivs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllYedtzs = async (): Promise<void> => {
        try {
            let yedtzs = await getYedtzItems();
            this.setState({ yedtzs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllCatalogs = async (): Promise<void> => {
        try {
            let catalogs = await getCatalogItems();
            this.setState({ catalogs });

            let catalogsJson: any = {};
            for (let i = 0; i < catalogs.length; i++) {
                catalogsJson[catalogs[i].BarCode] = catalogs[i].SapakId
            }

            let catalogForDegemJson: any = {};
            let arr: number[] = [];

            for (let i = 0; i < catalogs.length; i++) {
                if (catalogs[i].DegemId != 0) {
                    if (catalogForDegemJson[catalogs[i].DegemId] == undefined) {
                        arr.push(catalogs[i].BarCode)
                        catalogForDegemJson[catalogs[i].DegemId] = arr
                    } else {
                        arr = catalogForDegemJson[catalogs[i].DegemId]
                        arr.push(catalogs[i].BarCode)
                        catalogForDegemJson[catalogs[i].DegemId] = arr
                    }
                    arr = [];
                }
            }

            this.catalogForDegemJson = catalogForDegemJson;


            this.catalogsJson = catalogsJson;
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllDegems = async (): Promise<void> => {
        try {
            const degems = await getDegemItems();
            this.setState({ degems });

            let degemsJson: any = {};
            for (let i = 0; i < this.state.degems.length; i++) {
                degemsJson[this.state.degems[i].Id] = this.state.degems[i].Name
            }
            this.degemsJson = degemsJson
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSapaks = async (): Promise<void> => {
        try {
            const sapaks = await getSapakItems();
            this.setState({ sapaks });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }



    onKeyUp = (e: any) => {
        var txtSelect = e.component._options.text;
        if (txtSelect != null) {
            if (txtSelect.length >= 3) {
                var len = txtSelect.length;
                var listBarCode = [];
                for (var i = 0; i < this.state.catalogs.length; i++) {
                    var res_barCode = this.state.catalogs[i].BarCode.toString();
                    if (res_barCode.length > 4) {
                        continue;
                    }
                    var res_Name = this.state.catalogs[i].Name;
                    var txtDisplay = res_barCode + "  " + res_Name;
                    var len1 = res_barCode.length;
                    var res = res_barCode.substring(len1 - len, len1);
                    if (res == txtSelect) {
                        var item1 = {
                            d: res_barCode,
                            n: txtDisplay
                        }
                        listBarCode.push(item1);//push 
                    }
                }

                e.component.option("items", listBarCode);
            }

            if (txtSelect.length >= 5) {
                var len = txtSelect.length;
                var listBarCode = [];
                for (var i = 0; i < this.state.catalogs.length; i++) {
                    var res_barCode = this.state.catalogs[i].BarCode.toString();
                    var res_Name = this.state.catalogs[i].Name;
                    var txtDisplay = res_barCode + "  " + res_Name;
                    var len1 = res_barCode.length;
                    var res = res_barCode.substring(len1 - len, len1);
                    if (res == txtSelect) {
                        var item1 = {
                            d: res_barCode,
                            n: txtDisplay
                        }
                        listBarCode.push(item1);//push 
                    }
                }
                // this.setState({ listBarCode })
                // e.component.option("dataSource", listBarCode);
                e.component.option("items", listBarCode);

            }

        }

    }

    onKeyUpBarcodeMat = (e: any) => {
        var txtSelect = e.component._options.text;
        if (txtSelect != null) {
            if (txtSelect.length >= 3) {
                var len = txtSelect.length;
                var listBarCode = [];
                for (var i = 0; i < this.state.catalogs.length; i++) {
                    var res_barCode = this.state.catalogs[i].BarCode.toString();
                    if (res_barCode.length > 4) {
                        continue;
                    }
                    var res_Name = this.state.catalogs[i].Name;
                    var txtDisplay = res_barCode + "  " + res_Name;
                    var len1 = res_barCode.length;
                    var res = res_barCode.substring(len1 - len, len1);
                    if (res == txtSelect) {
                        var item1 = {
                            d: res_barCode,
                            n: txtDisplay
                        }
                        listBarCode.push(item1);//push 
                    }
                }
                this.barcodeMat.option('items', listBarCode)
            }

            if (txtSelect.length >= 5) {
                var len = txtSelect.length;
                var listBarCode = [];
                for (var i = 0; i < this.state.catalogs.length; i++) {
                    var res_barCode = this.state.catalogs[i].BarCode.toString();
                    var res_Name = this.state.catalogs[i].Name;
                    var txtDisplay = res_barCode + "  " + res_Name;
                    var len1 = res_barCode.length;
                    var res = res_barCode.substring(len1 - len, len1);
                    if (res == txtSelect) {
                        var item1 = {
                            d: res_barCode,
                            n: txtDisplay
                        }
                        listBarCode.push(item1);//push 
                    }
                }
                this.barcodeMat.option('items', listBarCode)

            }

        }

    }

    OnKeyUpDegem = (e: any) => {
        var txtSelect = e.component._options.text;

        if (txtSelect != null) {
            if (txtSelect.length >= 3) {
                var len = txtSelect.length;
                var listDegem = [];

                for (var i = 0; i < this.state.degems.length; i++) {
                    var res_Name = this.state.degems[i].Name;
                    var res_Id = this.state.degems[i].Id;
                    var txtDisplay = res_Id + "  " + res_Name;
                    if (res_Name.includes(txtSelect)) {
                        var item1 = {
                            d: res_Id,
                            n: txtDisplay
                        }
                        listDegem.push(item1);//push 

                    }
                }
                this.degem.option('items', listDegem)
            }

        }

    }

    OnKeyUpSapak = (e: any) => {
        var txtSelect = e.component._options.text;

        if (txtSelect != null) {
            if (txtSelect.length >= 3) {
                var len = txtSelect.length;
                var listSapak = [];

                for (var i = 0; i < this.state.sapaks.length; i++) {
                    var res_Name = this.state.sapaks[i].Name;
                    var res_Id = this.state.sapaks[i].Id;
                    var txtDisplay = res_Id + "  " + res_Name;
                    if (res_Name.includes(txtSelect)) {
                        var item1 = {
                            d: res_Id,
                            n: txtDisplay
                        }
                        listSapak.push(item1);//push 

                    }
                }
                this.sapak.option('items', listSapak)
            }

        }

    }

    onInitialized = async (e: any) => {
        this.dataGrid = e.component;
    }

    setBarcodeListValue = (rowData: any, value: any) => {
        rowData.kyedmiv = value;
    }

    edidCell = (e: any) => {
        return (
            <Button icon="edit" onClick={() => {
                this.updateYedion = true
                this.popup.option('visible', true);
                this.rowData = e.row.data;
            }}
            ></Button>
        )
    }

    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.unshift(

            {
                widget: 'dxButton',
                location: 'before',
                options: {
                    text: 'הוספת ידיעון',
                    onClick: this.addYedionPopup.bind(this)
                }
            },
            // {
            //     widget: 'dxButton',
            //     location: 'after',
            //     options: {
            //         text: 'הדפסה',
            //     }
                
            // },
            // {
            //     widget: 'dxSelectBox',
            //     location: 'after',
            //     options: {
            //         dataSource: this.state.yeds,
            //         placeholder: "בחר ידיעון...",
            //         showClearButton: true,
            //         valueExpr: "Id",
            //         displayExpr: "Name",

            //     }
            // }
        );
    }

    printYed() {
    }

    addYedionPopup() {
        this.addYedion = true;
        this.popup.option('visible', true);
    }

    onShownPopup = (e: any) => {

        let rowData = this.rowData
        this.barcodeButton.option('disabled', true);


        this.hidebarcode();
        this.hidebarcodeSelected();
        this.hidedegemSelected();
        this.hidebarcodeForDegem();
        this.hidebarcodeButton();
        this.hidedegem();
        this.hideprice();
        this.hidekamut();
        this.hidekamutBuy();
        this.hidekamutSale();
        this.hidekamutMat();
        this.hidebarcodeMat();
        this.hidesapak();

        this.showbarcode();
        this.showdegem();


        if (this.addYedion) {
            this.hidebarcodeSelected();
            this.hidedegemSelected();
            this.hidebarcodeForDegem();
        }

        if (this.updateYedion) {

            this.YedId.option('value', this.rowData.Id)
            this.kyed.option('value', this.rowData.kyed)
            this.kyedm.option('value', this.rowData.kyedm)
            this.kyedmiv.option('value', this.rowData.kyedmiv)
            this.mivname.option('value', this.rowData.miv_name)
            this.degem.option('value', this.rowData.degem)
            this.kamutSale.option('value', this.rowData.kamutsale)
            this.kamut.option('value', this.rowData.kamut)
            this.price.option('value', this.rowData.price)
            this.kamutBuy.option('value', this.rowData.kamutbuy)
            this.kamutMat.option('value', this.rowData.kamutmat)
            this.kyedtz.option('value', this.rowData.kyedtz)
            this.rem.option('value', this.rowData.rem)
            this.barcodeButton.option('disabled', true);


            if (rowData.barcode != null) {
                let barodeItems = '[' + rowData.barcode + ']';
                barodeItems = JSON.parse(barodeItems);
                this.barcodeSelected.option('items', barodeItems)
            }

            if (this.rowData.degem != null) {
                let degemItems = '[' + rowData.degem + ']';
                degemItems = JSON.parse(degemItems);
                this.degemSelected.option('items', degemItems)
            }


            if (rowData.barcode != null) {
                this.showbarcode();
                this.showbarcodeButton();
                this.showbarcodeSelected();
            }
            if (rowData.degem != null) {
                this.showdegem();
                this.showdegemSelected();
            }
            if (rowData.kyedmiv == 3) {
                this.showprice();
            }
            if (rowData.kyedmiv == 4) {
                this.showprice();
                this.showkamut();
            }
            if (rowData.kyedmiv == 5) {
                this.showkamutBuy();
                this.showkamutSale();
            }
            if (rowData.kyedmiv == 6) {
                this.showkamutSale();
                this.showkamutMat();
                this.showbarcodeMat();
            }
        }

    }

    cancelForm = () => {
        this.popup.option('visible', false);
        this.addYedion = false
        this.updateYedion = false

        this.resetYedId();
        this.resetkyed();
        this.resetbarcode();
        this.resetkamut();
        this.resetkamutBuy();
        this.resetkamutSale();
        this.resetprice();
        this.resetdegem();
        this.resetkamutMat();
        this.resetkyedtz();
        this.resetrem();
        this.resetkyedm();
        this.resetkyedmiv();
        this.resetmivname();
        this.resetbarcodeMat();
        this.resetbarcodeSelected();
        this.resetdegemSelected();

    }

    updateYedItem = async (e: any) => {

        let Id = this.YedId._options.value
        let kyed = this.kyed._options.value
        let kyedm = this.kyedm._options.value
        let kyedmiv = this.kyedmiv._options.value
        let kyedtz = this.kyedtz._options.value
        let rem = this.rem._options.value
        let barcode = this.barcodeSelected._options.items
        let degem = this.degemSelected._options.items
        let miv_name = this.mivname._options.value
        let kamut = this.kamut._options.value
        let price = this.price._options.value
        let kamutbuy = this.kamutBuy._options.value
        let kamutsale = this.kamutSale._options.value
        let barcodePrice = this.barcodeMat._options.value
        let kamutmat = this.kamutMat._options.value
        let sapak = this.sapak._options.value
        let gondola = this.gondola._options.value


        let listBarcode = null;
        let sapak1 = '';

        if (degem.length == 0 && barcode.length != 0) {
            listBarcode = barcode[0];
            sapak1 = this.catalogsJson[barcode[0]];
            for (let i = 1; i < barcode.length; i++) {
                listBarcode += ',' + barcode[i]
            }
        }

        let listDegem = null;
        if (degem.length != 0 && barcode.length == 0) {
            listDegem = degem[0];
            sapak1 = this.catalogsJson[degem[0]];
            for (let i = 1; i < degem.length; i++) {
                listDegem += ',' + degem[i]
            }
        }

        if (listDegem === null && listBarcode === null && sapak1 == '') {
            this.showsapak();
        }
        else {

            let record: any = {};

            record = {
                kyed: kyed,
                kyedm: kyedm,
                kyedmiv: kyedmiv,
                kyedtz: kyedtz,
                sapakid: sapak1,
            }

            if (rem != null)
                record["rem"] = rem;

            if (miv_name != '')
                record["miv_name"] = miv_name;

            if (kamut != null)
                record["kamut"] = kamut;

            if (price != null)
                record["price"] = price;

            if (kamutbuy != null)
                record["kamutbuy"] = kamutbuy;

            if (kamutsale != null)
                record["kamutsale"] = kamutsale;

            if (barcodePrice != null)
                record["barcodePrice"] = barcodePrice;

            if (kamutmat != null)
                record["kamutmat"] = kamutmat;

            if (gondola != null)
                record["gondola"] = gondola;

            if (listBarcode != null)
                record["barcode"] = listBarcode

            if (listDegem != null)
                record["degem"] = listDegem

            this.popup.option('visible', false)

            await updateYedionItem(Id, record).then(() => {
            }).catch(err => {
                uiNotify(err, 'error');
            })

            this.loadAllYedions();
            this.updateYedion = false
            this.resetYedId();
            this.resetkyed();
            this.resetbarcode();
            this.resetkamut();
            this.resetkamutBuy();
            this.resetkamutSale();
            this.resetprice();
            this.resetdegem();
            this.resetkamutMat();
            this.resetkyedtz();
            this.resetrem();
            this.resetkyedm();
            this.resetkyedmiv();
            this.resetmivname();
            this.resetbarcodeMat();
            this.resetbarcodeSelected();
            this.resetdegemSelected();
            this.resetbarcodeForDegem();

        }

    }

    addYedItem = async (e: any) => {


        let Id = this.YedId._options.value
        let kyed = this.kyed._options.value
        let kyedm = this.kyedm._options.value
        let kyedmiv = this.kyedmiv._options.value
        let kyedtz = this.kyedtz._options.value
        let rem = this.rem._options.value
        let barcode = this.barcodeSelected._options.items
        let degem = this.degemSelected._options.items
        let miv_name = this.mivname._options.value
        let kamut = this.kamut._options.value
        let price = this.price._options.value
        let kamutbuy = this.kamutBuy._options.value
        let kamutsale = this.kamutSale._options.value
        let barcodePrice = this.barcodeMat._options.value
        let kamutmat = this.kamutMat._options.value
        let sapak = this.sapak._options.value
        let gondola = this.gondola._options.value

        let listBarcode = null;
        let sapak1 = '';

        if (degem.length == 0 && barcode.length != 0) {
            listBarcode = barcode[0];
            sapak1 = this.catalogsJson[barcode[0]];
            for (let i = 1; i < barcode.length; i++) {
                listBarcode += ',' + barcode[i]
            }
        }

        let listDegem = null;
        if (degem.length != 0 && barcode.length == 0) {
            listDegem = degem[0];
            sapak1 = this.catalogsJson[degem[0]];
            for (let i = 1; i < degem.length; i++) {
                listDegem += ',' + degem[i]
            }
        }

        if (sapak1 == '')
            sapak1 = sapak;


        if (listDegem === null && listBarcode === null && sapak1 === null) {
            this.showsapak();
        }
        else {

            let record: any = {};

            record = {
                kyed: kyed,
                kyedm: kyedm,
                kyedmiv: kyedmiv,
                kyedtz: kyedtz,
                sapakid: sapak1,
            }

            if (rem != 0)
                record["rem"] = rem;

            if (miv_name != '')
                record["miv_name"] = miv_name;

            if (kamut != 0)
                record["kamut"] = kamut;

            if (price != 0)
                record["price"] = price;

            if (kamutbuy != 0)
                record["kamutbuy"] = kamutbuy;

            if (kamutsale != 0)
                record["kamutsale"] = kamutsale;

            if (barcodePrice != 0)
                record["barcodePrice"] = barcodePrice;

            if (kamutmat != 0)
                record["kamutmat"] = kamutmat;

            if (gondola != 0)
                record["gondola"] = gondola;

            if (listBarcode != null)
                record["barcode"] = listBarcode

            if (listDegem != null)
                record["degem"] = listDegem


            this.popup.option('visible', false)

            await addYedionItem(record).then(() => {
            }).catch(err => {
                uiNotify(err, 'error');
            })

            this.loadAllYedions();
            this.addYedion = false
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
            <div className='grid-wrapper'>
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'} style={{ marginLeft: "auto", marginRight: "auto" }} className="grid-element"

                            onInitialized={(e) => this.onInitialized(e)}
                            onToolbarPreparing={this.onToolbarPreparing}
                            dataSource={this.state.yedions}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            width={'100%'} //Hardcoded
                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />
                            <Paging enabled={false} />

                            <Column dataField={'Id'} width={200} visible={false}></Column>
                            <Column dataField={'kyed'} caption={'שם ידיעון'} lookup={{
                                dataSource: () => this.state.yeds,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}
                            ></Column>
                            <Column dataField={'kyedm'} caption={'כותרת משנה'} lookup={{
                                dataSource: () => this.state.yedms,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}
                            ></Column>
                            <Column dataField={'sapakid'} caption={'שם ספק'} width={150} lookup={{
                                dataSource: () => this.state.sapaks,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'miv_name'} caption={'תאור המבצע'} width={200}></Column>
                            <Column dataField={'kyedmiv'} caption={'סוג מבצע'} setCellValue={this.setBarcodeListValue} lookup={{
                                dataSource: () => this.state.yedmivs,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'barcode'} caption={'ברקוד'} visible={false} setCellValue={this.setBarcodeListValue}
                                lookup={{
                                    dataSource: () => this.state.listBarCodeprice,
                                    displayExpr: "d",
                                    valueExpr: "n"
                                }}
                            ></Column>
                            <Column dataField={'barcodeListButton'} visible={false}></Column>
                            <Column dataField={'degem'} caption={'סדרה'} visible={false}></Column>
                            <Column dataField={'kamut'} caption={'כמות'} visible={false}></Column>
                            <Column dataField={'price'} caption={'סכום'} visible={false}></Column>
                            <Column dataField={'kamutbuy'} caption={'כמות קניה'} visible={false}></Column>
                            <Column dataField={'kamutsale'} caption={'כמות קבלה'} visible={false}></Column>
                            <Column dataField={'barcodePrice'} caption={'ברקוד מתנה'} visible={false}></Column>
                            <Column dataField={'kamutmat'} caption={'כמות מתנה'} visible={false}></Column>
                            <Column dataField={'kyedtz'} caption={'תצוגה'} width={180} lookup={{
                                dataSource: () => this.state.yedtzs,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'rem'} caption={'הערות'} width={100}></Column>
                            <Column dataField={'gondola'} visible={false} ></Column>

                            <Column dataField={'barcodeListS'} caption={'רשימת ברקוד שנבחרה'} visible={false} ></Column>
                            <Column cellRender={this.edidCell} width={50} alignment={'center'}></Column>

                        </DataGrid>
                        <OutsidePopup title={'ידיעון'}
                            key="OUTSIDE_YED_POP"
                            deferRendering
                            dragEnabled={true}
                            showTitle={true}
                            rtlEnabled
                            showCloseButton={false}
                            width={'40%'}
                            height={'80%'}
                            onShown={(e) => this.onShownPopup(e)}
                            ref={this.popupRef}

                            contentRender={(pros: any) => {
                                return (
                                    <div className='grid-wrapper' dir='rtl'>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (this.updateYedion)
                                                this.updateYedItem(e);
                                            if (this.addYedion)
                                                this.addYedItem(e);

                                        }}>
                                            {/* Id hidden */}
                                            <TextBox
                                                ref={this.YedIdRef}
                                                visible={false}
                                            >
                                            </TextBox>

                                            {/* shem yedion */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div className={'popup-field-label'}>שם ידיעון:</div>
                                                    <div className="popup-field">
                                                        <SelectBox
                                                            dataSource={this.state.yeds}
                                                            ref={this.kyedRef}
                                                            valueExpr={'Id'}
                                                            displayExpr={'Name'}
                                                        >
                                                        </SelectBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* subtitle */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div className={'popup-field-label'}>כותרת משנה:</div>
                                                    <div className="popup-field">
                                                        <SelectBox
                                                            ref={this.kyedmRef}
                                                            dataSource={this.state.yedms}
                                                            valueExpr={'Id'}
                                                            displayExpr={'Name'}
                                                            searchEnabled={true}
                                                        >
                                                        </SelectBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* teur miv */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div className={'popup-field-label'}>תאור מבצע:</div>
                                                    <div className="popup-field">
                                                        <TextBox
                                                            ref={this.mivnameRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* sug miv */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div className='popup-field-label'>סוג מבצע:</div>
                                                    <div className="popup-field">
                                                        <SelectBox id="kyedmiv" name="kyedmiv"
                                                            ref={this.kyedmivRef}
                                                            searchEnabled={true}
                                                            dataSource={this.state.yedmivs}
                                                            valueExpr={'Id'}
                                                            displayExpr={'Name'}
                                                            onValueChanged={(e) => {
                                                                this.hideprice();
                                                                this.hidekamut();
                                                                this.hidekamutBuy();
                                                                this.hidekamutSale();
                                                                this.hidekamutMat();
                                                                this.hidebarcodeMat();

                                                                if (e.value == 3) {
                                                                    this.showprice();
                                                                }
                                                                if (e.value == 4) {
                                                                    this.showprice();
                                                                    this.showkamut();
                                                                }
                                                                if (e.value == 5) {
                                                                    this.showkamutBuy();
                                                                    this.showkamutSale();
                                                                }
                                                                if (e.value == 6) {
                                                                    this.showkamutSale();
                                                                    this.showkamutMat();
                                                                    this.showbarcodeMat();
                                                                }
                                                            }
                                                            }
                                                            rtlEnabled={true}
                                                            showClearButton={true} >

                                                        </SelectBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* degem */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div id='degemLabel' className='popup-field-label'>סדרה:</div>
                                                    <div className="popup-field">
                                                        <SelectBox
                                                            ref={this.degemRef}
                                                            searchEnabled={true}
                                                            valueExpr={'d'}
                                                            displayExpr={'n'}
                                                            onKeyUp={this.OnKeyUpDegem}
                                                            onFocusIn={(e) => {
                                                                this.degem.reset();
                                                            }
                                                            }
                                                            onValueChanged={(e) => {
                                                                if (e.value == null) {
                                                                    this.resetdegem();
                                                                    this.showbarcode()
                                                                } else {
                                                                    this.hidebarcode();
                                                                    this.barcodeSelected.option('items', [])
                                                                    this.hidebarcodeSelected();
                                                                    this.hidesapak();

                                                                    let items = this.degemSelected._options.items
                                                                    let newItem = parseInt(this.degem._options.value);
                                                                    items.push(newItem);
                                                                    this.degemSelected.option('items', items)
                                                                    this.showdegemSelected();

                                                                    let barcodes = this.catalogForDegemJson[newItem];
                                                                    this.resetbarcodeForDegem();
                                                                    this.barcodeForDegem.option('items', barcodes)
                                                                    this.showbarcodeForDegem();

                                                                }
                                                            }
                                                            }
                                                            rtlEnabled={true}
                                                            showClearButton={true} >

                                                        </SelectBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* barcode */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div id='barcodeLabel' className='popup-field-label'>ברקוד:</div>
                                                    <div className="popup-field">
                                                        <SelectBox id="barcodeList" name="barcodeList"
                                                            ref={this.barcodeRef}
                                                            searchEnabled={true}
                                                            valueExpr={'d'}
                                                            displayExpr={'n'}
                                                            onKeyUp={this.onKeyUp.bind(this)}
                                                            onValueChanged={(e) => {
                                                                if (e.value != null) {
                                                                    this.barcodeButton.option('disabled', false);
                                                                    this.hidedegem();
                                                                    this.hidedegemSelected();
                                                                    this.hidebarcodeForDegem();

                                                                    let items = this.barcodeSelected._options.items
                                                                    let newItem = parseInt(this.barcode._options.value);
                                                                    items.push(newItem);
                                                                    this.barcodeSelected.option('items', items)
                                                                    this.showbarcodeSelected();
                                                                    this.hidesapak();
                                                                    this.resetsapak();
                                                                } else {
                                                                    this.showdegem();
                                                                    this.showdegemSelected();
                                                                    this.showbarcodeForDegem();
                                                                    this.barcodeButton.option('disabled', true);
                                                                }
                                                            }
                                                            }
                                                            rtlEnabled={true}
                                                            showClearButton={true} >

                                                        </SelectBox>
                                                        <Button
                                                            ref={this.barcodeButtonRef}
                                                            text={'בצע'}
                                                            visible={false}
                                                            onClick={(e) => {
                                                             
                                                            }}
                                                        >הוסף ברקוד</Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* kamut kabala */}
                                            <div className="popup-container" >
                                                <div className="popup-row-small">
                                                    <div id='kamutSaleLabel' className='popup-field-label'> כמות קבלה:</div>
                                                    <div className="popup-field">
                                                        <TextBox id="kamutsale" name="kamutsale"
                                                            // ref={(ref) => this.textBoxRef = ref}
                                                            ref={this.kamutSaleRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* barcode matana */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div id='barcodeMatLabel' className='popup-field-label'>ברקוד מתנה</div>
                                                    <div className="popup-field">
                                                        <SelectBox
                                                            ref={this.barcodeMatRef}
                                                            searchEnabled={true}
                                                            valueExpr={'d'}
                                                            displayExpr={'n'}
                                                            onKeyUp={this.onKeyUpBarcodeMat.bind(this)}
                                                            onValueChanged={(e) => {
                                                            }
                                                            }
                                                            rtlEnabled={true}
                                                            showClearButton={true} >

                                                        </SelectBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* kamut */}
                                            <div className="popup-container">
                                                <div className="popup-row-small">
                                                    <div id='kamutLabel' className='popup-field-label'>כמות:</div>
                                                    <div className="popup-field-small">
                                                        <TextBox id="kamut" name="kamut"
                                                            ref={this.kamutRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* price */}
                                            <div className="popup-container">
                                                <div className="popup-row-small">
                                                    <div id="priceLabel" className='popup-field-label'>סכום:</div>
                                                    <div className="popup-field-small">
                                                        <TextBox
                                                            ref={this.priceRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* kamut buy */}
                                            <div className="popup-container">
                                                <div className="popup-row-small">
                                                    <div id='kamutBuyLabel' className='popup-field-label'>כמות קניה</div>
                                                    <div className="popup-field-small">
                                                        <TextBox
                                                            ref={this.kamutBuyRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* kamut mat */}
                                            <div className="popup-container">
                                                <div className="popup-row-small">
                                                    <div id='kamutMatLabel' className='popup-field-label'>כמות מתנה:</div>
                                                    <div className="popup-field-small">
                                                        <TextBox id="kamutmat" name="kamutmat"
                                                            ref={this.kamutMatRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* tazuga */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div id='kyedtzLabel' className='popup-field-label'>תצוגה:</div>
                                                    <div className="popup-field">
                                                        <SelectBox
                                                            ref={this.kyedtzRef}
                                                            searchEnabled={true}
                                                            dataSource={this.state.yedtzs}
                                                            valueExpr={'Id'}
                                                            displayExpr={'Name'}
                                                            rtlEnabled={true}
                                                            showClearButton={false} >
                                                        </SelectBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* notes*/}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div id='remLabel' className='popup-field-label'>הערות:</div>
                                                    <div className="popup-field">
                                                        <TextBox
                                                            ref={this.remRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* gondola */}
                                            <div className="popup-container">
                                                <div className="popup-row-small">
                                                    <div id="gondolaLabel" className='popup-field-label'>ראש גונדולה:</div>
                                                    <div className="popup-field-small">
                                                        <TextBox
                                                            ref={this.gondolaRef}
                                                            showClearButton={false}
                                                        >
                                                        </TextBox>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* barcode select list */}
                                            <div className="popup-container">
                                                <div className="popup-row-list">
                                                    <div id='barcodeSelectedLabel' className='popup-field-label'>רשימת ברקוד שנבחרה:
                                                    <div className="popup-field-list">
                                                            <List
                                                                ref={this.barcodeSelectedRef}
                                                                rtlEnabled={true}
                                                                showSelectionControls={true}
                                                                allowItemDeleting={true}
                                                                itemDeleteMode={'static'}
                                                                height={200}
                                                                width={200}
                                                            >
                                                            </List>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* degem select list */}
                                            <div className="popup-container">
                                                <div className="popup-row-container">

                                                    <div className="popup-row-list-right">
                                                        <div id='degemSelectedLabel' className='popup-field-label'>רשימת סדרות שנבחרה:
                                                    <div className="popup-field-list">
                                                                <List
                                                                    ref={this.degemSelectedRef}
                                                                    rtlEnabled={true}
                                                                    showSelectionControls={true}
                                                                    allowItemDeleting={true}
                                                                    itemDeleteMode={'static'}
                                                                    height={200}
                                                                    width={200}
                                                                >
                                                                </List>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="popup-row-list-left">
                                                        <div id='barcodeForDegemLabel' className='popup-field-label'>ברקודים לדגם זה:
                                                    <div className="popup-field-list">
                                                                <List
                                                                    ref={this.barcodeForDegemRef}
                                                                    rtlEnabled={true}
                                                                    allowItemDeleting={false}
                                                                    height={200}
                                                                    width={200}
                                                                >
                                                                </List>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* sapakim */}
                                            <div className="popup-container">
                                                <div className="popup-row">
                                                    <div id='sapakLabel' className='popup-field-label'>ספק:</div>
                                                    <div className="popup-field">
                                                        <SelectBox
                                                            ref={this.sapakRef}
                                                            searchEnabled={true}
                                                            onKeyUp={this.OnKeyUpSapak.bind(this)}
                                                            valueExpr={'d'}
                                                            displayExpr={'n'}
                                                            rtlEnabled={true}
                                                            showClearButton={false}
                                                      
                                                        >
                                                        </SelectBox>
                                                    </div>
                                                </div>
                                            </div>



                                            <Button text={'save'} useSubmitBehavior className={'popup-save-button'}></Button>
                                            <Button text={'cancel'} className={'popup-cancel-button'} onClick={this.cancelForm}></Button>

                                        </form>
                                    </div>
                                )
                            }}>
                        </OutsidePopup>
                        
                
                    </div>
                </div>
            </div >
        );
    }

}

export default Yedion;
