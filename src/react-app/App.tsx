import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth';
import { LangProvider } from './i18n';
import { Header } from './components/Header';
import { AuthProtect } from './components/AuthProtect';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateWizardPage } from './pages/CreateWizardPage';
import { ReaderPage } from './pages/ReaderPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/share/:id" element={<ReaderPage shared />} />
            <Route path="/app" element={<AuthProtect><DashboardPage /></AuthProtect>} />
            <Route path="/create" element={<AuthProtect><CreateWizardPage /></AuthProtect>} />
            <Route path="/book/:id" element={<AuthProtect><ReaderPage /></AuthProtect>} />
            {/* Hidden owner-only credits dashboard — backend 404s for everyone else */}
            <Route path="/admin" element={<AuthProtect><AdminPage /></AuthProtect>} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  );
}
