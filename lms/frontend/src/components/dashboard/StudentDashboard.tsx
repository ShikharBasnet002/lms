import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import ProfileManagement from "../ProfileManagement";
import Information from "../Information";
import { useAuth } from "../../context/AuthContext";
import Courses from "../Course/CourseList";
import CourseForm from "../Course/CourseForm";

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="student" />
      <div className="flex-1">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Student Dashboard
            </h1>
          </div>
        </header>
        <Routes>
          {/* emeraldirect to info if the user visits /dashboard */}
          <Route path="/" element={<Navigate to="info" replace />} />
          <Route path="/profile" element={<ProfileManagement />} />
          <Route path="/info" element={<Information />} />
          <Route path="courses/list" element={<Courses />} />
            <Route
              path="courses/add"
              element={<CourseForm onClose={() => {}} />}
            />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
