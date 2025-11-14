import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import {
    LayoutDashboard,
    FileText,
    Users,
    ClipboardList,
    LogOut,
    User,
    Brain,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    const res = await apiClient.get('/api/v1/auth/me');
                    setCurrentUser(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ClipboardList, label: 'Submissions', path: '/submissions' },
        { icon: FileText, label: 'Forms', path: '/forms' },
        { icon: Users, label: 'Users', path: '/users' },
        { icon: Brain, label: 'AI Insights', path: '/ai-insights' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
            {/* Sidebar */}
            <div className="bg-white dark:bg-gray-800 w-64 shadow-lg flex flex-col transition-colors">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">PFMO Admin</h1>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Theme toggle clicked, current theme:', theme);
                                toggleTheme();
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                            type="button"
                        >
                            {theme === 'light' ? (
                                <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Sun size={20} className="text-yellow-500" />
                            )}
                        </button>
                    </div>
                    {currentUser && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center gap-2">
                            <User size={16} className="text-blue-600 dark:text-blue-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {currentUser.full_name || currentUser.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {currentUser.role}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="mt-8">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-6 py-3 transition-colors ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon size={20} className="mr-3" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-64 p-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 transition-colors">
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;

