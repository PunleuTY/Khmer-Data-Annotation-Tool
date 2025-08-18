import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./navigations/Layout";
import Home  from "./pages/Home";
import Annotate from "./pages/Annotate";
import Result from "./pages/Result";
import Feature  from "./pages/Feature";
import About from "./pages/About";
import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        {/* All routes use the Layout component which includes the sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Annotate" element={<Annotate />} />
          <Route path="result" element={<Result />} />
          <Route path="feature" element={<Feature />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
    
  );
}

export default App;
