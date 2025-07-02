import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AuthGuard from './components/AuthGuard';
import { AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Go-Pocket
          </Typography>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Route */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Add other authenticated routes here */}
        </Route>

        {/* Default Route */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
