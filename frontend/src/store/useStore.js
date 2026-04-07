import { create } from 'zustand';

const useStore = create((set) => ({
  // Core Data
  students: [],
  staff: [],
  roles: [],
  groups: [],
  fields: [],
  courses: [],
  rooms: [],
  
  // Setters with safety checks
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
}));

export default useStore;
