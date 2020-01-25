
import React, { Component } from 'react'
//@ts-ignore
import Quagga from "quagga";
import "./barcode-scanner.scss"

export default class BarcodeScanner extends Component<{ onDetected: (result: string | number) => void }> {
    elementRef = React.createRef<HTMLDivElement>();
    state: { barcode?: number } = {}
    componentDidMount() {
        Quagga.init({
            inputStream: {
                type: "LiveStream",
                constraints: {
                    // width: 640,
                    // height: 480,
                    facingMode: "environment" // or user
                },
                target: document.getElementById("BarcodeScanner") || "#BarcodeScanner"
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 4,
            decoder: {
                readers: ["ean_reader"]
            },
            locate: true
        }, (err: any) => {
            if (err)
                return console.log(err);
            Quagga.start();
        });
        Quagga.onDetected(this._onDetected);
    }

    componentWillUnmount() {
        Quagga.offDetected(this._onDetected);
    }

    _onDetected = (result: any) => {
        if (result && result.codeResult && result.codeResult.code) {
            if (this.state.barcode == result.codeResult.code) return;
            this.setState({
                barcode: result.codeResult.code
            })
            this.props.onDetected(result.codeResult.code);
        }
    }
    render() {
        return (
            <div ref={this.elementRef} id="BarcodeScanner" className="scanner-viewport" />
        );
    };
}