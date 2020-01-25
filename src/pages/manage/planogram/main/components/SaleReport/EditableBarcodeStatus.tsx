
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, TextArea } from 'devextreme-react'
import { AppState } from 'shared/store/app.reducer'
import { ThunkDispatch } from 'redux-thunk'
import { CatalogBarcode } from 'shared/interfaces/models/CatalogProduct'
import { uiNotify } from 'shared/components/Toast'
import * as catalogApi from 'shared/api/catalog.provider';
import { updateBarcodeStatus } from 'shared/store/catalog/catalog.action'

const mapStateToProps = (state: AppState, ownProps: {
    barcode: CatalogBarcode
}) => ({
    ...ownProps,
    barcodeStatusMessage: state.catalog.barcodeStatusMap[ownProps.barcode] ? state.catalog.barcodeStatusMap[ownProps.barcode].Message || "" : ""
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, any, any>) => ({
    updateBarcodeStatus: (barcode: CatalogBarcode, message: string) => dispatch(updateBarcodeStatus(barcode, message))
})

class EditableBarcodeStatus extends Component<ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>> {
    state = {
        isEditing: false,
        message: this.props.barcodeStatusMessage,
        loading: false
    }

    editMessage = () => {
        const { barcode, updateBarcodeStatus, barcodeStatusMessage } = this.props;
        const { message } = this.state;

        if (message === barcodeStatusMessage) {
            this.setState({
                isEditing: false
            });
            return
        }
        this.setState({ loading: true });
        catalogApi.updateBarcodeStatus(barcode, message).then(() => {
            updateBarcodeStatus(barcode, message);
            uiNotify("Successfully edited barcode message", "success", 3000);
            this.setState({
                loading: false,
                message: "",
                isEditing: false
            })
        }).catch((err) => {
            console.error(err);
            uiNotify("Unable to edit barcode status.", "error", 3000);
        })
    }

    render() {
        if (this.state.loading)
            return <div className="loader"></div>
        if (!this.state.isEditing)
            return <div style={{ display: "flex", width: "100%" }} onDoubleClick={() => this.setState({ isEditing: true, message: this.props.barcodeStatusMessage })}>
                <div style={{ flex: 1 }}>{this.props.barcodeStatusMessage}</div>
                {!this.props.barcodeStatusMessage ?
                    <Button icon="edit" onClick={() => this.setState({ isEditing: true, message: this.props.barcodeStatusMessage })} />
                    : null}
            </div>
        return (
            <div style={{ display: "flex", width: "100%" }}>
                <TextArea style={{ flex: 1 }} value={this.state.message} onValueChanged={e => this.setState({ message: e.value })} />
                <Button icon="save" onClick={this.editMessage} />
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditableBarcodeStatus)
