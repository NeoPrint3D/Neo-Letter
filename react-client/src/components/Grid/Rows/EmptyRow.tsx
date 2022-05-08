import React from "react";
import Cell from "../Cell";

export function EmptyRow() {
    const emptycells = Array.from(Array(5));
    return (
        <div className="grid grid-cols-5 gap-1">
            {emptycells.map((_, i) => (
                <Cell key={i} keypress={""} />
            ))}
        </div>
    );
}
