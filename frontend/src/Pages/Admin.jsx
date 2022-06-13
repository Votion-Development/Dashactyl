import React from "react";

// components

import CardAddEgg from "../Components/Cards/CardAddEgg";
import CardAddLocation from "../Components/Cards/CardAddLocation";
import CardUpdateLocationStatus from "../Components/Cards/CardUpdateLocationStatus";
import CardAddPackage from "../Components/Cards/CardAddPackage";

export default function Admin() {
    return (
        <>
            <div className="flex flex-wrap mt-4">
                <CardAddEgg />
                <CardAddLocation />
                <CardUpdateLocationStatus />
                <CardAddPackage />
            </div>
        </>
    );
}
