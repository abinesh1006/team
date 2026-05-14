import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import TeamLeaderboard from '../components/TeamLeaderboard';
import Schedule from '../components/Schedule';
import Rules from '../components/Rules';
import Admin from '../components/Admin';
import IntroScreen, { useIntroSeen } from '../components/IntroScreen';
import { useQuotes } from '../hooks/useData';

export default function AppRoutes() {
  const alreadySeen = useIntroSeen();
  const [introDone, setIntroDone] = useState(alreadySeen);
  useQuotes(); // preload quotes.json into browser cache for Dashboard

  return (
    <>
      {!introDone && (
        <IntroScreen onDone={() => setIntroDone(true)} />
      )}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="teams" element={<TeamLeaderboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="rules" element={<Rules />} />
          <Route path="rules/:gameId" element={<Rules />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </>
  );
}
