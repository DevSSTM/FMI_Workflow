// User data for authentication and role management
export const mockUsers = [
  {
    id: '1',
    username: 'tharindu',
    password: 'tharindu123',
    name: 'Tharindu',
    email: 'tharindu@company.com',
    role: 'admin',
    department: 'IT',
    phone: '+1-555-0101',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z',
    lastLogin: null,
  },
  {
    id: '2',
    username: 'panchali',
    password: 'panchali123',
    name: 'Panchali',
    email: 'panchali@company.com',
    role: 'manager',
    department: 'Operations',
    phone: '+1-555-0102',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-05T10:00:00Z',
    lastLogin: null,
  },
  {
    id: '3',
    username: 'nirmal',
    password: 'nirmal123',
    name: 'Nirmal',
    email: 'nirmal@company.com',
    role: 'staff',
    department: 'Finance',
    phone: '+1-555-0103',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-10T11:00:00Z',
    lastLogin: null,
  },
  {
    id: '4',
    username: 'sewmi.hiruni',
    password: 'sewmi123',
    name: 'Sewmi.Hiruni',
    email: 'sewmi.hiruni@company.com',
    role: 'staff',
    department: 'HR',
    phone: '+1-555-0104',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-12T09:00:00Z',
    lastLogin: null,
  },
  {
    id: '5',
    username: 'isma',
    password: 'isma123',
    name: 'Isma',
    email: 'isma@company.com',
    role: 'staff',
    department: 'Procurement',
    phone: '+1-555-0105',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-14T09:00:00Z',
    lastLogin: null,
  },
];

export const roles = {
  admin: {
    label: 'Administrator',
    permissions: ['all'],
    description: 'Full system access and user management',
  },
  manager: {
    label: 'Manager',
    permissions: ['approve', 'create_workflow', 'manage_projects', 'view_reports'],
    description: 'Can approve, create workflows, and manage projects',
  },
  staff: {
    label: 'Staff',
    permissions: ['view_tasks', 'submit_documents', 'comment'],
    description: 'Can view tasks, submit documents, and add comments',
  },
};

export const departments = [
  'IT', 'Operations', 'Finance', 'HR', 'Procurement',
  'Marketing', 'Sales', 'Legal', 'Administration', 'Engineering'
];

export const authService = {
  login: async (username, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      if (!user.isActive) {
        return { success: false, error: 'Account is disabled. Contact administrator.' };
      }

      user.lastLogin = new Date().toISOString();
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Invalid credentials' };
  },

  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },

  getCurrentUser: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  getAllUsers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, data: mockUsers };
  },

  getUserById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const user = mockUsers.find((u) => u.id === id);
    return user
      ? { success: true, data: user }
      : { success: false, error: 'User not found' };
  },

  createUser: async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mockUsers.some((u) => u.username === userData.username)) {
      return { success: false, error: 'Username already exists' };
    }
    if (mockUsers.some((u) => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: `USER-${String(mockUsers.length + 1).padStart(3, '0')}`,
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      avatar: null,
    };

    mockUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, data: userWithoutPassword };
  },

  updateUser: async (id, updates) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return { success: false, error: 'User not found' };
    }

    if (updates.username && updates.username !== mockUsers[index].username) {
      if (mockUsers.some((u) => u.username === updates.username)) {
        return { success: false, error: 'Username already exists' };
      }
    }
    if (updates.email && updates.email !== mockUsers[index].email) {
      if (mockUsers.some((u) => u.email === updates.email)) {
        return { success: false, error: 'Email already exists' };
      }
    }

    mockUsers[index] = { ...mockUsers[index], ...updates };
    const { password: _, ...userWithoutPassword } = mockUsers[index];
    return { success: true, data: userWithoutPassword };
  },

  deleteUser: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return { success: false, error: 'User not found' };
    }

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      if (currentUser.id === id) {
        return { success: false, error: 'Cannot delete your own account' };
      }
    }

    mockUsers.splice(index, 1);
    return { success: true };
  },

  toggleUserStatus: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.isActive = !user.isActive;
    return { success: true, data: user };
  },

  changePassword: async (id, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.password = newPassword;
    return { success: true };
  },

  getUsersByRole: async (role) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = mockUsers.filter((u) => u.role === role && u.isActive);
    return { success: true, data: users };
  },

  getActiveUsers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = mockUsers.filter((u) => u.isActive);
    return { success: true, data: users };
  },
};
