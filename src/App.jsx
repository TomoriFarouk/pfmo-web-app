import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Submissions from './pages/Submissions';
import Forms from './pages/Forms';
import Users from './pages/Users';
import AIInsights from './pages/AIInsights';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/submissions" element={<Submissions />} />
                    <Route path="/forms" element={<Forms />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

