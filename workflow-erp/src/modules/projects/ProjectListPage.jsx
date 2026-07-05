import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, ExternalLink, Edit } from 'lucide-react';
import { useProjectStore } from '../../app/store/projectStore';
import { useWorkflowStore } from '../../app/store/workflowStore';
import { useAuthStore } from '../../app/store/authStore';
import { Card, Badge, Button } from '../../components/ui';
import { getStatusColor, getStatusLabel, formatDate } from '../../utils/helpers';
import CreateProjectModal from './CreateProjectModal';
import EditProjectModal from './EditProjectModal';

const ProjectListPage = () => {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const { workflows, fetchWorkflows } = useWorkflowStore();
  const { user } = useAuthStore();
  const canManageProjects = ['admin', 'manager'].includes(user?.role);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
    fetchWorkflows();
  }, [fetchProjects, fetchWorkflows]);

  const getWorkflowName = (id) => {
    const workflow = workflows.find(w => w.id === id);
    return workflow ? workflow.name : id;
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your projects</p>
        </div>
        {canManageProjects && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Project
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
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
          >
            <option value="all">All Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </Card>

      {/* Project List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <Link to={`/projects/${project.id}`} className="block">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <Badge variant={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  {canManageProjects && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingProject(project);
                      }}
                      className="p-2 text-gray-500 hover:text-navy-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manager</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{project.managerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Team</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Users size={14} className="text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {project.teamMembers.length} members
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{formatDate(project.endDate)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        project.progress === 100 ? 'bg-green-600' : 'bg-navy-700'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Linked Workflows */}
                {project.workflowIds && project.workflowIds.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <ExternalLink size={14} />
                        Linked Workflows
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{project.workflowIds.length} workflow{project.workflowIds.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.workflowIds.map((wfId) => (
                        <Link
                          key={wfId}
                          to={`/workflows/${wfId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-50 dark:bg-navy-900/20 text-navy-700 dark:text-navy-300 rounded-lg text-xs font-medium hover:bg-navy-100 dark:hover:bg-navy-900/40 transition-colors"
                        >
                          {getWorkflowName(wfId)}
                          <ExternalLink size={10} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            </Card>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {canManageProjects && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Project Modal */}
      {canManageProjects && editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
        />
      )}
    </div>
  );
};

export default ProjectListPage;
