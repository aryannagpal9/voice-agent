import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Console from "./pages/Console";
import Dashboard from "./pages/Dashboard";
import CallEnded from "./components/CallEnded";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/console" element={<Console />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/call-ended/:sessionId" element={<CallEnded />} />
    </Routes>
  );
}

export default App;
