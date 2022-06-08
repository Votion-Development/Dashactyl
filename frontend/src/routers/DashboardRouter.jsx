import React from 'react';
import { Route, Routes } from 'react-router-dom';

// components

import AdminNavbar from "../components/Navbars/AdminNavbar";
import Sidebar from "../components/Sidebar/Sidebar";
import HeaderStats from "../components/Headers/HeaderStats";
import FooterAdmin from "../components/Footers/FooterAdmin";

// views

import Dashboard from "../pages/Dashboard";
import Afk from "../pages/Afk";
import CreateServer from "../pages/CreateServer";
import Admin from "../pages/Admin";

export default () => (
    <>
        <Sidebar />
        <div className="relative md:ml-64 bg-blueGray-100">
            <AdminNavbar />
            {/* Header */}
            <HeaderStats />
            <div className="px-4 md:px-10 mx-auto w-full -m-24">
                <Routes>
                    <Route path={`/`} element={<Dashboard />} />
                    <Route path={`/afk`} element={<Afk />} />
                    <Route path={`/create`} element={<CreateServer />} />
                    <Route path={`/admin`} element={<Admin />} />
                </Routes>
                <FooterAdmin />
            </div>
        </div>
    </>
);