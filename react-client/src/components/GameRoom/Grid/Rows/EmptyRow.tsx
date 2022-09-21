import { memo } from "react";
import Cell from "../Cell";

function EmptyRow() {
    const emptycells = Array.from(Array(5));
    return (
        <div className="grid grid-cols-5 gap-1">
            {emptycells.map((_, i) => (
                <Cell key={`${i}-${(i + 1) * Math.random()}`} keypress={""} />
            ))}
        </div>
    );
}

export default memo(EmptyRow);
