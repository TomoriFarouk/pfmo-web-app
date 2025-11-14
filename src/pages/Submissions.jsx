import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, Download, Filter } from 'lucide-react';

function Submissions() {
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [filters, setFilters] = useState({
        state: '',
        lga: '',
        syncStatus: ''
    });

    const { data: submissions, isLoading, error } = useQuery({
        queryKey: ['submissions', filters],
        queryFn: async () => {
            const token = localStorage.getItem('auth_token');
            const params = {};
            if (filters.state) params.state = filters.state;
            if (filters.lga) params.lga = filters.lga;
            if (filters.syncStatus) params.sync_status = filters.syncStatus;

            const res = await axios.get('/api/v1/submissions/submissions', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            return res.data;
        }
    });

    const handleExport = () => {
        // TODO: Implement CSV export
        alert('Export functionality coming soon!');
    };

    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
    };

    // Get unique states and LGAs for filters
    const states = [...new Set(submissions?.map(s => s.state).filter(Boolean) || [])].sort();
    const lgas = [...new Set(submissions?.map(s => s.lga).filter(Boolean) || [])].sort();

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Submissions</h1>
                <button
                    onClick={handleExport}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Download size={20} />
                    Export Data
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} />
                    <h3 className="font-semibold">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                            value={filters.state}
                            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All States</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                        <select
                            value={filters.lga}
                            onChange={(e) => setFilters({ ...filters, lga: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All LGAs</option>
                            {lgas.map(lga => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sync Status</label>
                        <select
                            value={filters.syncStatus}
                            onChange={(e) => setFilters({ ...filters, syncStatus: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All Statuses</option>
                            <option value="synced">Synced</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading submissions...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Error loading submissions. Please try again.
                </div>
            ) : submissions && submissions.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facility</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LGA</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{submission.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{submission.facility_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{submission.state}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{submission.lga}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded ${submission.sync_status === 'synced'
                                                ? 'bg-green-100 text-green-800'
                                                : submission.sync_status === 'pending'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {submission.sync_status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(submission.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewDetails(submission)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-600">No submissions found.</p>
                </div>
            )}

            {/* Submission Details Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Submission Details</h2>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">ID</label>
                                <p className="text-lg">{selectedSubmission.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Facility Name</label>
                                <p className="text-lg">{selectedSubmission.facility_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">State</label>
                                <p>{selectedSubmission.state}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">LGA</label>
                                <p>{selectedSubmission.lga}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Sync Status</label>
                                <p>
                                    <span className={`px-2 py-1 text-xs rounded ${selectedSubmission.sync_status === 'synced'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {selectedSubmission.sync_status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Created At</label>
                                <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                            </div>
                            {selectedSubmission.latitude && (
                                <>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Latitude</label>
                                        <p>{selectedSubmission.latitude}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Longitude</label>
                                        <p>{selectedSubmission.longitude}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {selectedSubmission.form_data && (
                            <div className="mt-6">
                                <label className="text-sm font-semibold text-gray-600">Form Data</label>
                                <pre className="bg-gray-50 p-4 rounded mt-2 overflow-x-auto text-xs">
                                    {JSON.stringify(selectedSubmission.form_data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Submissions;
