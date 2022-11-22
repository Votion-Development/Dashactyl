import { StrictMode } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';

function App() {
  return (
    <StrictMode>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </StrictMode>
  );
}

export default App;
