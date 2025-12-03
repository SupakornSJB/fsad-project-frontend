import {Routes, Route, BrowserRouter as Router} from 'react-router-dom';
import Layout from './components/Layout.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import ReportDetailPage from './pages/ReportDetailPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import UsersAdminPage from './pages/UsersAdminPage.tsx';
import AuditLogsPage from './pages/AuditLogsPage.tsx';
import HomePage from './pages/HomePage.tsx';
import RegisterPage from "./pages/RegisterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";

// Todo: add back the wildcard route for 404 page

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="admin/users" element={<UsersAdminPage />} />
          <Route path="admin/audit-logs" element={<AuditLogsPage />} />

          {/*<Route path="*" element={<Navigate to="/" replace />} />*/}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
