import { Router, Route, Routes } from 'react-router-dom';
import AuthRouter from './routers/AuthRouter';
import DashboardRouter from './routers/DashboardRouter';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Loading</div>} />
      <Route path="/auth/*" element={<AuthRouter/>} />
      <Route path="/dashboard/*" element={<DashboardRouter/>} />
    </Routes>
  );
}

export default App;
