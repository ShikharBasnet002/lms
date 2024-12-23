import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Loading from "../Loading";
import { Edit, Trash2 } from "lucide-react"; // Updated icons

interface Teacher {
  id: string;
  name: string;
  email?: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  teachers?: Teacher[]; // teachers array to represent the instructors
  owner: {
    _id: string;
    name: string;
    role: string;
  };
  archived: boolean;
  students: { _id: string }[];
}

interface User {
  id: string;
  role: string;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchCurrentUser = () => {
    const userId = localStorage.getItem("id");
    const userRole = localStorage.getItem("role");
    if (userId && userRole) {
      setCurrentUser({ id: userId, role: userRole });
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/courses");
      setCourses(response.data.courses);
    } catch (err) {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) return;
    setLoadingAction(`enroll-${courseId}`);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? {
              ...course,
              students: [...course.students, { _id: currentUser.id }],
            }
            : course
        )
      );
    } catch (err) {
      setError("Failed to enroll in course.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOptOut = async (courseId: string) => {
    if (!currentUser) return;
    setLoadingAction(`optout-${courseId}`);
    try {
      await api.post(`/courses/${courseId}/optout`);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? {
              ...course,
              students: course.students.filter(
                (s) => s._id !== currentUser.id
              ),
            }
            : course
        )
      );
    } catch (err) {
      setError("Failed to opt-out of course.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleArchive = async (courseId: string) => {
    setLoadingAction(`archive-${courseId}`);
    try {
      await api.patch(`/courses/${courseId}/archive`, { archived: true });
      fetchCourses();
    } catch (err) {
      setError("Failed to archive course.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setLoadingAction("update-course");
    try {
      await api.put(`/courses/${editingCourse.id}`, {
        name: editingCourse.name,
        description: editingCourse.description,
        archived: editingCourse.archived,
      });
      fetchCourses();
      handleCloseModal();
    } catch (err) {
      setError("Failed to update course.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOpenModal = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-none">
        <div
          className="animate-spin inline-block size-10 border-[4px] border-current border-t-transparent text-sky-600 rounded-full dark:text-sky-500"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isStudent = currentUser?.role === "student";
          const isEnrolled = course.students.some(
            (student) => student._id === currentUser?.id
          );
          const instructors = course.teachers?.map((teacher) => teacher.name).join(", ") || "No instructors assigned"; // Combine instructors' names
          return (
            <div
              key={course.id}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between"
            >
              <div>
                <Link to={`/dashboard/coursedetails/${course.id}`} className="block">
                  <h2 className="text-xl font-semibold">{course.name}</h2>
                  <p className="text-gray-600 mt-2">{course.description}</p>
                </Link>
              </div>
                <p className="text-gray-500 mt-2">Instructor: {instructors}</p>
              <div className="mt-auto flex space-x-4 pt-4">
                {isStudent && (
                  <>
                    {!isEnrolled ? (
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center w-24"
                        onClick={() => handleEnroll(course.id)}
                        disabled={loadingAction === `enroll-${course.id}`}
                      >
                        {loadingAction === `enroll-${course.id}` ? (
                          <Loading />
                        ) : (
                          "Enroll"
                        )}
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center w-24"
                        onClick={() =>
                          window.confirm("Are you sure you want to opt-out?") &&
                          handleOptOut(course.id)
                        }
                        disabled={loadingAction === `optout-${course.id}`}
                      >
                        {loadingAction === `optout-${course.id}` ? (
                          <Loading />
                        ) : (
                          "Opt-Out"
                        )}
                      </button>
                    )}
                  </>
                )}
                {currentUser?.role === "admin" && (
                  <div className="flex space-x-2">
                    <button title="Edit Course"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                      onClick={() => handleOpenModal(course)}
                    >
                      <Edit />
                    </button>
                    <button
                      title="Archive"
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to archive this course?")) {
                          handleArchive(course.id);
                        }
                      }}
                      disabled={loadingAction === `archive-${course.id}`}
                    >
                      {loadingAction === `archive-${course.id}` ? (
                        <Loading />
                      ) : (
                        <Trash2 />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Edit Course</h2>
            <form onSubmit={handleUpdateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Course Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingCourse.name}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <input
                  type="text"
                  name="description"
                  value={editingCourse.description}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Archived</label>
                <input
                  type="checkbox"
                  name="archived"
                  checked={editingCourse.archived}
                  onChange={() =>
                    setEditingCourse({
                      ...editingCourse,
                      archived: !editingCourse.archived,
                    })
                  }
                  className="p-2"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center w-24"
                  disabled={loadingAction === "update-course"}
                >
                  {loadingAction === "update-course" ? <Loading /> : "Save"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-md flex items-center justify-center w-24"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
