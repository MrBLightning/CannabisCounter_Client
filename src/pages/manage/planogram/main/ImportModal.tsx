import React, { Component } from 'react'

export default class ImportModal extends Component<{
    onSubmit: (data: any[]) => void
}, {
    data: any[]
}> {
    state = {
        data: [],
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

        const rows = data.split("\n");

        const itemLabels = rows[0].split(',').map(s => s.replace("\r", "").trim());
        const dataRows: any[] = [];
        for (let i = 0; i < rows.length; i++) {
            if (i === 0)
                continue;
            const row = rows[i];
            const newRow: { [key: string]: any } = {};
            const items = row.split(',');
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                const itemLabel = itemLabels[j];
                if (itemLabel == null)
                    continue;
                if (typeof item === "string" && Number(item) !== NaN)
                    newRow[itemLabel] = Number(item);
                else
                    newRow[itemLabel] = item;
            }
            dataRows.push(newRow);
        }
        this.setState({
            data: dataRows
        });
    }

    render() {
        return (
            <div className="container">
                <h1>Import CSV file</h1>
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
                <DisplayTable data={this.state.data} />
            </div>
        )
    }
}

class DisplayTable extends Component<{ data: any[] }> {
    render() {
        const data = this.props.data;
        const products = data || [];
        return (
            <table style={{
                width: "100%"
            }}>
                <thead>
                    <tr>
                        {products[0] != null ?
                            Object.keys(products[0]).map((label) => (
                                <th key={"label_" + label}>{typeof label === "string" || typeof label === "number" ? label : ""}</th>
                            ))
                            : null}
                    </tr>
                </thead>
                <tbody>
                    {products.map((row: any, i: number) => (
                        <tr key={"row_" + i} style={{ borderBottom: "1px solid #bababa" }}>
                            {Object.values(row).map((item, _i) => (
                                <td key={"row_" + i + "_item_" + _i}>{typeof item === "string" || typeof item === "number" ? item : ""}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }
}
