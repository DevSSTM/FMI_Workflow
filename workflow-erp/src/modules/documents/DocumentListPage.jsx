import React, { useEffect, useRef, useState } from 'react';
import { Upload, Search, Filter, FileText, Trash2, Download, Eye } from 'lucide-react';
import { useDocumentStore } from '../../app/store/documentStore';
import { useAuthStore } from '../../app/store/authStore';
import { Card, Badge, Button, Modal, Input, Select, TextArea, ConfirmDialog } from '../../components/ui';
import { documentCategories } from '../../services/mock/documentMock';
import { formatDateTime } from '../../utils/helpers';
import useToast from '../../hooks/useToast.jsx';

const DocumentViewerModal = ({ isOpen, onClose, document: doc }) => {
  if (!doc) return null;

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊';
    if (type?.includes('word') || type?.includes('document')) return '📝';
    return '📎';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doc.name} size="xl">
      <div className="space-y-4">
        {/* Document Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-4xl">{getFileIcon(doc.type)}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Size: {doc.size}</span>
              <span>Category: {doc.category}</span>
              <span>Uploaded: {formatDateTime(doc.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Document Preview</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[200px]">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {doc.content || 'No preview available'}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
            * Preview is unavailable for this file type in the current browser view.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              useDocumentStore.getState().downloadDocument(doc.id);
            }}
          >
            <Download size={16} className="mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DocumentListPage = () => {
  const { documents, fetchDocuments, uploadDocument, deleteDocument, downloadDocument, searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, isLoading } = useDocumentStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError, showWarning, ToastComponent } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category stats
  const categoryStats = {
    sop: documents.filter(d => d.category === 'sop').length,
    checklist: documents.filter(d => d.category === 'checklist').length,
    template: documents.filter(d => d.category === 'template').length,
    policy: documents.filter(d => d.category === 'policy').length,
    form: documents.filter(d => d.category === 'form').length,
    guide: documents.filter(d => d.category === 'guide').length,
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sop: '📋',
      checklist: '☑️',
      template: '📄',
      policy: '📜',
      form: '📝',
      guide: '📚',
      other: '📎',
    };
    return icons[category] || '📎';
  };

  const getCategoryColor = (category) => {
    const colors = {
      sop: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
      checklist: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      template: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      policy: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      form: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      guide: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[category] || colors.other;
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    const result = await deleteDocument(documentToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      showSuccess(`Document "${documentToDelete.name}" deleted successfully.`);
      setDocumentToDelete(null);
      if (viewingDoc?.id === documentToDelete.id) {
        setViewingDoc(null);
      }
    } else {
      showError(result.error || 'Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Templates Library</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">SOPs, checklists, templates, and standard documents</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload size={18} className="mr-2" />
          Upload Template
        </Button>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(categoryStats).map(([key, count]) => (
          <Card
            key={key}
            className={`text-center cursor-pointer transition-all ${
              selectedCategory === key
                ? 'ring-2 ring-navy-600 shadow-md bg-navy-50 dark:bg-navy-900/20 scale-105'
                : 'hover:shadow-md hover:scale-105'
            }`}
            onClick={() => {
              console.log('Category clicked:', key, 'Current:', selectedCategory);
              handleCategoryChange(selectedCategory === key ? 'all' : key);
            }}
          >
            <div className="text-3xl mb-2">{getCategoryIcon(key)}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
            >
              <option value="all">All Categories</option>
              {documentCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            Loading documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No documents found
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{getCategoryIcon(doc.category)}</div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                  {doc.category.toUpperCase()}
                </span>
              </div>

              <h3 className="font-medium text-gray-900 dark:text-white mb-2 truncate">
                {doc.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {doc.description}
              </p>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Size</span>
                  <span className="font-medium">{doc.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded by</span>
                  <span className="font-medium">{doc.uploadedByName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium">{formatDateTime(doc.createdAt)}</span>
                </div>
                {doc.workflowName && (
                  <div className="flex justify-between">
                    <span>Workflow</span>
                    <span className="font-medium text-navy-700 dark:text-navy-400">{doc.workflowName}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewingDoc(doc);
                  }}
                >
                  <Eye size={14} className="mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    downloadDocument(doc.id);
                  }}
                >
                  <Download size={16} className="mr-1" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDocumentToDelete(doc);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />

      <ConfirmDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.name || 'this document'}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      />

      {ToastComponent}
    </div>
  );
};

const UploadDocumentModal = ({ isOpen, onClose }) => {
  const { uploadDocument } = useDocumentStore();
  const { user } = useAuthStore();
  const { showSuccess, showError, showWarning, ToastComponent } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'sop',
    workflowId: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressTimerRef = useRef(null);

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const resetForm = () => {
    clearProgressTimer();
    setFormData({ name: '', description: '', category: 'sop', workflowId: '' });
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }

    return () => {
      clearProgressTimer();
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isUploading) {
      return;
    }
    resetForm();
    onClose();
  };

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
    if (isUploading) {
      return;
    }

    if (!selectedFile) {
      showWarning('Please select a document file to upload.');
      return;
    }

    if (!formData.name.trim()) {
      showWarning('Template name is required.');
      return;
    }

    const docData = {
      ...formData,
      type: selectedFile.type || 'application/octet-stream',
      file: selectedFile,
      originalFileName: selectedFile.name,
      uploadedBy: user?.id,
      uploadedByName: user?.name,
    };

    setIsUploading(true);
    setUploadProgress(0);
    clearProgressTimer();
    progressTimerRef.current = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current >= 90) {
          return current;
        }

        return Math.min(current + Math.max(4, Math.round((100 - current) / 8)), 90);
      });
    }, 120);

    const result = await uploadDocument(docData);
    if (result.success) {
      clearProgressTimer();
      setUploadProgress(100);
      showSuccess(`Document "${formData.name.trim()}" uploaded successfully.`);
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 250);
      return;
    }

    clearProgressTimer();
    setIsUploading(false);
    setUploadProgress(0);
    showError(result.error || 'Failed to upload document.');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document Template">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Template File"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          helperText="Select an existing template file from your computer to store in the system."
          disabled={isUploading}
        />

        {selectedFile && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm">
            <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
            <p className="text-gray-600 dark:text-gray-400">
              {(selectedFile.type || 'Unknown type')} • {Math.max(1, Math.round(selectedFile.size / 1024))} KB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Uploading document</span>
              <span className="text-navy-700 dark:text-navy-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-navy-700 transition-all duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Input
          label="Template Name"
          placeholder="e.g., Procurement_SOP_Template.pdf"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isUploading}
        />

        <TextArea
          label="Description"
          placeholder="Brief description of the template"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isUploading}
        />

        <Select
          label="Document Type"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={documentCategories}
          disabled={isUploading}
        />

        <div className="p-4 bg-navy-50 dark:bg-navy-900/20 rounded-lg border border-navy-200 dark:border-navy-800">
          <p className="text-sm text-navy-700 dark:text-navy-300">
            <strong>Supported Categories:</strong> SOPs, Checklists, Templates, Policies, Forms, Guides
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Template'}
          </Button>
        </div>
      </form>
      {ToastComponent}
    </Modal>
  );
};

export default DocumentListPage;
