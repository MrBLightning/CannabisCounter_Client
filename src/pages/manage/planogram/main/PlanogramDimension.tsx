import React, { Component, createRef } from 'react'
import { TextBox, Button, NumberBox, CheckBox } from 'devextreme-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faEdit } from '@fortawesome/free-solid-svg-icons'
import { CatalogProduct } from 'shared/interfaces/models/CatalogProduct'
import { DimensionObject, PlanogramSidebarProduct } from 'shared/store/planogram/planogram.types'
import { uiNotify } from 'shared/components/Toast'
import { BarcodeImage } from './components/generic/BarcodeImage'
import { fetchCatalogByBarCode, updateBarCodeDimensions, fetchCatalogByDegem } from 'shared/api/catalog.provider'

const highlightOnFocus = (e: any) => {
    if (e.event && e.event.srcElement)
        e.event.srcElement.select();
};

type DimensionBarcodeComponentState = {
    loading: false,
    product: CatalogProduct | null,
    markAllDegem: boolean,
    barcode: number,
    height: number,
    width: number,
    depth: number,
    weight: number,
    degemId: number,
    planogramItemList: PlanogramSidebarProduct[],
    selectedItem: number
}

class DimensionBarcodeComponent extends Component<{}> {
    barcodeInputRef = createRef<TextBox>();
    heightInputRef = createRef<NumberBox>();
    widthInputRef = createRef<NumberBox>();
    depthInputRef = createRef<NumberBox>();
    weightInputRef = createRef<NumberBox>();
    markSelectRef = createRef<CheckBox>();
    state: DimensionBarcodeComponentState = {
        loading: false,
        product: null,
        markAllDegem: true,
        barcode: 0,
        height: 0,
        width: 0,
        depth: 0,
        weight: 0,
        degemId: 0,
        planogramItemList: [],
        selectedItem: 0
    }

