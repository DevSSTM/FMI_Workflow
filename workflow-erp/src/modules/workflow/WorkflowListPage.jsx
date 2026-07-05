import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Copy, Edit, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../app/store/workflowStore';
import { useAuthStore } from '../../app/store/authStore';
import { Card, Badge, Button, ConfirmDialog } from '../../components/ui';
import { getStatusColor, getStatusLabel, calculateWorkflowProgress, formatDate } from '../../utils/helpers';
import CreateWorkflowModal from './CreateWorkflowModal';
import EditWorkflowModal from './EditWorkflowModal';
import useToast from '../../hooks/useToast.jsx';

const WorkflowListPage = () => {
  const { workflows, fetchWorkflows, isLoading, duplicateWorkflow, deleteWorkflow } = useWorkflowStore();
  const { user } = useAuthStore();
  const { showSuccess, showError, ToastComponent } = useToast();
  const canManageWorkflows = ['admin', 'manager'].includes(user?.role);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workflowToDelete, setWorkflowToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleDuplicate = async (workflowId, workflowName, e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await duplicateWorkflow(workflowId);
    if (result.success) {
      showSuccess(`Workflow "${workflowName}" duplicated successfully!`);
      fetchWorkflows(); // Refresh the list
    } else {
      showError('Failed to duplicate workflow: ' + result.error);
    }
  };

  const handleEdit = (workflow, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingWorkflow(workflow);
    setShowEditModal(true);
  };

  const handleDelete = async (workflowId, workflowName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWorkflowToDelete({ id: workflowId, name: workflowName });
  };

  const confirmDelete = async () => {
    if (!workflowToDelete) return;

    setIsDeleting(true);
    const result = await deleteWorkflow(workflowToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      showSuccess(`Workflow "${workflowToDelete.name}" deleted successfully!`);
      setWorkflowToDelete(null);
    } else {
      showError('Failed to delete workflow: ' + result.error);
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      !searchQuery ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your business workflows</p>
        </div>
        {canManageWorkflows && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Workflow
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Workflow List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            Loading workflows...
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No workflows found
          </div>
        ) : (
          filteredWorkflows.map((workflow) => {
            const progress = calculateWorkflowProgress(workflow.steps);
            return (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <Link to={`/workflows/${workflow.id}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {workflow.description}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(workflow.status)}>
                      {getStatusLabel(workflow.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {/* Department Badges */}
                    <div className="flex flex-wrap gap-1">
                      {workflow.departments ? (
                        workflow.departments.map((dept) => (
                          <span key={dept} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {dept}
                          </span>
                        ))
                      ) : (
                        <span>{workflow.department}</span>
                      )}
                    </div>
                    <span>•</span>
                    <span>{workflow.steps.length} steps</span>
                    <span>•</span>
                    <span>Created {formatDate(workflow.createdAt)}</span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          progress === 100 ? 'bg-green-600' : 'bg-navy-700'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {workflow.steps.slice(0, 4).map((step, index) => (
                        <div key={step.id} className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            step.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                          )}
                        </div>
                      ))}
                      {workflow.steps.length > 4 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          +{workflow.steps.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                {canManageWorkflows && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => handleEdit(workflow, e)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDuplicate(workflow.id, workflow.name, e)}
                    >
                      <Copy size={14} className="mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={(e) => handleDelete(workflow.id, workflow.name, e)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Workflow Modal */}
      <EditWorkflowModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingWorkflow(null);
        }}
        workflow={editingWorkflow}
      />

      <ConfirmDialog
        isOpen={!!workflowToDelete}
        onClose={() => setWorkflowToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Workflow"
        message={`Are you sure you want to delete "${workflowToDelete?.name || 'this workflow'}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      />

      {/* Toast Notification */}
      {ToastComponent}
    </div>
  );
};

export default WorkflowListPage;

