import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import AuthCallback from "@/components/AuthCallback";

function AppRouter() {
  const location = useLocation();
  // Check for session_id in URL fragment synchronously (before ProtectedRoute runs)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
