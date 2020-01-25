import React, { Component } from 'react'
import { PlanogramStore } from 'shared/store/planogram/planogram.types';

export default class BackupImportModal extends Component<{
    onSubmit: (data: any) => void
}> {
    state: {
        data: any
    } = {
            data: null,
        }
    reader: FileReader = new FileReader();
    componentDidMount() {
        this.reader.onloadend = () => {
            this.handleFile(this.reader.result)
        };
    }

    handleFile = (data: string | ArrayBuffer | null) => {
        if (typeof data !== "string")
            return;
        const obj = JSON.parse(data);

        this.setState({
            store: obj
        })
    }

    render() {
        return (
            <div className="container">
                <h1>Backup Planogram Import</h1>
                <input type="file" name="file" onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null
                    if (file == null) return;
                    this.reader.readAsText(file);
                }} />
                <button onClick={e => {
                    if (this.state.data == null)
                        return;
                    this.props.onSubmit(this.state.data);
                }}>
                    Load Planogram
                </button>
                {/* {this.state.data.map((v: any, i) => (
                    <DisplayTable data={v} key={v.name || "table_" + i} />
                ))} */}
            </div>
        )
    }
}