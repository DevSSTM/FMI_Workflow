// Document data starts empty until users upload files in the app.
export const mockDocuments = [];

export const documentCategories = [
  { value: 'sop', label: 'SOP' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'template', label: 'Template' },
  { value: 'policy', label: 'Policy' },
  { value: 'form', label: 'Form' },
  { value: 'guide', label: 'Guide' },
  { value: 'other', label: 'Other' },
];

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 KB';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formattedValue = value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1);
  return `${formattedValue} ${units[unitIndex]}`;
};

export const documentService = {
  getAll: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: mockDocuments };
  },

  getById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const doc = mockDocuments.find((d) => d.id === id);
    return doc
      ? { success: true, data: doc }
      : { success: false, error: 'Document not found' };
  },

  getByWorkflow: async (workflowId) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const docs = mockDocuments.filter((d) => d.workflowId === workflowId);
    return { success: true, data: docs };
  },

  getByStepId: async (stepId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const docs = mockDocuments.filter((d) => d.stepId === stepId);
    return { success: true, data: docs };
  },

  download: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const doc = mockDocuments.find((d) => d.id === id);
    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    const content = doc.content || `Content for ${doc.name}`;
    const blob = doc.fileBlob || new Blob([content], { type: doc.type || 'text/plain' });
    const url = doc.downloadUrl || URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (!doc.downloadUrl) {
      URL.revokeObjectURL(url);
    }
    return { success: true, data: doc };
  },

  create: async (docData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const file = docData.file || null;
    const downloadUrl = file ? URL.createObjectURL(file) : null;
    const newDoc = {
      id: `DOC-${String(mockDocuments.length + 1).padStart(3, '0')}`,
      ...docData,
      size: file ? formatFileSize(file.size) : `${Math.floor(Math.random() * 5000) + 100} KB`,
      type: file?.type || docData.type || 'application/octet-stream',
      content: docData.content || (file ? `Uploaded file: ${file.name}` : `Content for ${docData.name}`),
      originalFileName: file?.name || docData.originalFileName || docData.name,
      downloadUrl,
      fileBlob: file,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDocuments.push(newDoc);
    return { success: true, data: newDoc };
  },

  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = mockDocuments.findIndex((d) => d.id === id);
    if (index === -1) {
      return { success: false, error: 'Document not found' };
    }
    mockDocuments.splice(index, 1);
    return { success: true };
  },

  search: async (query) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    const results = mockDocuments.filter(
      (d) =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.description.toLowerCase().includes(lowerQuery) ||
        d.category.toLowerCase().includes(lowerQuery)
    );
    return { success: true, data: results };
  },
};