    updateBarcode = async () => {
        if (this.state.barcode > 0) {
            if (this.state.height <= 0) {
                uiNotify('- הגובה לא יכול להיות 0', 'error');
                return;
            }
            if (this.state.width <= 0) {
                uiNotify('- הרוחב לא יכול להיות 0', 'error');
                return;
            }
            if (this.state.depth <= 0) {
                uiNotify('- העומק לא יכול להיות 0', 'error');
                return;
            }
            if (this.state.weight != null && this.state.weight < 0) {
                uiNotify('- המשקל לא יכול להיות 0', 'error');
                return;
            }
            let dimensions: DimensionObject = {
                height: this.state.height,
                width: this.state.width,
                depth: this.state.depth,
                weight: this.state.weight
            };
            let planogramItemList: PlanogramSidebarProduct[] = this.state.planogramItemList;
            if (this.state.degemId > 0 && this.state.markAllDegem) {
                let productsMap: CatalogProduct[] = await fetchCatalogByDegem(this.state.degemId);
                let length = productsMap.length;
                for (let i = 0; i < length; i++) {
                    try {
                        await updateBarCodeDimensions(productsMap[i].BarCode, dimensions).then(() => {
                            planogramItemList = this.updatePlanogramItemList(i, dimensions, productsMap[i], planogramItemList);
                        }).catch(err => {
                            uiNotify(err, 'error');
                        });
                    } catch (err) {
                        console.error(err);
                        uiNotify(err, 'error');
                    }
                }
            } else {
                try {
                    await updateBarCodeDimensions(this.state.barcode, dimensions).then(() => {
                        planogramItemList = this.updatePlanogramItemList(-1, dimensions, null, planogramItemList);
                    }).catch(err => {
                        uiNotify(err, 'error');
                    });
                } catch (err) {
                    console.error(err);
                    uiNotify(err, 'error');
                }
            }
            this.setState({ planogramItemList });
            this.focusBarcodeInput();
        }
    }
    //componentDidMount = async () => {}
    updatePlanogramItemList = (i: number, dimensions: DimensionObject, productsMap: CatalogProduct | null, planogramItemList: PlanogramSidebarProduct[]): PlanogramSidebarProduct[] => {
        let item: PlanogramSidebarProduct = {
            id: 0,
            barcode: 0,
            name: '',
            dimensions: {
                height: 0,
                width: 0,
                depth: 0,
                weight: 0
            }
        };
        if (i > -1 && productsMap != null)
            item = {
                id: productsMap.Id,
                barcode: productsMap.BarCode,
                name: productsMap.Name,
                dimensions: dimensions
            }
        else if (this.state.product != null)
            item = {
                id: this.state.product.Id,
                barcode: this.state.barcode,
                name: this.state.product.Name,
                dimensions: dimensions
            }
        if (planogramItemList.length === 15) {
            this.limitArray();
            planogramItemList[0] = item;
        } else planogramItemList.unshift(item);
        return planogramItemList;
    }
    focusBarcodeInput = () => {
        if (this.barcodeInputRef.current != null)
            this.barcodeInputRef.current.instance.focus();
    }
    getProduct = async (barcode: number) => {
        if (barcode > 0) {
            await fetchCatalogByBarCode(barcode).then((item) => {
                if (item[0] != undefined) {
                    this.setState({
                        barcode: barcode,
                        markAllDegem: true,
                        product: item[0],
                        height: item[0].height,
                        width: item[0].width,
                        depth: item[0].length,
                        weight: item[0].weightGross,
                        degemId: item[0].DegemId,
                    });
                }
                else {
                    if (this.barcodeInputRef.current != null)
                        this.barcodeInputRef.current.instance.focus();
                    uiNotify('- לא קיים ברקוד כזה. אנא נסו שנית.', 'error');
                }
            }).catch(err => {
                uiNotify(err, 'error');
            });
        }
    }
    flipToggle = async () => {
        this.setState({ markAllDegem: !this.state.markAllDegem })
    }
    limitArray = () => {
        let planogramItemList: PlanogramSidebarProduct[] = this.state.planogramItemList;
        for (let i = 14; i >= 0; i--) {
            planogramItemList[i] = planogramItemList[i - 1];
        }
    }
    removeBarcodeFromArray = (barcode: number) => {
        let planogramItemList: PlanogramSidebarProduct[] = this.state.planogramItemList;
        planogramItemList.slice(planogramItemList.findIndex(item => item.barcode === barcode), 1);
    }
    render() {
        const { product, planogramItemList, selectedItem } = this.state;
        return (
            <div className="planogram-document">
                <div className="container">
                    <div className="stage-barcode">
                        <h1>סריקת ברקוד <span style={{ fontSize: '12px' }}>עדכון מידות פריט במילימטרים</span></h1>
                        <div style={{ marginBottom: "1em" }}>
                            <div><span style={{ fontSize: '12px', fontWeight: 'bold' }}>פריטים אחרונים</span></div>
                            <div
                                // ref={this.shelfContainerRef}
                                className="scroller horizontal"
                                style={{ display: "flex", overflowX: "auto", flexDirection: "row-reverse", paddingBottom: "0.5em" }}>
                                {planogramItemList ? planogramItemList.map(item => {
                                    return <DimensinShelfItem
                                        key={"ITEM_" + item.id + "_RAND_" + Math.random()}
                                        item={item}
                                        product={item.barcode}
                                        selectedItem={selectedItem}
                                        setState={(state: any) => this.setState(state)}
                                        getProduct={this.getProduct}
                                        removeBarcodeFromArray={this.removeBarcodeFromArray}
                                    />
                                }) : null}
                            </div>
                        </div>
                        <div className="input-row" style={{ display: "flex" }}>
                            <TextBox
                                tabIndex={1}
                                style={{ flex: 1 }}
                                ref={this.barcodeInputRef}
                                rtlEnabled
                                value={""}
                                onFocusIn={highlightOnFocus}
                                onEnterKey={() => {
                                    if (this.heightInputRef.current != null)
                                        this.heightInputRef.current.instance.focus();
                                }}
                                onValueChanged={e => this.getProduct(parseInt(e.value))}
                                className="row-input"
                                placeholder="נא לסרוק ברקוד..." />
                            <Button
                                className="row-input">
                                <FontAwesomeIcon icon={faSearch} />
                            </Button>
                        </div>
                        {product != null ? <div className="barcode-data" style={{ borderTop: "1px solid #dedede" }}>
                            <div style={{ float: "left", width: "60px" }}>
                                <BarcodeImage barcode={product.BarCode} />
                            </div>
                            <h3 style={{ marginBottom: "0.2em" }}>{product != null ? product.BarCode + " - " + product.Name : this.state.barcode}</h3>
                            {product.Archives != null && product.Archives == 1 ?
                                <div style={{
                                    width: "100%",
                                    color: "#fafafa",
                                    background: "red",
                                    padding: "0.5em"
                                }}>מוצר ארכיון!</div>
                                : null}
                            <div style={{ display: "flex", width: "100%", marginBottom: "0.2em" }}>
                                <div style={{ flex: 1, }}>
                                    <div>סדרה</div>
                                    <TextBox
                                        rtlEnabled
                                        width="100%"
                                        value={product.DegemName}
                                        disabled={true}
                                        className="row-input" />
                                </div>
                                <div style={{ flex: 1, paddingRight: '1em' }}>
                                    <div>עדכון כל הסדרה</div>
                                    <CheckBox
                                        style={{ marginTop: '0.5em', marginRight: '2.5em' }}
                                        ref={this.markSelectRef}
                                        tabIndex={2}
                                        rtlEnabled
                                        value={this.state.markAllDegem}
                                        onValueChanged={this.flipToggle}
                                        className="row-input" />
                                </div>
                            </div>
                            <div style={{ display: "flex", width: "100%", marginBottom: "0.2em" }}>
                                <div style={{ flex: 1, }}>
                                    <div>גובה</div>
                                    <NumberBox
                                        ref={this.heightInputRef}
                                        onFocusIn={highlightOnFocus}
                                        tabIndex={3}
                                        rtlEnabled
                                        //min={1}
                                        step={1}
                                        width="100%"
                                        onEnterKey={() => {
                                            if (this.widthInputRef.current != null)
                                                this.widthInputRef.current.instance.focus();
                                        }}
                                        onValueChanged={(e) => {
                                            if (e.value <= 0)
                                                return uiNotify("גובה לא תקין.");

                                            this.setState({ height: parseInt(e.value) })
                                        }}
                                        value={this.state.height}
                                        className="row-input" />
                                </div>
                                <div style={{ flex: 1, }}>
                                    <div>רוחב</div>
                                    <NumberBox
                                        ref={this.widthInputRef}
                                        onFocusIn={highlightOnFocus}
                                        tabIndex={4}
                                        rtlEnabled
                                        //min={1}
                                        step={1}
                                        width="100%"
                                        onEnterKey={() => {
                                            if (this.depthInputRef.current != null)
                                                this.depthInputRef.current.instance.focus();
                                        }}
                                        onValueChanged={(e) => {
                                            if (e.value <= 0)
                                                return uiNotify("רוחב לא תקין.");
                                            this.setState({ width: parseInt(e.value) })
                                        }}
                                        value={this.state.width}
                                        className="row-input" />
                                </div>
                                <div style={{ flex: 1, }}>
                                    <div>עומק</div>
                                    <NumberBox
                                        ref={this.depthInputRef}
                                        onFocusIn={highlightOnFocus}
                                        tabIndex={5}
                                        rtlEnabled
                                        //min={1}
                                        step={1}
                                        width="100%"
                                        onEnterKey={() => {
                                            if (this.weightInputRef.current != null)
                                                this.weightInputRef.current.instance.focus();
                                        }}
                                        onValueChanged={(e) => {
                                            if (e.value <= 0)
                                                return uiNotify("עומק לא תקין.");
                                            this.setState({ depth: parseInt(e.value) })
                                        }}
                                        value={this.state.depth}
                                        className="row-input" />
                                </div>
                                <div style={{ flex: 1, }}>
                                    <div>משקל</div>
                                    <NumberBox
                                        ref={this.weightInputRef}
                                        onFocusIn={highlightOnFocus}
                                        tabIndex={6}
                                        rtlEnabled
                                        //min={1}
                                        step={1}
                                        width="100%"
                                        onEnterKey={() => {
                                            if (this.barcodeInputRef.current != null)
                                                this.barcodeInputRef.current.instance.focus();
                                        }}
                                        onValueChanged={(e) => {
                                            if (e.value < 0)
                                                return uiNotify("משקל לא תקין.");
                                            if (!isNaN(parseInt(e.value)))
                                                this.setState({ weight: parseInt(e.value) })
                                            else this.setState({ weight: null })
                                        }}
                                        value={this.state.weight}
                                        className="row-input" />
                                </div>
                            </div>
                        </div> : null}
                        <div className="input-row">
                            <Button
                                tabIndex={6}
                                useSubmitBehavior={true}
                                rtlEnabled
                                style={{ width: "100%" }}
                                disabled={product == null}
                                className="row-input"
                                onClick={this.updateBarcode}>

                                <FontAwesomeIcon icon={faEdit} />
                                <span style={{ marginRight: "1em" }}>{"עדכן"}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

type DimensinShelfItemProps = {
    item: PlanogramSidebarProduct,
    product: number,
    selectedItem: number,
    setState: Function,
    getProduct: (barcode: number) => void
    removeBarcodeFromArray: (barcode: number) => void
};
class DimensinShelfItem extends Component<DimensinShelfItemProps> {
    pressTimer: NodeJS.Timeout | null = null;
    holdBegin = (e: any) => {
        if (e.type === "click" && e.button !== 0)
            return;
        // this.pressTimer = setTimeout(() => {
        //     const { item, removeBarcodeFromArray } = this.props;
        //     if (!window.confirm("להסיר מרשימת הפריטים האחרונים?"))
        //         return;
        //     removeBarcodeFromArray(item.barcode);
        // }, 1500);
    }
    holdEnd = (e: any) => {
        if (this.pressTimer) {
            clearTimeout(this.pressTimer);
            this.pressTimer = null;
        }
    }
    onClick = (e: any) => {
        this.holdEnd(e);
        const { item, selectedItem } = this.props;
        if (selectedItem === item.barcode)
            this.props.setState({
                selectedItem: 0
            })
        else {
            this.props.setState({
                selectedItem: item.barcode,
                barcode: item.barcode
            })
            this.props.getProduct(item.barcode);
        }
    }
    shouldComponentUpdate(nextProps: DimensinShelfItemProps) {
        if (nextProps.selectedItem !== this.props.selectedItem)
            return true;
        if (nextProps.item.barcode !== this.props.item.barcode)
            return true;
        if (nextProps.item.dimensions.height !== this.props.item.dimensions.height
            || nextProps.item.dimensions.width !== this.props.item.dimensions.width
            || nextProps.item.dimensions.depth !== this.props.item.dimensions.depth)
            return true;
        return false;
    }
    render() {
        const { item, selectedItem } = this.props;
        return (<div
            onMouseDown={this.holdBegin}
            onTouchStart={this.holdBegin}
            onMouseOut={this.holdEnd}
            onTouchEnd={this.holdEnd}
            onTouchCancel={this.holdEnd}
            onClick={this.onClick}
            key={item.id}
            className="noselect"
            style={{
                maxWidth: "100px",
                display: "flex",
                flexFlow: "column",
                alignContent: "center",
                alignItems: "center",
                fontSize: "0.8em",
                border: "1px solid #dadada",
                color: selectedItem === item.barcode ? "#ECF0F1" : "inherit",
                background: selectedItem === item.barcode ? "#00A69A" : "none",
                marginRight: '0.3em'
            }}>
            <div style={{ padding: "0.2em", fontSize: "1em", fontWeight: "bold" }}>{item.barcode}</div>
            <div style={{ display: "flex" }}>
                <div className="input-row" style={{ flex: 1, display: "flex", padding: "0.3em", width: "100%", flexDirection: "column", alignItems: 'center' }}>
                    <div style={{ fontSize: "0.7em" }}>גובה</div>
                    <div style={{ fontWeight: "bold" }}>{item.dimensions.height}</div>
                </div>
                <div className="input-row" style={{ flex: 1, display: "flex", padding: "0.3em", width: "100%", flexDirection: "column", alignItems: 'center' }}>
                    <div style={{ fontSize: "0.7em" }}>רוחב</div>
                    <div style={{ fontWeight: "bold" }}>{item.dimensions.width}</div>
                </div>
                <div className="input-row" style={{ flex: 1, display: "flex", padding: "0.3em", width: "100%", flexDirection: "column", alignItems: 'center' }}>
                    <div style={{ fontSize: "0.7em" }}>עומק</div>
                    <div style={{ fontWeight: "bold" }}>{item.dimensions.depth}</div>
                </div>
                <div className="input-row" style={{ flex: 1, display: "flex", padding: "0.3em", width: "100%", flexDirection: "column", alignItems: 'center' }}>
                    <div style={{ fontSize: "0.7em" }}>משקל</div>
                    <div style={{ fontWeight: "bold" }}>{item.dimensions.weight}</div>
                </div>
            </div>
            <div style={{ width: "60px", height: "60px" }}>
                <BarcodeImage barcode={item.barcode} style={{ maxHeight: "60px", width: "auto" }} />
            </div>
        </div>
        )
    }
}

export const PlanogramDimension = DimensionBarcodeComponent;