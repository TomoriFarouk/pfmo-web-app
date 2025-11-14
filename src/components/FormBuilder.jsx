import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Type, Hash, Calendar, CheckSquare, List, FileText } from 'lucide-react';

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

function FormBuilder({ formSchema, onChange }) {
    const [fields, setFields] = useState(formSchema?.fields || []);
    const [editingField, setEditingField] = useState(null);

    const handleAddField = () => {
        const newField = {
            id: Date.now().toString(),
            name: '',
            label: '',
            type: 'text',
            required: false,
            placeholder: '',
            options: [], // For select/radio
        };
        setFields([...fields, newField]);
        setEditingField(newField.id);
        updateSchema([...fields, newField]);
    };

    const handleUpdateField = (id, updates) => {
        const updatedFields = fields.map(field =>
            field.id === id ? { ...field, ...updates } : field
        );
        setFields(updatedFields);
        updateSchema(updatedFields);
    };

    const handleDeleteField = (id) => {
        const updatedFields = fields.filter(field => field.id !== id);
        setFields(updatedFields);
        setEditingField(null);
        updateSchema(updatedFields);
    };

    const handleMoveField = (index, direction) => {
        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newFields.length) {
            [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
            setFields(newFields);
            updateSchema(newFields);
        }
    };

    const updateSchema = (updatedFields) => {
        const schema = {
            fields: updatedFields.map(field => ({
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required,
                placeholder: field.placeholder || undefined,
                options: field.type === 'select' || field.type === 'radio' ? field.options : undefined,
            }))
        };
        onChange(schema);
    };

    const FieldEditor = ({ field }) => {
        const FieldTypeIcon = FIELD_TYPES.find(ft => ft.value === field.type)?.icon || Type;

        return (
            <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FieldTypeIcon size={18} className="text-gray-600" />
                        <span className="font-medium">
                            {field.label || 'New Field'}
                        </span>
                        {field.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                        )}
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleMoveField(fields.indexOf(field), 'up')}
                            disabled={fields.indexOf(field) === 0}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                            title="Move up"
                        >
                            ↑
                        </button>
                        <button
                            onClick={() => handleMoveField(fields.indexOf(field), 'down')}
                            disabled={fields.indexOf(field) === fields.length - 1}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                            title="Move down"
                        >
                            ↓
                        </button>
                        <button
                            onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit"
                        >
                            {editingField === field.id ? '✕' : '✎'}
                        </button>
                        <button
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {editingField === field.id && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field Name (ID)</label>
                            <input
                                type="text"
                                value={field.name}
                                onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="e.g., facility_name"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for data storage (no spaces, lowercase)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                            <input
                                type="text"
                                value={field.label}
                                onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="e.g., Facility Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                            <select
                                value={field.type}
                                onChange={(e) => handleUpdateField(field.id, { type: e.target.value, options: [] })}
                                className="w-full border rounded px-3 py-2 text-sm"
                            >
                                {FIELD_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                            <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="Optional placeholder text"
                            />
                        </div>

                        {(field.type === 'select' || field.type === 'radio') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                                <textarea
                                    value={field.options?.join('\n') || ''}
                                    onChange={(e) => {
                                        const options = e.target.value.split('\n').filter(o => o.trim());
                                        handleUpdateField(field.id, { options });
                                    }}
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    rows={4}
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                />
                            </div>
                        )}

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`required-${field.id}`}
                                checked={field.required}
                                onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
                                Required field
                            </label>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Form Fields</h3>
                <button
                    onClick={handleAddField}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                    <Plus size={18} />
                    Add Field
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-4">No fields added yet</p>
                    <button
                        onClick={handleAddField}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add Your First Field
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <FieldEditor key={field.id} field={field} />
                    ))}
                </div>
            )}

            {fields.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Click the edit icon (✎) on any field to configure it.
                        Use the up/down arrows to reorder fields.
                    </p>
                </div>
            )}
        </div>
    );
}

export default FormBuilder;



