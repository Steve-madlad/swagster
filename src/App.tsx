import { Route, Routes } from 'react-router-dom';
import About from './pages/about';
import ApiDoc from './pages/api-doc';
import Home from './pages/home';

export default function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<About />} path="/about" />
      <Route element={<ApiDoc />} path="api/docs/:name" />
    </Routes>
  );
}
