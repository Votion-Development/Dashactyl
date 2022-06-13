import { Route, Routes } from 'react-router-dom';

import AuthRouter from './Routers/AuthRouter';
import DashboardRouter from './Routers/DashboardRouter';

import Login from './Pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Loading</div>} />
      <Route path="/auth/*" element={<AuthRouter />} />
      <Route path="/dashboard/*" element={<DashboardRouter />} />
    </Routes>
  );
}

export default App;
