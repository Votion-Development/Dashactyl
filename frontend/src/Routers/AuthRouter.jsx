import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../Pages/Login';
import Register from '../Pages/Register';

export default () => (
    <main>
        <section className="relative w-full h-full py-40 min-h-screen">
            <Routes>
                <Route path={`/login`} element={<Login />} />
                <Route path={`/register`} element={<Register />} />
            </Routes>
        </section>
    </main>
);