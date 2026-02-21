import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import About from './pages/about';
import ApiDoc from './pages/api-doc';

export default function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<About />} path="/about" />
      <Route element={<ApiDoc />} path="api/docs/:name" />
    </Routes>
  );
}
