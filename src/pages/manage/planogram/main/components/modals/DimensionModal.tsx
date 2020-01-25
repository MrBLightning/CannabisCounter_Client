import React, { useState } from "react";
import { DimensionObject } from "shared/store/planogram/planogram.types";

type DimensionModalProps = {
    title?: string,
    subtitle?: string,
    init?: DimensionObject,
    maxDimensions?: DimensionObject,
    minDimensions?: DimensionObject,
    onSubmit: (placement: DimensionObject) => void,
};

function parseTargetValue(targetValue: any) {
    return targetValue == null || targetValue === "" ? 0 : parseInt(targetValue)
}
const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

export const DimensionModal: React.FC<DimensionModalProps> = ({ onSubmit, init, maxDimensions, minDimensions, title, subtitle, children }) => {
    const [dimension, setPlacement] = useState<DimensionObject>({
        depth: 0,
        height: 0,
        width: 0,
        ...init
    });
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(dimension);
            }}
            onClick={(e) => e.stopPropagation()}>
            <div className="context-title">{title || "Dimensions"}</div>
            {subtitle != null ? <div className="context-subtitle">{subtitle}</div> : null}
            <div className="input-row">
                <label htmlFor="height">Height: </label>
                <input
                    autoFocus
                    type="number"
                    name="height"
                    min={minDimensions && minDimensions.height ? minDimensions.height : undefined}
                    max={maxDimensions && maxDimensions.height ? maxDimensions.height : undefined}
                    value={dimension.height}
                    onFocus={handleFocus}
                    onChange={(e) => {
                        let value = parseTargetValue(e.target.value);
                        setPlacement({
                            ...dimension,
                            height: value
                        });
                    }}
                    onBlur={e => {
                        let value = parseTargetValue(e.target.value);
                        if (maxDimensions && maxDimensions.height && maxDimensions.height < value)
                            value = maxDimensions.height;
                        if (minDimensions && minDimensions.height && minDimensions.height > value)
                            value = minDimensions.height;
                        if (value !== dimension.height)
                            setPlacement({
                                ...dimension,
                                height: value
                            });
                    }} />
            </div>
            <div className="input-row">
                <label htmlFor="width">Width: </label>
                <input
                    type="number"
                    name="width"
                    min={minDimensions && minDimensions.width ? minDimensions.width : undefined}
                    max={maxDimensions && maxDimensions.width ? maxDimensions.width : undefined}
                    value={dimension.width}
                    onFocus={handleFocus}
                    onChange={(e) => {
                        let value = parseTargetValue(e.target.value);
                        setPlacement({
                            ...dimension,
                            width: value
                        });
                    }}
                    onBlur={e => {
                        let value = parseTargetValue(e.target.value);
                        if (maxDimensions && maxDimensions.width && maxDimensions.width < value)
                            value = maxDimensions.width;
                        if (minDimensions && minDimensions.width && minDimensions.width > value)
                            value = minDimensions.width;
                        if (value !== dimension.width)
                            setPlacement({
                                ...dimension,
                                width: value
                            });
                    }} />
            </div>
            <div className="input-row">
                <label htmlFor="depth">Depth: </label>
                <input
                    type="number"
                    name="depth"
                    min={minDimensions && minDimensions.depth ? minDimensions.depth : undefined}
                    max={maxDimensions && maxDimensions.depth ? maxDimensions.depth : undefined}
                    value={dimension.depth}
                    onFocus={handleFocus}
                    onChange={(e) => {
                        let value = parseTargetValue(e.target.value);
                        setPlacement({
                            ...dimension,
                            depth: value
                        });
                    }}
                    onBlur={e => {
                        let value = parseTargetValue(e.target.value);
                        if (maxDimensions && maxDimensions.depth && maxDimensions.depth < value)
                            value = maxDimensions.depth;
                        if (minDimensions && minDimensions.depth && minDimensions.depth > value)
                            value = minDimensions.depth;
                        if (value !== dimension.depth)
                            setPlacement({
                                ...dimension,
                                depth: value
                            });
                    }} />
            </div>
            <div className="input-row">
                <input type="submit" disabled={!dimension.width || !dimension.height || !dimension.depth} />
            </div>
            {children}
        </form>
    )
}