import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Circle, Upload, FileText, Download, Eye, Trash2, Edit, Copy } from 'lucide-react';
import { useWorkflowStore } from '../../app/store/workflowStore';
import { useDocumentStore } from '../../app/store/documentStore';
import { useAuthStore } from '../../app/store/authStore';
import { notificationApi } from '../../services/api';
import { Card, Badge, Button, Modal, Input, TextArea, ConfirmDialog } from '../../components/ui';
import { getStatusColor, getStatusLabel, calculateWorkflowProgress, formatDateTime } from '../../utils/helpers';
import EditWorkflowModal from './EditWorkflowModal';
import useToast from '../../hooks/useToast.jsx';

const StepDocumentModal = ({
  isOpen,
  onClose,
  workflowId,
  stepId,
  stepName,
  portalEnabled,
  directUploadEnabled,
  portalDeadline,
  canManagePortal,
  onDocumentAdded,
}) => {
  const { uploadDocument } = useDocumentStore();
  const { user } = useAuthStore();
  const { showSuccess, showError, showWarning, ToastComponent } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name.trim() ? prev.name : file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const portalExpired = portalEnabled && portalDeadline && new Date(portalDeadline) < new Date();

    if (!canManagePortal && !portalEnabled && !directUploadEnabled) {
      showWarning('This step does not currently accept document submissions.');
      return;
    }

    if (!canManagePortal && portalExpired) {
      showWarning('The upload portal deadline for this step has passed.');
      return;
    }

    if (!selectedFile) {
      showWarning('Please select a document file to upload.');
      return;
    }

    if (!formData.name.trim()) {
      showWarning('Document name is required.');
      return;
    }

    const docData = {
      ...formData,
      type: selectedFile.type || 'application/octet-stream',
      file: selectedFile,
      originalFileName: selectedFile.name,
      uploadedBy: user?.id,
      uploadedByName: user?.name,
      workflowId,
      workflowName: '',
      stepId,
      stepName,
    };

    const result = await uploadDocument(docData);
    if (result.success) {
      showSuccess(`Document "${formData.name.trim()}" uploaded successfully.`);
      setFormData({ name: '', description: '', category: 'other' });
      setSelectedFile(null);
      onDocumentAdded?.(result.data);
      onClose();
    } else {
      showError(result.error || 'Failed to upload document.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Upload Document to: ${stepName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(portalEnabled || directUploadEnabled) && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {portalEnabled && (
                <span className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                  Portal Enabled
                </span>
              )}
              {directUploadEnabled && (
                <span className="px-2 py-1 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  Direct Upload Enabled
                </span>
              )}
            </div>
            {portalEnabled && portalDeadline && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Deadline: {formatDateTime(portalDeadline)}
              </p>
            )}
          </div>
        )}

        <Input
          label="Document File"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          helperText="Select the file you want to attach to this workflow step."
        />

        {selectedFile && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm">
            <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
            <p className="text-gray-600 dark:text-gray-400">
              {(selectedFile.type || 'Unknown type')} - {Math.max(1, Math.round(selectedFile.size / 1024))} KB
            </p>
          </div>
        )}

        <Input
          label="Document Name"
          placeholder="Enter document name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <TextArea
          label="Description"
          placeholder="Brief description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <Upload size={16} className="mr-1" />
            Upload to Step
          </Button>
        </div>
      </form>
      {ToastComponent}
    </Modal>
  );
};

