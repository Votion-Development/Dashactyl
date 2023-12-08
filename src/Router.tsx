import { Routes, Route } from "react-router-dom";

export default function Router() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={<>Home</>} />

                <Route path="*" element={<>404</>} />
            </Route>
        </Routes>
    )
}