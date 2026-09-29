
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import Assignments from './pages/Assignments'
import TeacherAssignments from './pages/TeacherAssignments'
import Profile from './pages/Profile'
import TeacherProfile from './pages/TeacherProfile'
import Classrooms from './pages/Classrooms'
import StudentClassrooms from './pages/StudentClassrooms'
import ClassroomDetails from './pages/ClassroomDetails'
import ClassroomAssignments from './pages/ClassroomAssignments'
import AssignmentDetails from './pages/AssignmentDetails'
import Doubts from './pages/Doubts'
import TeacherChat from './pages/TeacherChat'
import StudentGroupChat from './pages/StudentGroupChat'
import TeacherChats from './pages/TeacherChats'
import TeacherPrivateChat from './pages/TeacherPrivateChat'

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route
                    path="/teacher-dashboard"
                    element={<TeacherDashboard />}
                />

                <Route
                    path="/assignments"
                    element={<Assignments />}
                />

                <Route
                    path="/teacher-assignments"
                    element={<TeacherAssignments />}
                />

                <Route
                    path="/assignments/:id"
                    element={<AssignmentDetails />}
                />

                <Route
                    path="/classrooms"
                    element={<Classrooms />}
                />

                <Route
                    path="/student-classrooms"
                    element={<StudentClassrooms />}
                />

                <Route
                    path="/classrooms/:id"
                    element={<ClassroomDetails />}
                />

                <Route
                    path="/classrooms/:id/assignments"
                    element={<ClassroomAssignments />}
                />

                {/* Student Profile */}
                <Route
                    path="/profile"
                    element={<Profile />}
                />

                {/* Teacher Profile */}
                <Route
                    path="/teacher-profile"
                    element={<TeacherProfile />}
                />

                <Route
                    path="/doubts"
                    element={<Doubts />}
                />

                <Route
                    path="/doubts/:classroomId/teacher"
                    element={<TeacherChat />}
                />

                <Route
                    path="/doubts/:classroomId/students"
                    element={<StudentGroupChat />}
                />

                <Route
                    path="/teacher-chats"
                    element={<TeacherChats />}
                />

                <Route
                    path="/teacher-chats/:id"
                    element={<TeacherPrivateChat />}
                />

            </Routes>
        </BrowserRouter>
    )
}

export default App

