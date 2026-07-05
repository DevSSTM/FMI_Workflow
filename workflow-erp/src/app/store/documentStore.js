import { create } from 'zustand';
import { documentApi } from '../../services/api';

export const useDocumentStore = create((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'all',
  
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentApi.getAll();
      if (result.success) {
        set({ documents: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchByWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentApi.getByWorkflow(workflowId);
      if (result.success) {
        set({ documents: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchByStepId: async (stepId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentApi.getByStepId(stepId);
      if (result.success) {
        return result.data;
      }
    } catch (error) {
      console.error('Failed to fetch step documents:', error);
    }
    return [];
  },
  
  downloadDocument: async (id) => {
    const result = await documentApi.download(id);
    return result;
  },
  
  uploadDocument: async (docData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentApi.create(docData);
      if (result.success) {
        set((state) => ({
          documents: [...state.documents, result.data],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: result.error });
      }
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentApi.delete(id);
      if (result.success) {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: result.error });
      }
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  searchDocuments: async (query) => {
    set({ searchQuery: query, isLoading: true });
    try {
      const result = await documentApi.search(query);
      if (result.success) {
        set({ documents: result.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },
  
  getFilteredDocuments: () => {
    const { documents, searchQuery, selectedCategory } = get();
    return documents.filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },
}));
