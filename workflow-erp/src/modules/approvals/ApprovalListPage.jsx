import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Filter } from 'lucide-react';
import { useApprovalStore } from '../../app/store/approvalStore';
import { useAuthStore } from '../../app/store/authStore';
import { Card, Badge, Button } from '../../components/ui';
import { getStatusColor, getStatusLabel, formatDateTime } from '../../utils/helpers';

const ApprovalListPage = () => {
  const { approvals, fetchApprovals, isLoading } = useApprovalStore();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const filteredApprovals = approvals.filter((approval) => {
    if (statusFilter === 'all') return true;
    return approval.status === statusFilter;
  });

  const stats = {
    pending: approvals.filter((a) => a.status === 'pending').length,
    approved: approvals.filter((a) => a.status === 'approved').length,
    rejected: approvals.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage approval requests and decisions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-100">Pending</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
          </div>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 shadow-lg shadow-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Approved</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.approved}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Check className="text-white" size={20} />
            </div>
          </div>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-rose-400 via-red-500 to-pink-600 shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-100">Rejected</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <X className="text-white" size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
          >
            <option value="all">All Approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Approval List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading approvals...
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No approvals found
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <Card key={approval.id} className="hover:shadow-md transition-shadow">
              <Link to={`/approvals/${approval.id}`} className="block">
                {(() => {
                  const isProjectApproval = approval.requestType === 'project';
                  const approvalTitle = approval.projectName || approval.workflowName;
                  const approvalStageLabel = isProjectApproval ? 'Approval Stage' : 'Step';
                  return (
                    <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {approvalTitle}
                      </h3>
                      <Badge variant={getStatusColor(approval.status)}>
                        {getStatusLabel(approval.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {approvalStageLabel}: {approval.stepName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Requested By</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                      {approval.requestedByName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Assigned To</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                      {approval.assignedToName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Requested</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                      {formatDateTime(approval.requestedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Due Date</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                      {formatDateTime(approval.dueDate)}
                    </p>
                  </div>
                </div>

                {approval.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <Link to={`/approvals/${approval.id}`}>
                      <Button variant="primary" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                )}
                    </>
                  );
                })()}
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalListPage;
