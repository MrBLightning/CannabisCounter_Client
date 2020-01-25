import React from 'react'
import { DropTarget, DragElementWrapper, DragSource, ConnectableElement } from 'react-dnd'
import { PlanogramDragDropTypes } from './DragAndDropType';

export interface DropZoneProps {
  type: PlanogramDragDropTypes | PlanogramDragDropTypes[],
  payload: any
};


export interface DropZoneTargetCollectProps {
  connectDrag: DragElementWrapper<any>
};
export interface DropZoneTargetProps {
  type: PlanogramDragDropTypes | PlanogramDragDropTypes[],
  payload: any,
  onItemDrop?: (item: any) => void,
  canDrop?: (item: any, dropPayload: any) => boolean
};

const TypedDropZoneComponent: React.FC<{
  connectDrag: DragElementWrapper<any>
  children: ConnectableElement,
} & DropZoneTargetProps> = ({ children, connectDrag, payload, type }) => (connectDrag(children, { payload: payload, type: type }));

export const TypedDropZone: React.FC<DropZoneTargetProps & { children: ConnectableElement }> = (props) => {
  const Compo = DropTarget<DropZoneTargetProps, DropZoneTargetCollectProps>(
    props.type, {
      canDrop: (_props, monitor) => {
        const item = monitor.getItem();
        // if (props.canDrop)
        //   return props.canDrop(item, _props.payload);
        if (props.type instanceof Array && props.type.includes(item.type))
          return true;
        else
          return props.type === item.type;
      },
      drop: (_props, monitor, component) => {
        if (!monitor.didDrop())
          return;
        const item = monitor.getItem();
        if (props.onItemDrop)
          props.onItemDrop(item.payload || item);
        return { payload: _props.payload, type: _props.type };
      },
    }, (connect, monitor) => ({
      connectDrag: connect.dropTarget(),
    }))(
      TypedDropZoneComponent
    );
  return <Compo {...props} />
}

export interface DropZoneSourceCollectProps {
  connectDrag: DragElementWrapper<any>
};
export interface DropZoneSourceProps {
  type: PlanogramDragDropTypes,
  payload: any,
  onDrop?: (payload: any) => void,
  beginDrag?: () => void,
  // onItemDrop?: (item: any) => void,
  // canDrop?: (item: any, dropPayload: any) => boolean
};

export const TypedDragItem: React.FC<DropZoneSourceProps & { children: ConnectableElement }> = (props) => {
  const Compo = DragSource<DropZoneSourceProps, DropZoneSourceCollectProps>(props.type, {
    beginDrag: (_props, monitor, component) => {
      if (_props.beginDrag)
        _props.beginDrag();
      return { payload: _props.payload, type: _props.type };
    },
    endDrag: (_props, monitor) => {
      if (!monitor.didDrop())
        return;
      // const { onDrop } = _props;
      const { payload } = monitor.getItem();
      if (_props.onDrop)
        _props.onDrop(payload);
    },
    // isDragging: (_props, monitor)=>{
    // monitor.isOver({ shallow: true })
    // }
  }, (connect, monitor) => ({
    connectDrag: connect.dragSource(),
  }))(TypedDropZoneComponent);
  return <Compo {...props} />;
}