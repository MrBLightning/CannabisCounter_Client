

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

export class Modal extends Component {
    render() {
        return (
            <div className="modal-content">
                {this.props.children}
            </div>
        )
    }
}

type ModalWrapperState = {
    modal?: React.FC,
    isOpen: boolean
}


export let setModal: (modalElement: React.FC) => void;
export let toggleModal: Function;

export class ModalContainer extends Component<{}, ModalWrapperState> {
    readonly state: ModalWrapperState = {
        isOpen: false
    }
    componentDidMount() {
        setModal = this.setModal;
        toggleModal = this.toggleModal;
    }
    componentWillUnmount() {
        setModal = () => { };
        toggleModal = () => { };
    }


    setModal = (modalElement: React.FC) => {
        this.setState({
            modal: modalElement,
            isOpen: true
        });
    }

    toggleModal = () => {
        this.setState({ isOpen: this.state.isOpen ? false : true });
    }
    closeModal = () => {
        this.setState({ isOpen: false });
    }

    render() {
        const ModalInnerComponent = this.state.modal;
        return (
            <div className={"modal" + (this.state.isOpen ? " open" : "")} onClick={(e) => {
                e.stopPropagation();
                this.closeModal();
            }}>
                <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-close" onClick={(e) => this.closeModal()}>
                        <FontAwesomeIcon icon={faWindowClose} />
                    </div>
                    {ModalInnerComponent != null ?
                        <ModalInnerComponent />
                        : null}
                </div>
            </div>
        )
    }
}
