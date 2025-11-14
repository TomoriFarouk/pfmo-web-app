import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import apiClient from '../config/api';
import {
    Building2, DollarSign, Wrench, Users, Activity,
    Heart, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const { data: overview, isLoading: overviewLoading } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: async () => {
            const res = await apiClient.get('/api/v1/dashboard/overview');
            return res.data;
        }
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['detailed-analytics'],
        queryFn: async () => {
            const res = await apiClient.get('/api/v1/dashboard/detailed-analytics');
            return res.data;
        }
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'facilities', label: 'Facilities', icon: Building2 },
        { id: 'funding', label: 'Funding', icon: DollarSign },
        { id: 'infrastructure', label: 'Infrastructure', icon: Wrench },
        { id: 'hr', label: 'Human Resources', icon: Users },
        { id: 'services', label: 'Services', icon: Activity },
        { id: 'satisfaction', label: 'Patient Satisfaction', icon: Heart },
    ];

    if (overviewLoading || analyticsLoading) {
        return (
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
                {analytics?.summary && (
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-green-600" size={20} />
                            <span>Data Completeness: {analytics.summary.data_completeness_percentage}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 transition-colors">
                <div className="flex border-b overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h3 className="text-gray-600 dark:text-gray-400 mb-2">Total Submissions</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{overview?.total_submissions || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h3 className="text-gray-600 dark:text-gray-400 mb-2">Synced</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{overview?.synced_submissions || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h3 className="text-gray-600 dark:text-gray-400 mb-2">Pending</h3>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{overview?.pending_submissions || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h3 className="text-gray-600 dark:text-gray-400 mb-2">Sync Rate</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview?.synced_percentage || 0}%</p>
                        </div>
                    </div>

                    {/* Quick Stats from Analytics */}
                    {analytics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-lg shadow transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-700 dark:text-gray-300 font-semibold">Total Facilities</h3>
                                    <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analytics.summary.total_facilities}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-lg shadow transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-700 dark:text-gray-300 font-semibold">Total Staff</h3>
                                    <Users className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.human_resources_analysis.total_staff}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-lg shadow transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-gray-700 dark:text-gray-300 font-semibold">Total Patients</h3>
                                    <Activity className="text-purple-600 dark:text-purple-400" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {analytics.services_utilization.total_patients.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Submissions by State</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={overview?.submissions_by_state || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Submissions Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={overview?.submissions_over_time || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* Facilities Tab */}
            {activeTab === 'facilities' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Facility Condition Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analytics.facility_analysis.condition_distribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ condition, percentage }) => `${condition}: ${percentage}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {analytics.facility_analysis.condition_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Ownership Type Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.facility_analysis.ownership_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Health Workers Status</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={analytics.facility_analysis.health_workers_distribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ status, percentage }) => `${status}: ${percentage}%`}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {analytics.facility_analysis.health_workers_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Geopolitical Zone Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={analytics.facility_analysis.geopolitical_zone_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="zone" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#FF8042" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Funding Tab */}
            {activeTab === 'funding' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">BHCPF Facilities</h3>
                            <p className="text-3xl font-bold text-blue-600">{analytics.funding_analysis.bhcpf_facilities}</p>
                            <p className="text-sm text-gray-500 mt-1">{analytics.funding_analysis.bhcpf_percentage}% of total</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">IMPACT Facilities</h3>
                            <p className="text-3xl font-bold text-green-600">{analytics.funding_analysis.impact_facilities}</p>
                            <p className="text-sm text-gray-500 mt-1">{analytics.funding_analysis.impact_percentage}% of total</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Total Funding</h3>
                            <p className="text-3xl font-bold text-purple-600">
                                ₦{analytics.funding_analysis.total_funding_amount.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Avg per Facility</h3>
                            <p className="text-3xl font-bold text-orange-600">
                                ₦{analytics.funding_analysis.average_funding_per_facility.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {analytics.funding_analysis.funding_by_state.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Funding by State (Top 10)</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={analytics.funding_analysis.funding_by_state} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="state" type="category" width={100} />
                                    <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                                    <Bar dataKey="amount" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Infrastructure Tab */}
            {activeTab === 'infrastructure' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { key: 'power', label: 'Power', value: analytics.infrastructure_analysis.facilities_with_power, percentage: analytics.infrastructure_analysis.power_percentage },
                            { key: 'water', label: 'Water', value: analytics.infrastructure_analysis.facilities_with_water, percentage: analytics.infrastructure_analysis.water_percentage },
                            { key: 'internet', label: 'Internet', value: analytics.infrastructure_analysis.facilities_with_internet, percentage: analytics.infrastructure_analysis.internet_percentage },
                            { key: 'pharmacy', label: 'Pharmacy', value: analytics.infrastructure_analysis.facilities_with_pharmacy, percentage: analytics.infrastructure_analysis.pharmacy_percentage },
                            { key: 'revitalized', label: 'Revitalized', value: analytics.infrastructure_analysis.revitalized_facilities, percentage: analytics.infrastructure_analysis.revitalization_percentage },
                        ].map((item) => (
                            <div key={item.key} className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-gray-600 mb-2">{item.label}</h3>
                                <p className="text-3xl font-bold">{item.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{item.percentage}% of facilities</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4">Infrastructure Coverage</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[
                                { name: 'Power', value: analytics.infrastructure_analysis.power_percentage },
                                { name: 'Water', value: analytics.infrastructure_analysis.water_percentage },
                                { name: 'Internet', value: analytics.infrastructure_analysis.internet_percentage },
                                { name: 'Pharmacy', value: analytics.infrastructure_analysis.pharmacy_percentage },
                                { name: 'Revitalized', value: analytics.infrastructure_analysis.revitalization_percentage },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Bar dataKey="value" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Human Resources Tab */}
            {activeTab === 'hr' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Total Staff</h3>
                            <p className="text-3xl font-bold text-blue-600">{analytics.human_resources_analysis.total_staff}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Facilities with Staff</h3>
                            <p className="text-3xl font-bold text-green-600">{analytics.human_resources_analysis.facilities_with_staff}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Avg Staff per Facility</h3>
                            <p className="text-3xl font-bold text-purple-600">
                                {analytics.human_resources_analysis.average_staff_per_facility.toFixed(1)}
                            </p>
                        </div>
                    </div>

                    {analytics.human_resources_analysis.staff_by_type.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Staff by Type (Top 10)</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={analytics.human_resources_analysis.staff_by_type}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Total Patients</h3>
                            <p className="text-3xl font-bold text-blue-600">
                                {analytics.services_utilization.total_patients.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Avg Patients per Facility</h3>
                            <p className="text-3xl font-bold text-green-600">
                                {analytics.services_utilization.average_patients_per_facility.toFixed(0)}
                            </p>
                        </div>
                    </div>

                    {analytics.services_utilization.top_services_offered.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Top Services Offered</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={analytics.services_utilization.top_services_offered} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="service" type="category" width={150} />
                                    <Tooltip formatter={(value) => `${value} facilities`} />
                                    <Bar dataKey="facilities" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Patient Satisfaction Tab */}
            {activeTab === 'satisfaction' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Average Satisfaction Score</h3>
                            <p className="text-3xl font-bold text-blue-600">
                                {analytics.patient_satisfaction.average_score.toFixed(1)} / 5.0
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Based on {analytics.patient_satisfaction.total_responses} responses
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-gray-600 mb-2">Total Responses</h3>
                            <p className="text-3xl font-bold text-green-600">
                                {analytics.patient_satisfaction.total_responses}
                            </p>
                        </div>
                    </div>

                    {Object.keys(analytics.patient_satisfaction.scores_by_category).length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4">Satisfaction by Category</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(analytics.patient_satisfaction.scores_by_category).map(([category, data]) => (
                                    <div key={category} className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold mb-2">{category}</h4>
                                        <p className="text-2xl font-bold text-blue-600">{data.average.toFixed(1)}</p>
                                        <p className="text-sm text-gray-500">{data.count} responses</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
