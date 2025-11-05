import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import AIGenerate from './pages/AIGenerate';
import Applications from './pages/Applications';

function App() {
  return (
    <BrowserRouter basename="/JobCrawl">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="jobs" element={<JobsList />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="ai-generate" element={<AIGenerate />} />
          <Route path="applications" element={<Applications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