const DocumentPreviewModal = ({ isOpen, onClose, document: doc, onDownload }) => {
  if (!doc) return null;

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊';
    if (type?.includes('word') || type?.includes('document')) return '📝';
    return '📎';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doc.name} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-4xl">{getFileIcon(doc.type)}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[150px]">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {doc.content || 'No preview available'}
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => onDownload(doc.id)}>
            <Download size={16} className="mr-1" />
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const WorkflowDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorkflow, fetchWorkflowById, isLoading, duplicateWorkflow, deleteWorkflow } = useWorkflowStore();
  const { documents, fetchByStepId, downloadDocument, deleteDocument } = useDocumentStore();
  const { user } = useAuthStore();
  const { showSuccess, showError, ToastComponent } = useToast();
  const [expandedSteps, setExpandedSteps] = useState({});
  const [uploadingToStep, setUploadingToStep] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [stepDocuments, setStepDocuments] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeletingWorkflow, setIsDeletingWorkflow] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const canManagePortal = ['admin', 'manager'].includes(user?.role);
  const canManageWorkflow = ['admin', 'manager'].includes(user?.role);

  useEffect(() => {
    fetchWorkflowById(id);
  }, [id, fetchWorkflowById]);

  useEffect(() => {
    // Fetch documents for each step when workflow loads
    if (currentWorkflow?.steps) {
      currentWorkflow.steps.forEach(async (step) => {
        const docs = await fetchByStepId(step.id);
        setStepDocuments(prev => ({ ...prev, [step.id]: docs || [] }));
      });
    }
  }, [currentWorkflow, fetchByStepId]);

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleDocumentAdded = (stepId, doc) => {
    setStepDocuments(prev => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), doc]
    }));
  };

  const handleDuplicate = async () => {
    if (!currentWorkflow) return;
    const result = await duplicateWorkflow(currentWorkflow.id);
    if (result.success) {
      showSuccess(`Workflow "${currentWorkflow.name}" duplicated successfully!`);
      navigate('/workflows'); // Navigate back to workflow list
    } else {
      showError('Failed to duplicate workflow: ' + result.error);
    }
  };

  const handleDelete = async () => {
    if (!currentWorkflow) return;
    setWorkflowToDelete({
      id: currentWorkflow.id,
      name: currentWorkflow.name,
    });
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    setIsDeletingWorkflow(true);
    const result = await deleteWorkflow(workflowToDelete.id);
    setIsDeletingWorkflow(false);

    if (result.success) {
      showSuccess(`Workflow "${workflowToDelete.name}" deleted successfully!`);
      setWorkflowToDelete(null);
      navigate('/workflows');
    } else {
      showError('Failed to delete workflow: ' + result.error);
    }
  };

  const requestDeleteDocument = (stepId, doc) => {
    setDocumentToDelete({ stepId, doc });
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    setIsDeletingDocument(true);
    const result = await deleteDocument(documentToDelete.doc.id);
    setIsDeletingDocument(false);

    if (result.success) {
      showSuccess(`Document "${documentToDelete.doc.name}" deleted successfully.`);
      setStepDocuments((prev) => ({
        ...prev,
        [documentToDelete.stepId]: prev[documentToDelete.stepId]?.filter((d) => d.id !== documentToDelete.doc.id) || [],
      }));
      if (viewingDoc?.id === documentToDelete.doc.id) {
        setViewingDoc(null);
      }
      setDocumentToDelete(null);
    } else {
      showError(result.error || 'Failed to delete document.');
    }
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    // Refresh workflow data after edit
    fetchWorkflowById(id);
  };

  const handleStaffTaskComplete = async (step, stepIndex) => {
    if (!currentWorkflow || user?.role !== 'staff' || user?.id !== step.assignedTo) {
      return;
    }

    const currentResult = await useWorkflowStore.getState().updateStepStatus(currentWorkflow.id, step.id, 'completed');
    if (!currentResult.success) {
      showError(currentResult.error || 'Failed to complete this task.');
      return;
    }

    const nextStep = currentWorkflow.steps[stepIndex + 1];
    if (nextStep && nextStep.status === 'pending') {
      await useWorkflowStore.getState().updateStepStatus(currentWorkflow.id, nextStep.id, 'in_progress');
      await notificationApi.create({
        type: 'task_assigned',
        title: 'Workflow Task Ready',
        message: `${currentWorkflow.name} - ${step.name} is finished. ${nextStep.name} can now begin.`,
        userId: nextStep.assignedTo,
        link: `/workflows/${currentWorkflow.id}`,
      });
    }

    showSuccess(`Step "${step.name}" marked as completed.`);
    fetchWorkflowById(id);
  };

  if (isLoading || !currentWorkflow) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Loading workflow details...
      </div>
    );
  }

  const progress = calculateWorkflowProgress(currentWorkflow.steps);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/workflows">
            <Button variant="secondary" size="sm">
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentWorkflow.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentWorkflow.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(currentWorkflow.status)} className="text-sm px-3 py-1">
            {getStatusLabel(currentWorkflow.status)}
          </Badge>
          {canManageWorkflow && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
              >
                <Copy size={14} className="mr-1" />
                Duplicate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleDelete}
              >
                <Trash2 size={14} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {currentWorkflow.departments ? (
              currentWorkflow.departments.map((dept) => (
                <Badge key={dept} variant="neutral">{dept}</Badge>
              ))
            ) : (
              <Badge variant="neutral">{currentWorkflow.department}</Badge>
            )}
          </div>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {formatDateTime(currentWorkflow.createdAt)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {progress}%
          </p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h2>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              progress === 100 ? 'bg-green-600' : 'bg-navy-700'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Workflow Steps</h2>
        <div className="space-y-4">
          {currentWorkflow.steps.map((step, index) => {
            const isExpanded = expandedSteps[step.id];
            const stepDocs = stepDocuments[step.id] || [];
            const portalExpired = step.portalEnabled && step.portalDeadline && new Date(step.portalDeadline) < new Date();
            const canSubmitDocuments = canManagePortal || step.portalEnabled || step.directUploadEnabled;
            
            return (
              <div
                key={step.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Step Header (clickable to expand) */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    {step.status === 'completed' ? (
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-600" />
                      </div>
                    ) : step.status === 'in_progress' ? (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Clock size={20} className="text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Circle size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Step {index + 1}: {step.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>Assigned to: User #{step.assignedTo}</span>
                          {stepDocs.length > 0 && (
                            <span className="flex items-center gap-1 text-navy-700 dark:text-navy-400">
                              <FileText size={14} />
                              {stepDocs.length} document{stepDocs.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {step.portalEnabled && (
                            <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
                              Portal
                            </span>
                          )}
                          {step.directUploadEnabled && (
                            <span className="flex items-center gap-1 text-green-700 dark:text-green-300">
                              Upload
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(step.status)}>
                        {getStatusLabel(step.status)}
                      </Badge>
                    </div>
                  </div>
                </button>

                {/* Expanded Step Content */}
                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    {(step.portalEnabled || step.directUploadEnabled) && (
                      <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {step.portalEnabled && (
                            <span className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium">
                              Portal Enabled
                            </span>
                          )}
                          {step.directUploadEnabled && (
                            <span className="px-2 py-1 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium">
                              Direct Upload Enabled
                            </span>
                          )}
                          {portalExpired && (
                            <span className="px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium">
                              Portal Closed
                            </span>
                          )}
                        </div>
                        {step.portalEnabled && step.portalDeadline && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Deadline: {formatDateTime(step.portalDeadline)}
                          </p>
                        )}
                        {!canManagePortal && !step.directUploadEnabled && step.portalEnabled && !portalExpired && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            This step accepts uploads only through its portal before the deadline.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Documents Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FileText size={16} />
                          Step Documents
                        </h4>
                        {canSubmitDocuments && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setUploadingToStep(step.id)}
                          >
                            <Upload size={14} className="mr-1" />
                            {step.portalEnabled && !step.directUploadEnabled ? 'Submit to Portal' : 'Upload Document'}
                          </Button>
                        )}
                      </div>

                      {user?.role === 'staff' && user?.id === step.assignedTo && step.status !== 'completed' && (
                        <div className="mb-4 flex justify-end">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleStaffTaskComplete(step, index)}
                          >
                            Complete Task And Notify Next Step
                          </Button>
                        </div>
                      )}

                      {stepDocs.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <FileText size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No documents uploaded for this step yet</p>
                          <p className="text-xs mt-1">
                            {canSubmitDocuments
                              ? 'Use the step portal or upload button to add files'
                              : 'No portal or direct upload has been configured for this step'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {stepDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-xl flex-shrink-0">
                                  {doc.type?.includes('pdf') ? '📄' :
                                   doc.type?.includes('excel') ? '📊' :
                                   doc.type?.includes('word') ? '📝' : '📎'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {doc.size} • {formatDateTime(doc.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewingDoc(doc)}
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadDocument(doc.id)}
                                >
                                  <Download size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    requestDeleteDocument(step.id, doc);
                                  }}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline Visualization */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Workflow Timeline</h2>
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {currentWorkflow.steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === 'completed' ? 'bg-green-600 text-white' :
                  step.status === 'in_progress' ? 'bg-blue-600 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center max-w-[100px] truncate">
                  {step.name}
                </p>
              </div>
              {index < currentWorkflow.steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  step.status === 'completed' ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Document Upload Modal */}
      {uploadingToStep && (
        <StepDocumentModal
          isOpen={!!uploadingToStep}
          onClose={() => setUploadingToStep(null)}
          workflowId={currentWorkflow.id}
          stepId={uploadingToStep}
          stepName={currentWorkflow.steps.find(s => s.id === uploadingToStep)?.name || ''}
          portalEnabled={currentWorkflow.steps.find(s => s.id === uploadingToStep)?.portalEnabled || false}
          directUploadEnabled={currentWorkflow.steps.find(s => s.id === uploadingToStep)?.directUploadEnabled || false}
          portalDeadline={currentWorkflow.steps.find(s => s.id === uploadingToStep)?.portalDeadline || ''}
          canManagePortal={canManagePortal}
          onDocumentAdded={(doc) => handleDocumentAdded(uploadingToStep, doc)}
        />
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
        onDownload={downloadDocument}
      />

      {/* Edit Workflow Modal */}
      {canManageWorkflow && (
        <EditWorkflowModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          workflow={currentWorkflow}
        />
      )}

      <ConfirmDialog
        isOpen={!!workflowToDelete}
        onClose={() => setWorkflowToDelete(null)}
        onConfirm={confirmDeleteWorkflow}
        title="Delete Workflow"
        message={`Are you sure you want to delete "${workflowToDelete?.name || 'this workflow'}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeletingWorkflow}
      />

      <ConfirmDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={confirmDeleteDocument}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.doc?.name || 'this document'}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeletingDocument}
      />

      {/* Toast Notification */}
      {ToastComponent}
    </div>
  );
};

export default WorkflowDetailPage;
