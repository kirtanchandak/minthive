import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NewTask from "./pages/NewTask";
import AppBar from "./components/AppBar";

function App() {
  return (
    <>
      <AppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/newTask" element={<NewTask />} />
      </Routes>
    </>
  );
}

export default App;
