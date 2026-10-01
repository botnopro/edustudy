import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ActiveCoursePage } from './pages/ActiveCoursePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { TeachersPage } from './pages/TeachersPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCourseStudioPage } from './pages/admin/AdminCourseStudioPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminCodesPage } from './pages/admin/AdminCodesPage';
import { AdminTeachersPage } from './pages/admin/AdminTeachersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminFaqPage } from './pages/admin/AdminFaqPage';

// Layout with Header and Footer for public pages
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/active-course" element={<ActiveCoursePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Management Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="courses/:id/studio" element={<AdminCourseStudioPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="codes" element={<AdminCodesPage />} />
            <Route path="teachers" element={<AdminTeachersPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="faqs" element={<AdminFaqPage />} />
          </Route>
        </Routes>

        {/* Global Auth Modal */}
        <AuthModal />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
