import React, { useState } from "react";
import { PlacementObject, DimensionObject } from "shared/store/planogram/planogram.types";
import { ItemDefualtPlacement } from "shared/store/planogram/planogram.defaults";

type PlacementModalProps = {
    dimensions: DimensionObject,
    maxDimensions: DimensionObject,
    minDimensions?: DimensionObject,
    title?: string,
    subtitle?: string,
    init: PlacementObject,
    onSubmit: (placement: PlacementObject) => void
};

const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

export const ItemPlacementModal: React.FC<PlacementModalProps> = ({ init, onSubmit, maxDimensions, minDimensions, dimensions, title, subtitle }) => {
    const [placement, setPlacement] = useState<PlacementObject>({
        ...ItemDefualtPlacement,
        ...init
    });

    console.log('ItemPlacementModal initial placement', placement);

    const [error] = useState<string | null>(null);
    const { height: maxHeight, width: maxWidth, depth: maxDepth } = maxDimensions;

    const { height: productHeight, width: productWidth, depth: productDepth } = dimensions;
    return (
        <form
            onSubmit={(e) => {
                e.stopPropagation();
                console.log('onSubmit placement',placement);
                onSubmit(placement);
            }}
            onClick={(e) => e.stopPropagation()}>
            <div className="context-title">{title || "Placement"}</div>
            {subtitle != null ? <div className="context-subtitle">{subtitle}</div> : null}
            {error != null ? <div style={{ background: "#e74c3c", padding: "0.2em" }}>
                {error}
            </div> : ""}
            <div className="input-row">
                <label htmlFor="faces">Faces: </label>
                <input
                    autoFocus
                    type="number"
                    name="faces"
                    tabIndex={1}
                    min={1}
                    value={placement.faces}
                    onFocus={handleFocus}
                    onChange={(e) => {
                        let value = !e.target.value ? 1 : parseInt(e.target.value);
                        if (value * productWidth > maxWidth) {
                            value = Math.floor(maxWidth / productWidth);
                            // setError("Reached shelf width limit.");
                        }
                        // else setError(null);
                        setPlacement({
                            ...placement,
                            faces: value || 1
                        });
                    }} />
            </div>
            <div className="input-row">
                <label htmlFor="row">Row: </label>
                <input
                    type="number"
                    name="row"
                    tabIndex={2}
                    min={1}
                    value={placement.row}
                    onFocus={handleFocus}
                    onChange={(e) => {
                        let value = !e.target.value ? 1 : parseInt(e.target.value);
                        if (value * productDepth > maxDepth) {
                            value = Math.floor(maxDepth / productDepth);
                            // setError("Reached shelf depth limit.");
                        }
                        // else setError(null);
                        setPlacement({
                            ...placement,
                            row: value || 1
                        });
                    }} />
                <label htmlFor="row">Manual Only: </label>
                <input
                    type="checkbox"
                    name="manual_row_only"
                    tabIndex={3}
                    checked={Boolean(placement.manual_row_only)}
                    onFocus={handleFocus}
                    onChange={(e) => {
                        console.log('Manual Only init',e.target.checked);
                        let value = !e.target.checked ? 0 : 1;
                        console.log('Manual Only',value);
                        setPlacement({
                            ...placement,
                            manual_row_only: value
                        });
                    }} />    
            </div>
            <div className="input-row">
                <label htmlFor="stack">Stack: </label>
                <input
                    type="number"
                    name="stack"
                    tabIndex={4}
                    min={1}
                    value={placement.stack}
                    onFocus={handleFocus}
                    onChange={(e) => {
                        let value = !e.target.value ? 1 : parseInt(e.target.value);
                        if (value * productHeight > maxHeight) {
                            value = Math.floor(maxHeight / productHeight);
                            // setError("Reached shelf height limit.");
                        }
                        // else setError(null);
                        setPlacement({
                            ...placement,
                            stack: value || 1
                        });
                    }} />
            </div>
            <div className="input-row">
                <input type="submit" value="Submit" tabIndex={5} disabled={error != null} />
            </div>
        </form>
    )
}