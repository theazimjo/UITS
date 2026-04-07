import { create } from 'zustand';
import * as api from '../services/api';

const useStore = create((set, get) => ({
  // Students
  students: [],
  studentPagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  },
  loadingStudents: false,
  
  // Staff & Roles
  staffList: [],
  roles: [],
  loadingStaff: false,
  
  // Groups & Metadata
  groups: [],
  fields: [],
  courses: [],
  rooms: [],
  loadingGroups: false,

  // Actions
  fetchStudents: async (params = {}) => {
    set({ loadingStudents: true });
    try {
      const res = await api.getStudents({
        page: params.page || get().studentPagination.page,
        limit: params.limit || get().studentPagination.limit,
        search: params.search,
        status: params.status !== 'ALL' ? params.status : undefined,
      });
      set({ 
        students: res.data.items, 
        studentPagination: {
          total: res.data.total,
          page: res.data.page,
          limit: res.data.limit,
          totalPages: res.data.totalPages,
        }
      });
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      set({ loadingStudents: false });
    }
  },

  fetchStaff: async () => {
    set({ loadingStaff: true });
    try {
      const [sf, rl] = await Promise.all([api.getStaff(), api.getRoles()]);
      set({ staffList: sf.data, roles: rl.data });
    } catch (err) {
      console.error('Error fetching staff/roles:', err);
    } finally {
      set({ loadingStaff: false });
    }
  },

  fetchGroupsMetadata: async () => {
    set({ loadingGroups: true });
    try {
      const [gr, fl, cr, rm] = await Promise.all([
        api.getGroups(), api.getFields(), api.getCourses(), api.getRooms()
      ]);
      set({ groups: gr.data, fields: fl.data, courses: cr.data, rooms: rm.data });
    } catch (err) {
      console.error('Error fetching groups meta:', err);
    } finally {
      set({ loadingGroups: false });
    }
  },
  
  // Update actions
  setStudents: (newStudents) => set({ students: newStudents }),
  setStaffList: (newList) => set({ staffList: newList }),
  setRoles: (newList) => set({ roles: newList }),
  setGroups: (newList) => set({ groups: newList }),
}));

export default useStore;
