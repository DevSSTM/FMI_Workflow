import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, PenTool, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useApprovalStore } from '../../app/store/approvalStore';
import { useAuthStore } from '../../app/store/authStore';
import { Card, Badge, Button, TextArea, Input, SignaturePad } from '../../components/ui';
import { getStatusColor, getStatusLabel, formatDateTime } from '../../utils/helpers';

const ApprovalDetailPage = () => {
  const { id } = useParams();
  const { currentApproval, fetchApprovalById, approve, reject, addComment, isLoading } = useApprovalStore();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState('');
  const [drawnSignature, setDrawnSignature] = useState(null);
  const [signatureType, setSignatureType] = useState('type'); // 'type' or 'draw'
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [actionError, setActionError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      comment: '',
    },
  });

  useEffect(() => {
    fetchApprovalById(id);
  }, [id, fetchApprovalById]);

  const handleApprove = async () => {
    const finalSignature = signatureType === 'draw' ? drawnSignature : signature;
    
    if (!finalSignature || (typeof finalSignature === 'string' && !finalSignature.trim())) {
      setActionError('E-signature is required');
      return;
    }
    if (!signatureConfirmed) {
      setActionError('Please confirm your e-signature');
      return;
    }
    const result = await approve(id, comment || 'Approved', finalSignature, user);
    if (result.success) {
      setComment('');
      setSignature('');
      setSignatureConfirmed(false);
    } else {
      setActionError(result.error || 'Approval failed');
    }
  };

  const handleReject = async () => {
    const finalSignature = signatureType === 'draw' ? drawnSignature : signature;

    if (!comment.trim()) {
      setActionError('Please provide a reason for rejection');
      return;
    }
    if (!finalSignature || (typeof finalSignature === 'string' && !finalSignature.trim())) {
      setActionError('E-signature is required');
      return;
    }
    if (!signatureConfirmed) {
      setActionError('Please confirm your e-signature');
      return;
    }
    const result = await reject(id, comment, finalSignature, user);
    if (result.success) {
      setComment('');
      setSignature('');
      setSignatureConfirmed(false);
    } else {
      setActionError(result.error || 'Rejection failed');
    }
  };

  const handleAddComment = async (data) => {
    if (data.comment.trim() && user) {
      await addComment(id, user.id, user.name, data.comment);
      reset();
      setShowCommentForm(false);
    }
  };

  if (isLoading || !currentApproval) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Loading approval details...
      </div>
    );
  }

  const isProjectApproval = currentApproval.requestType === 'project';
  const requestTitle = isProjectApproval ? 'Project Approval Request' : 'Approval Request';
  const requestSubtitle = isProjectApproval
    ? `${currentApproval.projectName || currentApproval.workflowName} - ${currentApproval.stepName}`
    : `${currentApproval.workflowName} - ${currentApproval.stepName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/approvals">
            <Button variant="secondary" size="sm">
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {requestTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {requestSubtitle}
            </p>
          </div>
        </div>
        <Badge variant={getStatusColor(currentApproval.status)} className="text-sm px-3 py-1">
          {getStatusLabel(currentApproval.status)}
        </Badge>
      </div>

      {/* Approval Details */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{isProjectApproval ? 'Project' : 'Workflow'}</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{currentApproval.projectName || currentApproval.workflowName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {currentApproval.projectId || currentApproval.workflowId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{isProjectApproval ? 'Approval Stage' : 'Step'}</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{currentApproval.stepName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Requested By</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{currentApproval.requestedByName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Assigned To</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{currentApproval.assignedToName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Requested At</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{formatDateTime(currentApproval.requestedAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{formatDateTime(currentApproval.dueDate)}</p>
          </div>
        </div>
      </Card>

      {/* Action Panel */}
      {currentApproval.status === 'pending' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Take Action</h2>
          
          {actionError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>
            </div>
          )}

          <TextArea
            label="Comment (required for rejection)"
            placeholder="Add your comment..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setActionError('');
            }}
            rows={3}
          />

          {/* E-Signature Section */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PenTool size={18} className="text-navy-700" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">E-Signature Verification</h3>
                {signatureConfirmed && (
                  <CheckCircle size={16} className="text-green-600 ml-1" />
                )}
              </div>
              
              <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => {
                    setSignatureType('type');
                    setActionError('');
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    signatureType === 'type' 
                      ? 'bg-white dark:bg-gray-700 text-navy-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Type
                </button>
                <button
                  onClick={() => {
                    setSignatureType('draw');
                    setActionError('');
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    signatureType === 'draw' 
                      ? 'bg-white dark:bg-gray-700 text-navy-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Draw
                </button>
              </div>
            </div>
            
            {signatureType === 'type' ? (
              <Input
                placeholder="Type your full name as e-signature"
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value);
                  setActionError('');
                }}
                helperText="Your typed name serves as your digital signature"
              />
            ) : (
              <SignaturePad 
                onSave={(data) => {
                  setDrawnSignature(data);
                  setActionError('');
                }}
                label="Draw your signature below"
              />
            )}

            {(signature || (signatureType === 'draw' && drawnSignature)) && (
              <div className="mt-4 flex items-center gap-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signatureConfirmed}
                    onChange={(e) => setSignatureConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-navy-700 focus:ring-navy-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    I confirm this is my authorized electronic signature
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={!(signatureType === 'draw' ? drawnSignature : signature) || !signatureConfirmed}
            >
              <Send size={18} className="mr-2" />
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!(signatureType === 'draw' ? drawnSignature : signature) || !signatureConfirmed || !comment.trim()}
            >
              <AlertCircle size={18} className="mr-2" />
              Reject
            </Button>
          </div>
          {(!(signatureType === 'draw' ? drawnSignature : signature) || !signatureConfirmed) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * Please provide your e-signature and confirm before taking action
            </p>
          )}
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments & History</h2>
          <Button variant="secondary" size="sm" onClick={() => setShowCommentForm(!showCommentForm)}>
            Add Comment
          </Button>
        </div>

        {showCommentForm && (
          <form onSubmit={handleSubmit(handleAddComment)} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <TextArea
              label="Your Comment"
              placeholder="Type your comment..."
              error={errors.comment?.message}
              {...register('comment', { required: 'Comment cannot be empty' })}
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCommentForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Post Comment
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {currentApproval.comments.length === 0 ? (
            <p className="text-center py-6 text-gray-500 dark:text-gray-400">
              No comments yet
            </p>
          ) : (
            currentApproval.comments.map((commentItem) => (
              <div key={commentItem.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{commentItem.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(commentItem.createdAt)}
                    </p>
                  </div>
                      {commentItem.signature?.startsWith('data:image') ? (
                        <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-1 border rounded">
                          <img src={commentItem.signature} alt="Signature" className="h-8 object-contain" />
                          <span className="text-[8px] text-gray-400 uppercase">Drawn</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-navy-50 dark:bg-navy-900/20 rounded">
                          <PenTool size={12} className="text-navy-700" />
                          <span className="text-xs text-navy-800 dark:text-navy-400 font-medium">
                            {commentItem.signature}
                          </span>
                        </div>
                      )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{commentItem.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Approval History */}
        {currentApproval.history.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Approval History</h3>
            <div className="space-y-3">
              {currentApproval.history.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    entry.action === 'approved' ? 'bg-green-600' : 'bg-red-600'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{entry.userName}</span> {entry.action} this request
                        </p>
                        {entry.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDateTime(entry.timestamp)}
                        </p>
                      </div>
                      {entry.signature?.startsWith('data:image') ? (
                        <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-1 border rounded flex-shrink-0">
                          <img src={entry.signature} alt="Signature" className="h-8 object-contain" />
                          <span className="text-[8px] text-gray-400 uppercase">Drawn</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-navy-50 dark:bg-navy-900/20 rounded flex-shrink-0">
                          <PenTool size={12} className="text-navy-700" />
                          <span className="text-xs text-navy-800 dark:text-navy-400 font-medium">
                            {entry.signature}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApprovalDetailPage;
