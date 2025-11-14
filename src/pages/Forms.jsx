import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../config/api';
import { Plus, Edit, Trash2, Eye, Code, Layout, X, Type, Hash, Calendar, CheckSquare, List, FileText } from 'lucide-react';
import FormBuilder from '../components/FormBuilder';

function Forms() {
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingForm, setViewingForm] = useState(null);
    const [editingForm, setEditingForm] = useState(null);
    const [formBuilderMode, setFormBuilderMode] = useState(true); // true = visual builder, false = JSON editor
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        version: '1.0',
        form_schema: {}
    });
    const queryClient = useQueryClient();

    const { data: forms, isLoading } = useQuery({
        queryKey: ['forms'],
        queryFn: async () => {
            const token = localStorage.getItem('auth_token');
            const res = await apiClient.get('/api/v1/forms/forms', {
                params: { active_only: false }
            });
            // Filter out soft-deleted forms from display
            return res.data.filter(form => !form.is_deleted);
        }
    });

    const createFormMutation = useMutation({
        mutationFn: async (formData) => {
            const token = localStorage.getItem('auth_token');
            const res = await apiClient.post('/api/v1/forms/create', formData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forms'] });
            setShowModal(false);
            resetForm();
        }
    });

    const deleteFormMutation = useMutation({
        mutationFn: async ({ formId, permanent }) => {
            const token = localStorage.getItem('auth_token');
            try {
                await apiClient.delete(`/api/v1/forms/forms/${formId}`, {
                    params: { permanent }
                });
            } catch (error) {
                const message = error.response?.data?.detail || error.message || 'Failed to delete form';
                alert(message);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Force refresh the forms list
            queryClient.invalidateQueries({ queryKey: ['forms'] });
            queryClient.refetchQueries({ queryKey: ['forms'] });
            const action = variables.permanent ? 'permanently deleted' : 'deactivated';
            alert(`Form ${action} successfully`);
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            version: '1.0',
            form_schema: {}
        });
        setEditingForm(null);
        setFormBuilderMode(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createFormMutation.mutate(formData);
    };

    const handleDelete = (formId, permanent = false) => {
        const message = permanent
            ? 'Are you sure you want to PERMANENTLY delete this form? This action cannot be undone and will fail if the form has submissions.'
            : 'Are you sure you want to deactivate this form? It will be hidden but can be restored.';

        if (window.confirm(message)) {
            deleteFormMutation.mutate({ formId, permanent });
        }
    };

    const handleViewForm = (form) => {
        setViewingForm(form);
        setShowViewModal(true);
    };

    const openModal = (form = null) => {
        if (form) {
            setEditingForm(form);
            setFormData({
                name: form.name,
                description: form.description || '',
                version: form.version || '1.0',
                form_schema: form.form_schema || {}
            });
            // If form has schema with fields, use builder mode
            setFormBuilderMode(form.form_schema?.fields ? true : true);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSchemaChange = (schema) => {
        setFormData({ ...formData, form_schema: schema });
    };

    const createDefaultPFMOForm = async () => {
        // Check if default form already exists
        const existingDefault = forms?.find(f =>
            f.name === 'PFMO Data Collection Form' && !f.is_deleted
        );

        if (existingDefault) {
            if (window.confirm('Default PFMO form already exists. Do you want to create another one?')) {
                // User wants to create another, continue
            } else {
                return;
            }
        }

        const defaultFormSchema = {
            fields: [
                // Section 1: PFMO Identification
                { name: 'pfmo_name', label: 'PFMO Name', type: 'text', required: true },
                { name: 'pfmo_phone', label: 'PFMO Phone', type: 'phone', required: true },
                {
                    name: 'geopolitical_zone', label: 'Geopolitical Zone', type: 'select', required: true,
                    options: ['North Central', 'North East', 'North West', 'South East', 'South South', 'South West']
                },
                { name: 'state', label: 'State', type: 'text', required: true },
                { name: 'lga', label: 'LGA', type: 'text', required: true },
                { name: 'federal_inec_ward', label: 'Federal INEC Ward', type: 'text' },
                { name: 'other_ward', label: 'Other Ward', type: 'text' },

                // Section 2: Health Facility Information
                { name: 'facility_name', label: 'Facility Name', type: 'text', required: true },
                { name: 'facility_uid', label: 'Facility UID', type: 'text' },
                {
                    name: 'assessment_type', label: 'Assessment Type', type: 'select',
                    options: ['Initial', 'Follow-up', 'Reassessment']
                },
                {
                    name: 'has_health_workers', label: 'Has Health Workers', type: 'select',
                    options: ['Yes', 'No']
                },
                {
                    name: 'facility_condition', label: 'Facility Condition', type: 'select',
                    options: ['Good', 'Fair', 'Poor', 'Critical']
                },
                {
                    name: 'ownership_type', label: 'Ownership Type', type: 'select',
                    options: ['Public', 'Private', 'NGO', 'Other']
                },

                // Section 3: Officer-in-Charge
                { name: 'oic_first_name', label: 'OIC First Name', type: 'text' },
                { name: 'oic_last_name', label: 'OIC Last Name', type: 'text' },
                {
                    name: 'oic_gender', label: 'OIC Gender', type: 'select',
                    options: ['Male', 'Female', 'Other']
                },
                { name: 'oic_phone', label: 'OIC Phone', type: 'phone' },
                { name: 'oic_email', label: 'OIC Email', type: 'email' },

                // GPS Coordinates
                { name: 'latitude', label: 'Latitude', type: 'number' },
                { name: 'longitude', label: 'Longitude', type: 'number' },
            ]
        };

        const defaultFormData = {
            name: 'PFMO Data Collection Form',
            description: 'Primary Healthcare Facility Data Collection Form - Complete assessment form with 12 sections including PFMO Identification, Health Facility Info, Officer-in-Charge, Funding Information, IMPACT Funding, Financial Validation, Infrastructure, Human Resources, Services & Utilization, Essential Commodities, Patient Satisfaction Survey, and Issue Escalation.',
            version: '2.0',
            form_schema: defaultFormSchema,
            is_active: true
        };

        try {
            const token = localStorage.getItem('auth_token');
            await apiClient.post('/api/v1/forms/create', defaultFormData);
            queryClient.invalidateQueries({ queryKey: ['forms'] });
            alert('Default PFMO form created successfully! It will now appear in the mobile app.');
        } catch (error) {
            const message = error.response?.data?.detail || error.message || 'Failed to create form';
            alert(`Error: ${message}`);
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Forms</h1>
                <div className="flex gap-2">
                    <button
                        onClick={createDefaultPFMOForm}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                        title="Create the default PFMO form that matches the mobile app"
                    >
                        <Plus size={20} />
                        Create Default PFMO Form
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create New Form
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading forms...</p>
                </div>
            ) : forms && forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div key={form.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{form.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Version {form.version}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${form.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {form.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {form.description && (
                                <p className="text-gray-600 text-sm mb-4">{form.description}</p>
                            )}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleViewForm(form)}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                                <button
                                    onClick={() => openModal(form)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <div className="relative group">
                                    <button
                                        onClick={() => handleDelete(form.id, false)}
                                        className="text-orange-600 hover:text-orange-800 flex items-center gap-1 text-sm"
                                    >
                                        <Trash2 size={16} />
                                        Deactivate
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        <button
                                            onClick={() => handleDelete(form.id, false)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Soft Delete (Deactivate)
                                        </button>
                                        <button
                                            onClick={() => handleDelete(form.id, true)}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Permanent Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-600">No forms found. Create your first form!</p>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingForm ? 'Edit Form' : 'Create New Form'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Form Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Version</label>
                                    <input
                                        type="text"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    rows={2}
                                />
                            </div>

                            {/* Form Builder Toggle */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-gray-700 text-sm font-bold">Form Schema</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormBuilderMode(true)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${formBuilderMode
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            <Layout size={16} />
                                            Visual Builder
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormBuilderMode(false)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${!formBuilderMode
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            <Code size={16} />
                                            JSON Editor
                                        </button>
                                    </div>
                                </div>

                                {formBuilderMode ? (
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <FormBuilder
                                            formSchema={formData.form_schema}
                                            onChange={handleSchemaChange}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Edit the JSON schema directly. Switch to Visual Builder for easier editing.
                                        </p>
                                        <textarea
                                            value={JSON.stringify(formData.form_schema, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    const value = e.target.value.trim();
                                                    if (value === '') {
                                                        setFormData({ ...formData, form_schema: {} });
                                                    } else {
                                                        setFormData({ ...formData, form_schema: JSON.parse(value) });
                                                    }
                                                } catch (err) {
                                                    // Invalid JSON, keep previous value
                                                }
                                            }}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 font-mono text-xs"
                                            rows={12}
                                            placeholder='{"fields": []}'
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={createFormMutation.isPending}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {createFormMutation.isPending ? 'Saving...' : editingForm ? 'Update Form' : 'Create Form'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Form Modal */}
            {showViewModal && viewingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Form Details</h2>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingForm(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Form Name</label>
                                        <p className="text-lg font-semibold">{viewingForm.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Version</label>
                                        <p className="text-lg">{viewingForm.version || '1.0'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                        <p className="text-gray-700">{viewingForm.description || 'No description'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <p>
                                            <span className={`px-2 py-1 text-xs rounded ${viewingForm.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {viewingForm.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Created</label>
                                        <p className="text-sm text-gray-600">
                                            {new Date(viewingForm.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Schema - Visual Preview */}
                            {viewingForm.form_schema && viewingForm.form_schema.fields && viewingForm.form_schema.fields.length > 0 ? (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Form Fields ({viewingForm.form_schema.fields.length})</h3>
                                    <div className="space-y-3">
                                        {viewingForm.form_schema.fields.map((field, index) => {
                                            const FieldTypeIcon = FIELD_TYPES.find(ft => ft.value === field.type)?.icon || Type;
                                            return (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <FieldTypeIcon size={18} className="text-gray-600" />
                                                                <span className="font-semibold">
                                                                    {field.label || field.name || `Field ${index + 1}`}
                                                                </span>
                                                                {field.required && (
                                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                <p><strong>Field ID:</strong> {field.name || 'N/A'}</p>
                                                                <p><strong>Type:</strong> {field.type || 'text'}</p>
                                                                {field.placeholder && (
                                                                    <p><strong>Placeholder:</strong> {field.placeholder}</p>
                                                                )}
                                                                {(field.type === 'select' || field.type === 'radio') && field.options && (
                                                                    <div>
                                                                        <strong>Options:</strong>
                                                                        <ul className="list-disc list-inside ml-2 mt-1">
                                                                            {field.options.map((opt, optIndex) => (
                                                                                <li key={optIndex} className="text-xs">{opt}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-lg p-4 bg-yellow-50">
                                    <p className="text-yellow-800">
                                        <strong>Note:</strong> This form doesn't have a JSON schema defined.
                                        The mobile app uses a hardcoded form structure.
                                    </p>
                                </div>
                            )}

                            {/* Raw JSON Schema */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Raw JSON Schema</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-green-400 text-xs">
                                        {JSON.stringify(viewingForm.form_schema || {}, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingForm(null);
                                    openModal(viewingForm);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                <Edit size={16} className="inline mr-2" />
                                Edit Form
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingForm(null);
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Field types for icon mapping
const FIELD_TYPES = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'email', label: 'Email', icon: Type },
    { value: 'phone', label: 'Phone', icon: Type },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'textarea', label: 'Textarea', icon: FileText },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { value: 'radio', label: 'Radio', icon: CheckSquare },
];

export default Forms;
