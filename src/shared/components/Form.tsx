import React, { useState, Component } from "react";

export type EditableTextProps = { text: string, onNewText: (text: string) => void };

export class EditableText extends Component<EditableTextProps> {
    state = {
        editing: false,
        text: this.props.text,
    }
    componentWillReceiveProps(nextProps: EditableTextProps) {
        if (this.props.text !== nextProps.text)
            this.setState({ text: nextProps.text });
    }
    handleSubmit = () => {
        this.props.onNewText(this.state.text);
        this.setState({
            text: "",
            editing: false
        })
    }
    render() {
        if (this.state.editing)
            return <form onSubmit={e => {
                e.preventDefault();
                this.handleSubmit();
            }}>
                <input
                    type="text"
                    value={this.state.text}
                    onBlur={e => this.handleSubmit()}
                    autoFocus
                    onChange={e => this.setState({
                        text: e.target.value
                    })} />
                <input type="submit" value="" style={{ display: "none" }} />
            </form>
        return <div onDoubleClick={e => this.setState({
            editing: true,
        })}>
            {this.props.children}
        </div>
    }
}


// export const EditableText: React.FC<{ text: string, onNewText: (text: string) => void }> = ({ children, text, onNewText }) => {
//     const [state, setState] = useState({
//         editing: false,
//         text,
//     });
//     const handleSubmit = () => {
//         setState({
//             ...state,
//             editing: false
//         })
//         onNewText(state.text);
//     }
//     if (state.editing)
//         return <form onSubmit={e => {
//             e.preventDefault();
//             handleSubmit();
//         }}>
//             <input
//                 type="text"
//                 value={state.text}
//                 onBlur={e => handleSubmit()}
//                 autoFocus
//                 onChange={e => setState({
//                     ...state,
//                     text: e.target.value
//                 })} />
//             <input type="submit" value="" style={{ display: "none" }} />
//         </form>
//     return <div onDoubleClick={e => setState({
//         ...state,
//         editing: true,
//     })}>
//         {children}
//     </div>;
// }