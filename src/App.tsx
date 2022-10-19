import type { Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';

import './App.module.css';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import Members from './views/Members';
import GuildOverview from './views/GuildOverview';

const App: Component = () => {
    return (
        <>
            <Routes>
                <Route path='/' component={Home} />
                <Route path='/dashboard/:id?' component={Dashboard}>
                    <Route path='/' element={<div>Overview</div>} />
                    <Route path='/members' component={Members} />
                </Route>
                <Route path="*" element={<div>404: Unknown route</div>} />
            </Routes>
        </>
    );
};

export default App;
