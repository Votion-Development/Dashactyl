import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';

export default () => (
    <Routes>
        <Route path={`/`} element={<Login/>}/>
    </Routes>
);