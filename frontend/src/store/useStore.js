import { create } from 'zustand';
import { 
  getStudents, getStaff, getRoles, getGroups, getFields, getCourses, getRooms,
  getTeacherGroups, getTeacherStudents, getTeacherAttendance
} from '../services/api';

const useStore = create((set, get) => ({
  // Core Data
  students: [],
  staff: [],
  roles: [],
  groups: [],
  fields: [],
  courses: [],
  rooms: [],
  user: null,
  loading: false,
  
  // Setters with safety checks
  setUser: (user) => set({ user }),
  setLoading: (val) => set({ loading: val }),
  setStudents: (data) => set({ students: Array.isArray(data) ? data : [] }),
  setStaff: (data) => set({ staff: Array.isArray(data) ? data : [] }),
  setRoles: (data) => set({ roles: Array.isArray(data) ? data : [] }),
  setGroups: (data) => set({ groups: Array.isArray(data) ? data : [] }),
  setFields: (data) => set({ fields: Array.isArray(data) ? data : [] }),
  setCourses: (data) => set({ courses: Array.isArray(data) ? data : [] }),
  setRooms: (data) => set({ rooms: Array.isArray(data) ? data : [] }),

  // Helpers to refresh data efficiently
  hydrate: (data) => set((state) => ({
    ...state,
    students: Array.isArray(data.students) ? data.students : state.students,
    staff: Array.isArray(data.staff) ? data.staff : state.staff,
    roles: Array.isArray(data.roles) ? data.roles : state.roles,
    groups: Array.isArray(data.groups) ? data.groups : state.groups,
    fields: Array.isArray(data.fields) ? data.fields : state.fields,
    courses: Array.isArray(data.courses) ? data.courses : state.courses,
    rooms: Array.isArray(data.rooms) ? data.rooms : state.rooms,
  })),

  refreshAllRows: async (date, sync = false) => {
    set({ loading: true });
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (user?.role === 'teacher') {
        // Teacher specific refresh
        const promises = [getTeacherGroups()];
        
        // If date is provided, get students WITH attendance, otherwise just normal list
        if (date) {
          promises.push(getTeacherAttendance(date, sync));
        } else {
          promises.push(getTeacherStudents());
        }

        const [gr, stData] = await Promise.all(promises);
        
        set({ 
          groups: Array.isArray(gr.data) ? gr.data : [],
          students: Array.isArray(date ? stData.data?.students : stData.data) 
            ? (date ? stData.data.students : stData.data) 
            : []
        });
      } else {
        // Admin/Manager refresh
        const [st, sf, rl, gr, fl, cr, rm] = await Promise.all([
          getStudents(), getStaff(), getRoles(), getGroups(), getFields(), getCourses(), getRooms()
        ]);
        
        set({
          students: Array.isArray(st.data) ? st.data : [],
          staff: Array.isArray(sf.data) ? sf.data : [],
          roles: Array.isArray(rl.data) ? rl.data : [],
          groups: Array.isArray(gr.data) ? gr.data : [],
          fields: Array.isArray(fl.data) ? fl.data : [],
          courses: Array.isArray(cr.data) ? cr.data : [],
          rooms: Array.isArray(rm.data) ? rm.data : []
        });
      }
    } catch (e) {
      console.error('Error refreshing rows:', e);
    } finally {
      set({ loading: false });
    }
  }
}));

export default useStore;
