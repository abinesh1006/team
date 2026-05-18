import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../components/HomePage';
import Admin from '../components/Admin';
import IntroScreen, { useIntroSeen } from '../components/IntroScreen';

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
          <Route index element={<HomePage />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </>
  );
}
