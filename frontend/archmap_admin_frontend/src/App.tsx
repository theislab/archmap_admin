import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import AtlasPage from "./atlas/AtlasPage";
import AtlasDetailsPage from "./atlas/AtlasDetailsPage";
import SignIn from "./login/SignIn";
import AdminPanel from "./panel/AdminPanel";

import PageLayout from "./PageLayout";
import SignUpForm from "./login/Signup";
import Header from "./reusables/Header";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<PageLayout />}>
            <Route index element={<AtlasPage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/atlas/:id" element={<AtlasDetailsPage />} />
            <Route path="/signup" element={<SignUpForm />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
