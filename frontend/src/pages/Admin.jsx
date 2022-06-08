import React from "react";

// components

import CardAddEgg from "../components/Cards/CardAddEgg";
import CardAddLocation from "../components/Cards/CardAddLocation";

export default function Admin() {
    return (
        <>
            <div className="flex flex-wrap mt-4">
                <CardAddEgg />
                <CardAddLocation />
            </div>
        </>
    );
}
