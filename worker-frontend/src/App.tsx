import "./App.css";
import { Route, Routes } from "react-router-dom";
import AppBar from "./components/AppBar";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <>
      <AppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </>
  );
}

export default App;
