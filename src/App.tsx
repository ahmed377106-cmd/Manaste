import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Cookies from "js-cookie";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import CoursesPage from "./pages/CoursesPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import WatchCoursePage from "./pages/WatchCoursePage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import OrdersPage from "./pages/OrdersPage";
import StudentsPage from "./pages/StudentsPage";
import ManagersPage from "./pages/ManagersPage";
import ProfilePage from "./pages/ProfilePage";
import { User } from "./utils/platformLogic";

function NotFoundPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center space-y-4"
    >
      <h1 className="text-3xl font-extrabold text-[#62ff00]">
        الصفحة غير موجودة
      </h1>
      <p className="text-sm text-slate-400 max-w-md">
        عذراً، الرابط الذي تحاول الوصول إليه غير متاح أو يتطلب صلاحيات خاصة.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-lg bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-sm transition-colors"
      >
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tokenState, setTokenState] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) {
      setUser(null);
      setTokenState(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setTokenState(true);
      } else {
        Cookies.remove("token");
        setUser(null);
        setTokenState(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setTokenState(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#62ff00] border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">جاري تحميل المنصة...</span>
        </div>
      </div>
    );
  }

  const isStaff =
    tokenState && user && (user.role === "Admin" || user.role === "Manager");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              tokenState={tokenState}
              onAuthChange={checkAuth}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              user={user}
              tokenState={tokenState}
              onAuthSuccess={checkAuth}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignUpPage
              user={user}
              tokenState={tokenState}
              onAuthSuccess={checkAuth}
            />
          }
        />
        <Route
          path="/courses"
          element={
            <CoursesPage
              user={user}
              tokenState={tokenState}
              onAuthChange={checkAuth}
            />
          }
        />
        <Route
          path="/courses/:id"
          element={
            <StudentCoursesPage
              user={user}
              tokenState={tokenState}
              onAuthChange={checkAuth}
            />
          }
        />
        <Route
          path="/watch/:id"
          element={
            <WatchCoursePage
              user={user}
              tokenState={tokenState}
              onAuthChange={checkAuth}
            />
          }
        />
        {tokenState && user && (
          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                tokenState={tokenState}
                onAuthChange={checkAuth}
              />
            }
          />
        )}
        {isStaff && (
          <>
            <Route
              path="/coursesdashboard"
              element={
                <AdminCoursesPage
                  user={user}
                  tokenState={tokenState}
                  onAuthChange={checkAuth}
                />
              }
            />
            <Route
              path="/orders"
              element={
                <OrdersPage
                  user={user}
                  tokenState={tokenState}
                  onAuthChange={checkAuth}
                />
              }
            />
            <Route
              path="/students"
              element={
                <StudentsPage
                  user={user}
                  tokenState={tokenState}
                  onAuthChange={checkAuth}
                />
              }
            />
            <Route
              path="/managers"
              element={
                <ManagersPage
                  user={user}
                  tokenState={tokenState}
                  onAuthChange={checkAuth}
                />
              }
            />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
