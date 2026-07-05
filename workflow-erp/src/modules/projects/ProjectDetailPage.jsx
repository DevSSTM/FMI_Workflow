import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, ExternalLink, CheckCircle, Clock, AlertCircle, Workflow, TrendingUp } from 'lucide-react';
import { useProjectStore } from '../../app/store/projectStore';
import { useWorkflowStore } from '../../app/store/workflowStore';
import { useUserStore } from '../../app/store/userStore';
import { Card, Badge, Button } from '../../components/ui';
import { getStatusColor, getStatusLabel, formatDate } from '../../utils/helpers';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { currentProject, fetchProjectById, isLoading } = useProjectStore();
  const { workflows, fetchWorkflows } = useWorkflowStore();
  const { users } = useUserStore();

  useEffect(() => {
    fetchProjectById(id);
    fetchWorkflows();
  }, [id, fetchProjectById, fetchWorkflows]);

  if (isLoading || !currentProject) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Loading project details...
      </div>
    );
  }

  const getWorkflowById = (wfId) => workflows.find(w => w.id === wfId);
  const getUserById = (userId) => users.find(u => u.id === userId);

  // Calculate overall project progress
  const calculateProgress = () => {
    if (!currentProject.workflowIds || currentProject.workflowIds.length === 0) {
      return currentProject.progress || 0;
    }

    let totalSteps = 0;
    let completedSteps = 0;

    currentProject.workflowIds.forEach(wfId => {
      const workflow = getWorkflowById(wfId);
      if (workflow && workflow.steps) {
        totalSteps += workflow.steps.length;
        completedSteps += workflow.steps.filter(s => s.status === 'completed').length;
      }
    });

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  const overallProgress = calculateProgress();

  // Get all departments involved
  const getAllDepartments = () => {
    const departments = new Set();
    currentProject.workflowIds?.forEach(wfId => {
      const workflow = getWorkflowById(wfId);
      if (workflow) {
        if (workflow.departments) {
          workflow.departments.forEach(dept => departments.add(dept));
        } else if (workflow.department) {
          departments.add(workflow.department);
        }
      }
    });
    return Array.from(departments);
  };

  const allDepartments = getAllDepartments();

  // Get workflow statuses
  const getWorkflowStatusSummary = () => {
    if (!currentProject.workflowIds) return [];
    
    return currentProject.workflowIds.map(wfId => {
      const workflow = getWorkflowById(wfId);
      if (!workflow) return null;
      
      const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
      const totalSteps = workflow.steps.length;
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      return {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        progress,
        department: workflow.department,
        departments: workflow.departments,
        totalSteps,
        completedSteps,
      };
    }).filter(Boolean);
  };

  const workflowSummary = getWorkflowStatusSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="secondary" size="sm">
              <ArrowLeft size={18} className="mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentProject.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentProject.description}
            </p>
          </div>
        </div>
        <Badge variant={getStatusColor(currentProject.status)} className="text-sm px-3 py-1">
          {getStatusLabel(currentProject.status)}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-100 dark:bg-navy-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-navy-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallProgress}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Workflow size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Workflows</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentProject.workflowIds?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentProject.teamMembers?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.ceil((new Date(currentProject.endDate) - new Date(currentProject.startDate)) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Project Completion</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                overallProgress === 100 ? 'bg-green-600' : overallProgress > 50 ? 'bg-navy-700' : 'bg-yellow-500'
              }`}
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Project Timeline */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Project Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(currentProject.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(currentProject.endDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
            <Badge variant={getStatusColor(currentProject.status)} className="mt-1">
              {getStatusLabel(currentProject.status)}
            </Badge>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Project Timeline</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(currentProject.startDate)} → {formatDate(currentProject.endDate)}
            </span>
          </div>
          <div className="relative h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full ${
                overallProgress === 100 ? 'bg-green-500' : 'bg-navy-600'
              } transition-all duration-500`}
              style={{ width: `${overallProgress}%` }}
            >
              <div className="flex items-center justify-end h-full pr-2">
                <span className="text-xs font-semibold text-white">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Involved Departments */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Involved Departments</h2>
        {allDepartments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allDepartments.map((dept) => (
              <Badge key={dept} variant="neutral" className="text-sm px-3 py-1">
                {dept}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No departments assigned</p>
        )}
      </Card>

      {/* Team Members */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users size={20} />
          Team Members
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentProject.teamMembers?.map((userId) => {
            const user = getUserById(userId);
            if (!user) return null;
            
            return (
              <div key={userId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.department} • {user.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Linked Workflows & Their Progress */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Workflow size={20} />
          Linked Workflows
        </h2>
        {workflowSummary.length > 0 ? (
          <div className="space-y-4">
            {workflowSummary.map((wf) => (
              <Link
                key={wf.id}
                to={`/workflows/${wf.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{wf.name}</h3>
                      <ExternalLink size={14} className="text-gray-500" />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {wf.departments ? (
                        wf.departments.map(dept => (
                          <span key={dept} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {dept}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {wf.department}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(wf.status)}>
                    {getStatusLabel(wf.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Progress: {wf.completedSteps}/{wf.totalSteps} steps
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{wf.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        wf.progress === 100 ? 'bg-green-600' : 'bg-navy-700'
                      }`}
                      style={{ width: `${wf.progress}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Workflow size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No workflows linked to this project</p>
            <Link to="/projects" className="text-sm text-navy-700 dark:text-navy-400 mt-2 inline-block hover:underline">
              Edit project to add workflows
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
