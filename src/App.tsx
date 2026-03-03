import { Route, Routes, useLocation } from 'react-router-dom';
import About from './pages/about';
import ApiDoc from './pages/api-doc';
import Home from './pages/home';
import { useEffect } from 'react';
import { routeConfig } from './lib/constants';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (routeConfig?.[location.pathname])
      document.title = routeConfig[location.pathname];
  }, [location]);

  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<About />} path="/about" />
      <Route element={<ApiDoc />} path="api/docs/:name" />
    </Routes>
  );
}
