import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, deleteStudent } from './api';

function App() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await createStudent(newStudent);
      setNewStudent({ name: '', email: '', phone: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#08060d] text-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#110e1a] border-r border-gray-800 p-6 flex flex-col gap-8">
        <div className="text-2xl font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">U</span>
          </div>
          UITS CRM
        </div>
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary font-medium transition-all">
            Dashboard
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-gray-100 transition-all">
            Groups
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-100 font-medium transition-all">
            Students
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-gray-100 transition-all">
            Payments
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-gray-100 transition-all">
            Staff
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-[#110e1a]/50 backdrop-blur-md border-b border-gray-800 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-semibold">Student Management</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Welcome, Administrator</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#110e1a] flex items-center justify-center text-xs font-bold text-white">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Students', value: students.length, color: 'text-blue-400' },
              { label: 'Active Groups', value: '12', color: 'text-green-400' },
              { label: 'Pending Payments', value: '$450', color: 'text-red-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#110e1a] p-6 rounded-2xl border border-gray-800 hover:border-primary/30 transition-all group">
                <div className="text-sm text-gray-400 mb-2 truncate">{stat.label}</div>
                <div className={`text-3xl font-bold ${stat.color} group-hover:scale-105 transition-transform`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student List */}
            <div className="lg:col-span-2 bg-[#110e1a] rounded-2xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Students List</h2>
                <div className="text-sm text-gray-400">{students.length} students found</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs text-gray-500 uppercase border-b border-gray-800">
                    <tr>
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Email</th>
                      <th className="pb-4">Phone</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {students.map((student) => (
                      <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 font-medium text-gray-200">{student.name}</td>
                        <td className="py-4 text-gray-400">{student.email}</td>
                        <td className="py-4 text-gray-400">{student.phone}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-gray-500 italic">
                          No students enrolled yet. Add your first student to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Student Form */}
            <div className="bg-[#110e1a] rounded-2xl border border-gray-800 p-6 h-fit sticky top-28">
              <h2 className="text-lg font-medium mb-6">Add New Student</h2>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full bg-[#08060d] border border-gray-800 rounded-xl px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full bg-[#08060d] border border-gray-800 rounded-xl px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full bg-[#08060d] border border-gray-800 rounded-xl px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl mt-4 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
                >
                  Register Student
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
