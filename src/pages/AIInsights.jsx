import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../config/api';
import { Brain, AlertTriangle, TrendingUp, Lightbulb, FileText, Search } from 'lucide-react';

function AIInsights() {
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [searchText, setSearchText] = useState('');

    const { data: atRiskFacilities, isLoading: atRiskLoading } = useQuery({
        queryKey: ['at-risk-facilities'],
        queryFn: async () => {
            const token = localStorage.getItem('auth_token');
            const res = await apiClient.get('/api/v1/ai/facilities/at-risk');
            return res.data;
        }
    });

    const { data: recommendations, isLoading: recLoading } = useQuery({
        queryKey: ['ai-recommendations'],
        queryFn: async () => {
            const token = localStorage.getItem('auth_token');
            const res = await apiClient.get('/api/v1/ai/recommendations');
            return res.data;
        }
    });

    const { data: submissionInsights, isLoading: insightsLoading } = useQuery({
        queryKey: ['submission-insights', selectedSubmission],
        queryFn: async () => {
            if (!selectedSubmission) return null;
            const token = localStorage.getItem('auth_token');
            const res = await apiClient.get(`/api/v1/ai/submission/${selectedSubmission}/insights`);
            return res.data;
        },
        enabled: !!selectedSubmission
    });

    const handleAnalyzeText = async () => {
        if (!searchText.trim()) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await apiClient.post('/api/v1/ai/analyze-text', { text: searchText });
            const analysis = res.data;
            alert(`Text Analysis Results:\n\nSentiment: ${analysis.sentiment}\nPriority: ${analysis.priority}\nTopics: ${analysis.topics.join(', ')}\n\nSummary: ${analysis.summary}`);
        } catch (error) {
            alert('Error analyzing text: ' + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="flex items-center gap-3 mb-6">
                <Brain className="text-purple-600" size={32} />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Insights & Analytics</h1>
            </div>

            {/* Text Analysis Tool */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Search size={20} />
                    Text Analysis Tool
                </h2>
                <div className="flex gap-2">
                    <textarea
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Enter text to analyze (issues, comments, feedback)..."
                        className="flex-1 border rounded px-3 py-2"
                        rows={3}
                    />
                    <button
                        onClick={handleAnalyzeText}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
                    >
                        Analyze
                    </button>
                </div>
            </div>

            {/* At-Risk Facilities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertTriangle className="text-red-600" size={20} />
                        At-Risk Facilities
                    </h2>
                    {atRiskFacilities && (
                        <span className="text-2xl font-bold text-red-600">
                            {atRiskFacilities.total_at_risk}
                        </span>
                    )}
                </div>

                {atRiskLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                ) : atRiskFacilities && atRiskFacilities.facilities.length > 0 ? (
                    <div className="space-y-3">
                        {atRiskFacilities.facilities.slice(0, 10).map((facility) => (
                            <div
                                key={facility.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedSubmission(facility.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{facility.facility_name}</h3>
                                        <p className="text-sm text-gray-600">{facility.state} - {facility.lga}</p>
                                        <p className="text-sm mt-2">
                                            Condition: <span className="font-medium">{facility.condition}</span>
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded text-sm ${facility.priority === 'high'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {facility.priority.toUpperCase()} PRIORITY
                                    </span>
                                </div>
                                {facility.risk_factors.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium">Risk Factors:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                            {facility.risk_factors.map((factor, idx) => (
                                                <li key={idx}>{factor}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No at-risk facilities identified</p>
                )}
            </div>

            {/* AI Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="text-yellow-600" size={20} />
                    AI Recommendations
                </h2>

                {recLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                ) : recommendations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(recommendations).map(([category, items]) => (
                            <div key={category} className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3 capitalize">{category}</h3>
                                {items.length > 0 ? (
                                    <ul className="space-y-2">
                                        {items.slice(0, 5).map((item, idx) => (
                                            <li key={idx} className="text-sm">
                                                <span className="font-medium">{item.facility}:</span> {item.recommendation}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No recommendations in this category</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            {/* Submission Insights Modal */}
            {selectedSubmission && submissionInsights && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">AI Insights: {submissionInsights.facility_name}</h2>

                        <div className="space-y-4">
                            {/* Issues Analysis */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Issues & Comments Analysis</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Sentiment:</strong>
                                        <span className={`ml-2 px-2 py-1 rounded ${submissionInsights.ai_analysis.issues_analysis.sentiment === 'negative'
                                            ? 'bg-red-100 text-red-800'
                                            : submissionInsights.ai_analysis.issues_analysis.sentiment === 'positive'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {submissionInsights.ai_analysis.issues_analysis.sentiment}
                                        </span>
                                    </p>
                                    <p><strong>Priority:</strong> {submissionInsights.ai_analysis.issues_analysis.priority}</p>
                                    <p><strong>Topics:</strong> {submissionInsights.ai_analysis.issues_analysis.topics.join(', ')}</p>
                                    {submissionInsights.ai_analysis.issues_analysis.insights.map((insight, idx) => (
                                        <p key={idx} className="text-gray-600">• {insight}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Predictions */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Predictions & Needs</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Priority Level:</strong> {submissionInsights.ai_analysis.predictions.priority_level}</p>
                                    {submissionInsights.ai_analysis.predictions.predicted_needs.length > 0 && (
                                        <div>
                                            <strong>Predicted Needs:</strong>
                                            <ul className="list-disc list-inside ml-2">
                                                {submissionInsights.ai_analysis.predictions.predicted_needs.map((need, idx) => (
                                                    <li key={idx}>{need}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {submissionInsights.ai_analysis.predictions.recommendations.length > 0 && (
                                        <div>
                                            <strong>Recommendations:</strong>
                                            <ul className="list-disc list-inside ml-2">
                                                {submissionInsights.ai_analysis.predictions.recommendations.map((rec, idx) => (
                                                    <li key={idx}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Anomalies */}
                            {submissionInsights.ai_analysis.anomalies.length > 0 && (
                                <div className="border rounded-lg p-4 bg-yellow-50">
                                    <h3 className="font-semibold mb-2 text-yellow-800">Data Quality Issues</h3>
                                    <ul className="space-y-1 text-sm">
                                        {submissionInsights.ai_analysis.anomalies.map((anomaly, idx) => (
                                            <li key={idx} className="text-yellow-700">
                                                • {anomaly.message} ({anomaly.severity})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="border rounded-lg p-4 bg-blue-50">
                                <h3 className="font-semibold mb-2">AI Summary</h3>
                                <p className="text-sm text-gray-700">
                                    {submissionInsights.ai_analysis.summary}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedSubmission(null)}
                            className="mt-6 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIInsights;

