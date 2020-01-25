import React, { Component } from 'react'

export const fileReadyCurrentTime = () => {
    const time = new Date();
    return `${time.getFullYear()}-${time.getMonth()}-${time.getDay()}_${time.getHours()}-${time.getMinutes()}`
}

export class JsonDownloadButton extends Component<{ filename: string, getData: () => Object }> {
    downloadFile = async () => {
        const myData = this.props.getData();
        const fileName = this.props.filename;
        const json = JSON.stringify(myData);
        const blob = new Blob([json], { type: 'application/json' });
        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        return (
            <button onClick={e => {
                e.stopPropagation();
                this.downloadFile();
            }}>
                {this.props.children}
            </button>
        )
    }
}


export class FileLoadingButton extends Component<{ onData: (data: any) => void }> {
    fileRef = React.createRef<HTMLInputElement>();
    reader: FileReader = new FileReader();
    componentDidMount() {
        this.reader.onloadend = () => {
            this.props.onData(this.reader.result);
        };
    }
    render() {
        return (

            <button onClick={e => {
                e.stopPropagation();
                if (this.fileRef.current)
                    this.fileRef.current.click()

            }}>
                <input style={{ display: "none" }} type="file" name="file" ref={this.fileRef} onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null
                    if (file == null) return;
                    this.reader.readAsText(file);
                }} />
                {this.props.children}
            </button>
        )
    }
}
