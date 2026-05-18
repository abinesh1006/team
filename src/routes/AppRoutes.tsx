import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import Dream11 from '../components/Dream11';
import TeamLeaderboard from '../components/TeamLeaderboard';
import Admin from '../components/Admin';
import IntroScreen, { useIntroSeen } from '../components/IntroScreen';
import Chess from '../components/games/Chess';
import Carrom from '../components/games/Carrom';
import Badminton from '../components/games/Badminton';

export default function AppRoutes() {
  const alreadySeen = useIntroSeen();
  const [introDone, setIntroDone] = useState(alreadySeen);

  return (
    <>
      {!introDone && (
        <IntroScreen onDone={() => setIntroDone(true)} />
      )}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dream11" element={<Dream11 />} />
          <Route path="teams" element={<TeamLeaderboard />} />
          <Route path="admin" element={<Admin />} />
          <Route path="chess" element={<Chess />} />
          <Route path="carrom" element={<Carrom />} />
          <Route path="badminton" element={<Badminton />} />
        </Route>
      </Routes>
    </>
  );
}
