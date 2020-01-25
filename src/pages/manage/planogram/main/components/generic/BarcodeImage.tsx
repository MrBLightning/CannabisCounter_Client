import React, { FC } from "react";
import config from "shared/config";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { errorImageHandler } from "shared/components/SmartImage";

const CACHE_KEY = "image_cache";
let imageVersion = loadImageVersion();

export function barcodeImageSrc(barcode: CatalogBarcode | string) {
    return config.PRODUCT_URL + '/' + barcode + ".jpg" + "?v" + imageVersion;
}
export const BarcodeImage: FC<{ barcode: CatalogBarcode } & any> = (props) => <img
    {...props}
    src={config.PRODUCT_URL + '/' + props.barcode + ".jpg" + "?v" + imageVersion}
    onError={errorImageHandler} />

function loadImageVersion() {
    let version = localStorage.getItem(CACHE_KEY);
    if (!version)
        localStorage.setItem(CACHE_KEY, Math.round(Date.now() / 1000).toString());
    return version || config.IMAGE_CACHE_VERSION;
}

export function refreshBarcodeImage() {
    localStorage.setItem(CACHE_KEY, Math.round(Date.now() / 1000).toString());
    window.location.reload();
}