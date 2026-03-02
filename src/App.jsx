import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import TopBar from './components/TopBar';
import Nav from './components/Nav';
import ContextHeader from './components/ContextHeader';
import ProofFooter from './components/ProofFooter';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Saved from './pages/Saved';
import Digest from './pages/Digest';
import Settings from './pages/Settings';
import Proof from './pages/Proof';
import NotFound from './pages/NotFound';
import TestChecklist from './pages/TestChecklist';
import ShipLock from './pages/ShipLock';
import { TestChecklistProvider } from './context/TestChecklistContext';

const ROUTES = {
  '/': {
    headerTitle: 'Stop Missing The Right Jobs.',
    headerSubtitle:
      'Precision-matched job discovery delivered daily at 9AM.',
    component: Landing,
  },
  '/dashboard': {
    headerTitle: 'Dashboard',
    headerSubtitle:
      'Browse and filter jobs. Save roles you want to revisit.',
    component: Dashboard,
  },
  '/saved': {
    headerTitle: 'Saved',
    headerSubtitle:
      "Jobs you've saved for later. They persist across sessions.",
    component: Saved,
  },
  '/digest': {
    headerTitle: 'Digest',
    headerSubtitle:
      'Your daily 9AM summary of top jobs, personalized by your preferences.',
    component: Digest,
  },
  '/settings': {
    headerTitle: 'Settings',
    headerSubtitle:
      'Define how job notifications should behave.',
    component: Settings,
  },
  '/proof': {
    headerTitle: 'Proof',
    headerSubtitle:
      'A placeholder space for artifacts that demonstrate how your notification system behaves.',
    component: Proof,
  },
  '/jt/07-test': {
    headerTitle: 'Test Checklist',
    headerSubtitle: 'Built-in test verification before shipping.',
    component: TestChecklist,
  },
  '/jt/08-ship': {
    headerTitle: 'Ship',
    headerSubtitle: 'Complete all tests before shipping.',
    component: ShipLock,
  },
};

function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const route = ROUTES[pathname] || {
    headerTitle: 'Page Not Found',
    headerSubtitle: 'The page you are looking for does not exist.',
    component: NotFound,
  };

  const PageComponent = route.component;
  const isJobs = pathname === '/dashboard' || pathname === '/saved';
  const isDigest = pathname === '/digest';
  const isTestPage = pathname === '/jt/07-test' || pathname === '/jt/08-ship';
  const showPlaceholder = !isJobs && !isDigest && !isTestPage;

  return (
    <div className="layout-shell">
      <TopBar />
      <Nav />
      <ContextHeader title={route.headerTitle} subtitle={route.headerSubtitle} />
      <div className="workspace">
        <div className="workspace__primary">
          {showPlaceholder && <PageComponent />}
          {isJobs && <PageComponent />}
          {isDigest && <PageComponent />}
          {isTestPage && <PageComponent />}
        </div>
        <div className="workspace__secondary" />
      </div>
      <ProofFooter />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <TestChecklistProvider>
          <Routes>
            <Route path="*" element={<AppLayout />} />
          </Routes>
        </TestChecklistProvider>
      </ToastProvider>
    </AppProvider>
  );
}
