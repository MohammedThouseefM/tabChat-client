import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './pages/Layout';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import CreatePost from './pages/CreatePost';
import Loader from './components/Loader';

// Protected Route Wrapper (Inline definition restored)
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  // Loading is handled globally in AppRoutes now, but safety check:
  return user ? children : <Navigate to="/" />;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users/:userId" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
