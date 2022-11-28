import type { Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';

import './App.module.css';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import Members from './views/Members';
import Schedule from './views/Schedule';
import Setup from './views/Setup';
import Settings from './views/Settings';

const App: Component = () => {
    return (
        <>
            <Routes>
                <Route path='/' component={Home} />
                <Route path='/dashboard/:id?' component={Dashboard}>
                    <Route path='/' element={<div>Overview</div>} />
                    <Route path='/members' component={Members} />
                    <Route path='/schedule' component={Schedule} />
                    <Route path='/setup' component={Setup} />
                    <Route path='/settings' component={Settings} />
                </Route>
                <Route path="*" element={<div>404: Unknown route</div>} />
            </Routes>
        </>
    );
};

export default App;
