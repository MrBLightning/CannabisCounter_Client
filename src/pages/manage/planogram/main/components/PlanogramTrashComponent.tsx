
import React, { Component } from 'react'
import { PlanogramDragDropTypes } from './generic/DragAndDropType';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragElementWrapper, DropTarget } from 'react-dnd';


interface TargetCollectProps {
    connectDropTarget: DragElementWrapper<any>,
    canDrop: boolean,
}

export interface TrashComponentProps {
    // onDrop?: (item: DragDropResultBase, targetItem: DragDropResultBase) => void
}

const dropTypes = [
    PlanogramDragDropTypes.SHELF_ITEM, 
    PlanogramDragDropTypes.SHELF, 
    PlanogramDragDropTypes.SECTION
];

const SectionDroppableTarget = DropTarget<TrashComponentProps, TargetCollectProps>(
    dropTypes, {
        drop(props, monitor) {
            return {
                type: PlanogramDragDropTypes.TRASH,
                payload: {},
            };
        }
    }, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        canDrop: monitor.canDrop(),
    })
);

class PlanogramTrashComponent extends Component<TargetCollectProps, any> {
    render() {
        const { connectDropTarget } = this.props;
        return connectDropTarget(
            <div className="planogram-drop-garbage">
                <FontAwesomeIcon icon={faTrash} size="4x" />
            </div>
        )
    }
}

export default SectionDroppableTarget(PlanogramTrashComponent);