import type { Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';

import './App.module.css';
import Home from './views/Home';
import Dashboard from './views/Dashboard';

const App: Component = () => {
    return (
        <>
            <Routes>
                <Route path='/' component={Home} />
                <Route path='/dashboard' component={Dashboard} />
                <Route path="*" element={<div>404: Unknown route</div>}/>
            </Routes>
        </>
    );
};

export default App;
