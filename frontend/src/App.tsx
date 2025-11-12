import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import AIGenerate from './pages/AIGenerate';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Analytics from './pages/Analytics';
import Scheduler from './pages/Scheduler';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter basename="/JobCrawl">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="jobs" element={<JobsList />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="ai-generate" element={<AIGenerate />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="scheduler" element={<Scheduler />} />
          <Route path="settings" element={<Settings />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
