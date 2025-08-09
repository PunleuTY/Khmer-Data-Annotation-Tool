import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./navigations/Layout";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Result from "./pages/Result";
import Report from "./pages/Report";
import About from "./pages/About";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* All routes use the Layout component which includes the sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="upload" element={<Upload />} />
          <Route path="result" element={<Result />} />
          <Route path="report" element={<Report />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
    
  );
}

export default App;
