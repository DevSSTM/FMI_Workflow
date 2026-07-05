import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, GripVertical, FileText, Upload, Clock, Check } from 'lucide-react';
import { useWorkflowStore } from '../../app/store/workflowStore';
import { useDocumentStore } from '../../app/store/documentStore';
import { useAuthStore } from '../../app/store/authStore';
import { useUserStore } from '../../app/store/userStore';
import { Modal, Button, Input, TextArea } from '../../components/ui';
import useToast from '../../hooks/useToast.jsx';

const CreateWorkflowModal = ({ isOpen, onClose }) => {
  const createStep = (id, order) => ({
    id,
    name: '',
    assignedTo: '',
    order,
    documents: [],
    portalEnabled: false,
    directUploadEnabled: false,
    portalDeadline: '',
  });
  const [steps, setSteps] = useState([
    createStep('step1', 1),
  ]);
  const [expandedStepIndex, setExpandedStepIndex] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const { createWorkflow, isLoading } = useWorkflowStore();
  const { uploadDocument } = useDocumentStore();
  const { user } = useAuthStore();
  const { users, fetchUsers } = useUserStore();
  const { showWarning, showError, ToastComponent } = useToast();
  const canManagePortal = ['admin', 'manager'].includes(user?.role);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      departments: '',
    },
  });

  const departments = ['Finance', 'HR', 'IT', 'Operations', 'Procurement', 'Marketing', 'Sales'];
  const teamMembers = users
    .filter(u => u.isActive)
    .map(u => ({ value: u.id, label: u.name }));

  const addStep = () => {
    setSteps([
      ...steps,
      createStep(`step${Date.now()}`, steps.length + 1),
    ]);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
      if (expandedStepIndex === index) setExpandedStepIndex(null);
    }
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const toggleStepExpand = (index) => {
    setExpandedStepIndex(expandedStepIndex === index ? null : index);
  };

  const addDocumentToStep = (stepIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].documents.push({
      id: `doc-${Date.now()}`,
      name: '',
      description: '',
      category: 'other',
      file: null,
      submittedAt: new Date().toISOString(),
    });
    setSteps(newSteps);
  };

  const removeDocumentFromStep = (stepIndex, docIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].documents = newSteps[stepIndex].documents.filter((_, i) => i !== docIndex);
    setSteps(newSteps);
  };

  const updateDocument = (stepIndex, docIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].documents[docIndex] = {
      ...newSteps[stepIndex].documents[docIndex],
      [field]: value,
    };
    setSteps(newSteps);
  };

  const toggleDepartment = (dept) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  const removeDepartment = (dept) => {
    setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
  };

  const onSubmit = async (data) => {
    const validSteps = steps.filter((step) => step.name.trim());

    if (validSteps.length === 0) {
      showWarning('Please add at least one step.');
      return;
    }

    if (selectedDepartments.length === 0) {
      showWarning('Please select at least one department.');
      return;
    }

    // Create workflow first
    const workflowData = {
      ...data,
      departments: selectedDepartments,
      department: selectedDepartments[0], // Keep backward compatibility
      status: 'pending',
      createdBy: user?.id,
      steps: validSteps.map((step, index) => ({
        id: step.id,
        name: step.name,
        status: 'pending',
        assignedTo: step.assignedTo,
        order: index + 1,
        portalEnabled: step.portalEnabled,
        directUploadEnabled: step.directUploadEnabled,
        portalDeadline: step.portalDeadline,
      })),
    };

    const result = await createWorkflow(workflowData);
    if (result.success) {
      // Now upload documents for each step
      const workflowId = result.data.id;
      for (const step of validSteps) {
        const originalStep = steps.find(s => s.id === step.id);
        if (originalStep?.documents) {
          for (const doc of originalStep.documents) {
            if (doc.file || doc.name.trim()) {
              await uploadDocument({
                name: doc.name,
                description: doc.description,
                category: doc.category,
                file: doc.file,
                type: doc.file?.type || 'application/octet-stream',
                originalFileName: doc.file?.name || doc.name,
                workflowId,
                workflowName: data.name,
                stepId: step.id,
                stepName: step.name,
                uploadedBy: user?.id,
                uploadedByName: user?.name,
                content: doc.file ? undefined : `Document submitted on ${new Date(doc.submittedAt).toLocaleString()}`,
              });
            }
          }
        }
      }

      reset();
      setSteps([createStep('step1', 1)]);
      setExpandedStepIndex(null);
      setSelectedDepartments([]);
      onClose();
    } else {
      showError(result.error || 'Failed to create workflow.');
    }
  };

  const formatSubmissionTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workflow" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Workflow Name"
          placeholder="Enter workflow name"
          error={errors.name?.message}
          {...register('name', { required: 'Workflow name is required' })}
        />

        <TextArea
          label="Description"
          placeholder="Describe the workflow purpose"
          rows={3}
          {...register('description')}
        />

        {/* Multi-Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Departments <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {selectedDepartments.length === 0 ? (
                <span className="text-gray-500">Select departments...</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedDepartments.map((dept) => (
                    <span key={dept} className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-100 dark:bg-navy-900/30 text-navy-800 dark:text-navy-400 rounded text-xs font-medium">
                      {dept}
                      <X size={12} onClick={(e) => { e.stopPropagation(); removeDepartment(dept); }} className="cursor-pointer hover:text-red-600" />
                    </span>
                  ))}
                </div>
              )}
            </button>

            {showDepartmentDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {departments.map((dept) => {
                  const isSelected = selectedDepartments.includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDepartment(dept)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-navy-50 dark:bg-navy-900/20' : ''
                      }`}
                    >
                      <span className="text-gray-900 dark:text-gray-100">{dept}</span>
                      {isSelected && <Check size={16} className="text-navy-700" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {selectedDepartments.length > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {selectedDepartments.length} department{selectedDepartments.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Workflow Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Workflow Steps
            </label>
            <Button type="button" variant="secondary" size="sm" onClick={addStep}>
              <Plus size={16} className="mr-1" /> Add Step
            </Button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const isExpanded = expandedStepIndex === index;
              const docCount = step.documents?.length || 0;
              
              return (
                <div
                  key={step.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Step Header */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={() => toggleStepExpand(index)}
                      className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-navy-100 dark:bg-navy-900/30 text-navy-700 dark:text-navy-400 flex items-center justify-center text-xs font-medium hover:bg-navy-200 dark:hover:bg-navy-900/50 transition-colors"
                    >
                      {index + 1}
                    </button>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Step name"
                          value={step.name}
                          onChange={(e) => updateStep(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
                        />
                        {docCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-navy-700 dark:text-navy-400 bg-navy-50 dark:bg-navy-900/20 px-2 py-1 rounded">
                            <FileText size={12} />
                            {docCount} document{docCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {step.portalEnabled && (
                          <span className="flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                            Portal
                          </span>
                        )}
                        {step.directUploadEnabled && (
                          <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            Upload
                          </span>
                        )}
                      </div>
                      <select
                        value={step.assignedTo}
                        onChange={(e) => updateStep(index, 'assignedTo', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
                      >
                        <option value="">Assign to...</option>
                        {teamMembers.map((member) => (
                          <option key={member.value} value={member.value}>
                            {member.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleStepExpand(index)}
                        className="p-1 text-gray-500 hover:text-navy-700 transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand to add documents'}
                      >
                        <GripVertical size={16} className={isExpanded ? 'rotate-90' : ''} />
                      </button>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Step Content - Document Upload Portal */}
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Document Portal</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Set whether this step accepts deadline-based portal submissions, direct uploads, or both.
                            </p>
                          </div>
                          {!canManagePortal && (
                            <span className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                              Admin/Manager only
                            </span>
                          )}
                        </div>

                        <label className={`flex items-center gap-3 text-sm ${canManagePortal ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                          <input
                            type="checkbox"
                            checked={step.portalEnabled}
                            disabled={!canManagePortal}
                            onChange={(e) => updateStep(index, 'portalEnabled', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-navy-700 focus:ring-navy-600"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Create upload portal for this step</span>
                        </label>

                        <label className={`flex items-center gap-3 text-sm ${canManagePortal ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                          <input
                            type="checkbox"
                            checked={step.directUploadEnabled}
                            disabled={!canManagePortal}
                            onChange={(e) => updateStep(index, 'directUploadEnabled', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-navy-700 focus:ring-navy-600"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Allow direct uploads in workflow detail</span>
                        </label>

                        {step.portalEnabled && (
                          <Input
                            label="Portal Deadline"
                            type="datetime-local"
                            value={step.portalDeadline || ''}
                            onChange={(e) => updateStep(index, 'portalDeadline', e.target.value)}
                            disabled={!canManagePortal}
                            helperText="Users can submit through the portal until this date and time."
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Upload size={14} className="text-navy-700" />
                          Starter Documents
                        </h4>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => addDocumentToStep(index)}
                        >
                          <Plus size={14} className="mr-1" />
                          Add Document
                        </Button>
                      </div>

                      {docCount === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <FileText size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No starter documents for this step</p>
                          <p className="text-xs mt-1">Click "Add Document" if you want to attach files during workflow setup</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {step.documents.map((doc, docIndex) => (
                            <div
                              key={doc.id}
                              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              {/* Document Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <FileText size={16} className="text-navy-700" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Document {docIndex + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock size={12} />
                                  <span>Submitted: {formatSubmissionTime(doc.submittedAt)}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDocumentFromStep(index, docIndex)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {/* Document Fields */}
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    updateDocument(index, docIndex, 'file', file);
                                    if (file && !doc.name.trim()) {
                                      updateDocument(index, docIndex, 'name', file.name);
                                    }
                                  }}
                                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
                                />
                                {doc.file && (
                                  <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                                    Selected file: {doc.file.name} ({Math.max(1, Math.round(doc.file.size / 1024))} KB)
                                  </div>
                                )}
                                <input
                                  type="text"
                                  placeholder="Document name (e.g., Report.pdf)"
                                  value={doc.name}
                                  onChange={(e) => updateDocument(index, docIndex, 'name', e.target.value)}
                                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
                                />
                                <input
                                  type="text"
                                  placeholder="Brief description (optional)"
                                  value={doc.description}
                                  onChange={(e) => updateDocument(index, docIndex, 'description', e.target.value)}
                                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
                                />
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                                  <Clock size={14} className="text-gray-500" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {formatSubmissionTime(doc.submittedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Workflow
          </Button>
        </div>
      </form>
      {ToastComponent}
    </Modal>
  );
};

export default CreateWorkflowModal;
