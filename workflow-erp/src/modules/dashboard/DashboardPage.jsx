import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Workflow,
  Clock,
  FileText,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../app/store/authStore';
import { useWorkflowStore } from '../../app/store/workflowStore';
import { useApprovalStore } from '../../app/store/approvalStore';
import { useProjectStore } from '../../app/store/projectStore';
import { Card, Badge } from '../../components/ui';
import { getStatusColor, getStatusLabel, calculateWorkflowProgress, formatDistanceToNow } from '../../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { workflows, fetchWorkflows } = useWorkflowStore();
  const { approvals, fetchApprovals } = useApprovalStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchWorkflows();
    fetchApprovals();
    fetchProjects();
  }, [fetchWorkflows, fetchApprovals, fetchProjects]);

  // Calculate stats
  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length;
  const activeWorkflows = workflows.filter((w) => w.status === 'in_progress').length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const totalTasks = workflows.reduce((acc, w) => acc + w.steps.length, 0);
  const completedTasks = workflows.reduce(
    (acc, w) => acc + w.steps.filter((s) => s.status === 'completed').length,
    0
  );

  const recentActivity = [
    ...workflows.map((workflow) => ({
      id: `workflow-${workflow.id}`,
      type: 'workflow',
      action: workflow.updatedAt && workflow.updatedAt !== workflow.createdAt ? 'updated' : 'created',
      item: workflow.name,
      time: workflow.updatedAt || workflow.createdAt,
    })),
    ...approvals.map((approval) => ({
      id: `approval-${approval.id}`,
      type: 'approval',
      action: approval.status,
      item: approval.workflowName || approval.stepName || approval.id,
      time: approval.decidedAt || approval.requestedAt || approval.createdAt,
    })),
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      type: 'project',
      action: project.updatedAt && project.updatedAt !== project.createdAt ? 'updated' : 'created',
      item: project.name,
      time: project.updatedAt || project.createdAt,
    })),
  ]
    .filter((activity) => activity.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening with your workflows today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
          <Link to="/approvals" className="text-sm text-navy-700 dark:text-navy-400 mt-4 inline-flex items-center hover:underline">
            View all <ArrowRight size={14} className="ml-1" />
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Workflows</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{activeWorkflows}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Workflow className="text-blue-600" size={24} />
            </div>
          </div>
          <Link to="/workflows" className="text-sm text-navy-700 dark:text-navy-400 mt-4 inline-flex items-center hover:underline">
            View all <ArrowRight size={14} className="ml-1" />
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <Link to="/projects" className="text-sm text-navy-700 dark:text-navy-400 mt-4 inline-flex items-center hover:underline">
            View all <ArrowRight size={14} className="ml-1" />
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {completedTasks}/{totalTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-navy-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Workflows */}
        <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workflows</h2>}>
          <div className="space-y-4">
            {workflows.filter((w) => w.status === 'in_progress').slice(0, 4).map((workflow) => {
              const progress = calculateWorkflowProgress(workflow.steps);
              return (
                <Link
                  key={workflow.id}
                  to={`/workflows/${workflow.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.department}</p>
                    </div>
                    <Badge variant={getStatusColor(workflow.status)}>
                      {getStatusLabel(workflow.status)}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-navy-700 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {workflows.filter((w) => w.status === 'in_progress').length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No active workflows
              </div>
            )}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Approvals</h2>}>
          <div className="space-y-4">
            {approvals.filter((a) => a.status === 'pending').slice(0, 4).map((approval) => (
              <Link
                key={approval.id}
                to={`/approvals/${approval.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{approval.workflowName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{approval.stepName}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Due: {new Date(approval.dueDate).toLocaleDateString()}
                </p>
              </Link>
            ))}
            {approvals.filter((a) => a.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No pending approvals
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>}>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'workflow' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  activity.type === 'approval' ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  {activity.type === 'workflow' ? (
                    <Workflow size={16} className="text-blue-600" />
                  ) : activity.type === 'approval' ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <FileText size={16} className="text-purple-600" />
                  )}
                </div>
                {index < recentActivity.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 dark:bg-gray-700 mx-auto mt-2"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.item}</span> was{' '}
                  <span className="font-medium">{activity.action}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatDistanceToNow(activity.time)}
                </p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent activity yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
