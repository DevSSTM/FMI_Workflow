import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Check, X, ChevronDown, ChevronUp, Workflow } from 'lucide-react';
import { useProjectStore } from '../../app/store/projectStore';
import { useWorkflowStore } from '../../app/store/workflowStore';
import { useUserStore } from '../../app/store/userStore';
import { Modal, Button, Input, TextArea } from '../../components/ui';

const EditProjectModal = ({ isOpen, onClose, project }) => {
  const { updateProject, isLoading } = useProjectStore();
  const { workflows, fetchWorkflows } = useWorkflowStore();
  const { users, fetchUsers } = useUserStore();
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      managerName: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    if (isOpen && project) {
      fetchWorkflows();
      fetchUsers();
      
      // Set form values from existing project
      reset({
        name: project.name || '',
        managerName: project.managerName || '',
        description: project.description || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
      });

      // Set selected workflows and team members
      setSelectedWorkflows(project.workflowIds || []);
      setSelectedTeamMembers(project.teamMembers || []);
    }
  }, [isOpen, project, fetchWorkflows, fetchUsers, reset]);

  const activeUsers = users.filter(u => u.isActive);

  const toggleWorkflow = (workflowId) => {
    if (selectedWorkflows.includes(workflowId)) {
      setSelectedWorkflows(selectedWorkflows.filter(id => id !== workflowId));
    } else {
      setSelectedWorkflows([...selectedWorkflows, workflowId]);
    }
  };

  const removeWorkflow = (workflowId) => {
    setSelectedWorkflows(selectedWorkflows.filter(id => id !== workflowId));
  };

  const toggleTeamMember = (userId) => {
    if (selectedTeamMembers.includes(userId)) {
      setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== userId));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, userId]);
    }
  };

  const removeTeamMember = (userId) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== userId));
  };

  const getWorkflowName = (id) => {
    const workflow = workflows.find(w => w.id === id);
    return workflow ? workflow.name : id;
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : id;
  };

  const onSubmit = async (data) => {
    const updateData = {
      ...data,
      managerName: data.managerName,
      teamMembers: selectedTeamMembers,
      teamMemberNames: selectedTeamMembers.map(id => getUserName(id)),
      workflowIds: selectedWorkflows,
    };

    const result = await updateProject(project.id, updateData);
    if (result.success) {
      reset();
      setSelectedWorkflows([]);
      setSelectedTeamMembers([]);
      onClose();
    }
  };

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Project Name"
          placeholder="Enter project name"
          error={errors.name?.message}
          {...register('name', { required: 'Project name is required' })}
        />

        <Input
          label="Project Manager Name"
          placeholder="Enter project manager name"
          error={errors.managerName?.message}
          {...register('managerName')}
        />

        <TextArea
          label="Description"
          placeholder="Describe the project"
          rows={3}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
          />
          <Input
            label="End Date"
            type="date"
            {...register('endDate', { required: 'End date is required' })}
          />
        </div>

        {/* Link Workflows Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Linked Workflows
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowWorkflowDropdown(!showWorkflowDropdown)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              {selectedWorkflows.length === 0 ? (
                <span className="text-gray-500">Select workflows to link...</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedWorkflows.map((wfId) => (
                    <span key={wfId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-100 dark:bg-navy-900/30 text-navy-700 dark:text-navy-400 rounded text-xs font-medium">
                      {getWorkflowName(wfId)}
                      <X size={12} onClick={(e) => { e.stopPropagation(); removeWorkflow(wfId); }} className="cursor-pointer hover:text-red-600" />
                    </span>
                  ))}
                </div>
              )}
              {showWorkflowDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showWorkflowDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {workflows.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No workflows available
                  </div>
                ) : (
                  workflows.map((workflow) => {
                    const isSelected = selectedWorkflows.includes(workflow.id);
                    return (
                      <button
                        key={workflow.id}
                        type="button"
                        onClick={() => toggleWorkflow(workflow.id)}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          isSelected ? 'bg-navy-50 dark:bg-navy-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Workflow size={14} className="text-gray-500" />
                          <div>
                            <div className="text-gray-900 dark:text-gray-100">{workflow.name}</div>
                            <div className="text-xs text-gray-500">{workflow.department || 'Multiple Departments'}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-navy-600" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {selectedWorkflows.length > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {selectedWorkflows.length} workflow{selectedWorkflows.length !== 1 ? 's' : ''} linked
            </p>
          )}
        </div>

        {/* Team Members Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Team Members
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTeamDropdown(!showTeamDropdown)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              {selectedTeamMembers.length === 0 ? (
                <span className="text-gray-500">Select team members...</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedTeamMembers.map((userId) => (
                    <span key={userId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-100 dark:bg-navy-900/30 text-navy-700 dark:text-navy-400 rounded text-xs font-medium">
                      {getUserName(userId)}
                      <X size={12} onClick={(e) => { e.stopPropagation(); removeTeamMember(userId); }} className="cursor-pointer hover:text-red-600" />
                    </span>
                  ))}
                </div>
              )}
              {showTeamDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTeamDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {activeUsers.map((user) => {
                  const isSelected = selectedTeamMembers.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleTeamMember(user.id)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-navy-50 dark:bg-navy-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-navy-700 flex items-center justify-center text-white text-xs font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-gray-100">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.department} • {user.role}</div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-navy-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Update Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;
