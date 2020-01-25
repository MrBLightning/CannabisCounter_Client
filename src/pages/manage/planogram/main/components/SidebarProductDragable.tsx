import React from 'react';
// import LazyLoad from 'react-lazyload';
import { PlanogramDragDropTypes } from './generic/DragAndDropType';
import config from 'shared/config';
import { useDrag } from 'react-dnd';
import { CatalogBarcode } from 'shared/interfaces/models/CatalogProduct';
import { errorImageHandler } from 'shared/components/SmartImage';
import { barcodeImageSrc } from './generic/BarcodeImage';

export const SidebarProductDragable: React.FC<{
    product: CatalogBarcode,
    productName?: string,
    className?: string,
}> = ({ product, className, productName }) => {
    const [{ isDragging }, dragRef] = useDrag({
        item: {
            type: PlanogramDragDropTypes.PRODUCT_SIDEBAR,
            payload: product
        },
        // canDrag: monitor => product.dimensions && product.dimensions.height != null && product.dimensions.width != null && product.dimensions.depth != null,
        collect: monitor => ({
            isDragging: monitor.canDrag() && monitor.isDragging(),
        }),
    });
    return (<div ref={dragRef} className={(className || "") + (isDragging ? " dragged" : "")}>
        {/* <LazyLoad
            height={100}
            offset={100}
            placeholder={<div>Loading...</div>}> */}
        {productName ? <div className="product-title">{productName}</div> : null}
        <img
            src={barcodeImageSrc(product)}
            alt={productName || ("Product: " + product)}
            onError={errorImageHandler} />
        {/* </LazyLoad> */}
    </div>);
};