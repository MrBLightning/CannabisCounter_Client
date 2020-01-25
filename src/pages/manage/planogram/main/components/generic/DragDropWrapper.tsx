
import { DropTarget, DragElementWrapper, DragSource } from 'react-dnd';


export interface DragDropResultBase {
    type?: string | string[],
    payload: any,
}