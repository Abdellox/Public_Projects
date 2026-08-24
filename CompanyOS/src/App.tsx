import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { StartHere } from "./pages/StartHere";
import { LessonPage } from "./pages/LessonPage";
import { GuidePage, HowCompaniesWork } from "./pages/Guides";
import { DepartmentsIndex, DepartmentPage } from "./pages/Departments";
import { FundamentalsIndex, FundamentalPage } from "./pages/Fundamentals";
import { RolesPage } from "./pages/RolesPage";
import { LifecyclePage } from "./pages/LifecyclePage";
import { ScenariosIndex, ScenarioPage } from "./pages/Scenarios";
import { GlossaryPage } from "./pages/GlossaryPage";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start-here" element={<StartHere />} />
          <Route path="/start-here/:slug" element={<LessonPage />} />
          <Route path="/how-companies-work" element={<HowCompaniesWork />} />
          <Route path="/how-companies-work/:slug" element={<GuidePage />} />
          <Route path="/departments" element={<DepartmentsIndex />} />
          <Route path="/departments/:slug" element={<DepartmentPage />} />
          <Route path="/fundamentals" element={<FundamentalsIndex />} />
          <Route path="/fundamentals/:slug" element={<FundamentalPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/lifecycle" element={<LifecyclePage />} />
          <Route path="/scenarios" element={<ScenariosIndex />} />
          <Route path="/scenarios/:slug" element={<ScenarioPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
