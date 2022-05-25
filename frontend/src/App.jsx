import { Router, Route, Routes } from 'react-router-dom';
import AuthRouter from './routers/AuthRouter';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Loading</div>} />
      <Route path="/login/*" element={<AuthRouter/>} />
    </Routes>
  );
}

export default App;
