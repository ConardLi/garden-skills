import { useState, useEffect } from 'react';
import { Hero } from './components/hero/Hero';
import { CaseDetail } from './components/gallery/CaseDetail';
import { SkillsPage } from './components/skills/SkillsPage';
import { Workbench } from './components/skills/Workbench';
import { PromptStudio } from './components/prompt-studio/PromptStudio';
import { UiUxPromptStudio } from './components/prompt-studio/UiUxPromptStudio';
import { useRoute } from './lib/router';
import { cases } from './lib/data';
// import './App.css'; // Removed missing file

export function App() {
  const { route, navigate } = useRoute();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add light theme by default
    document.documentElement.setAttribute('data-theme', 'theme-paper');
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) return <div className="loading-screen">...</div>;

  return (
    <div className="app-container">
      {route.name === 'home' ? (
        <Hero navigate={navigate} />
      ) : route.name === 'case' ? (
        <CaseDetail id={route.id} navigate={navigate} />
      ) : route.name === 'skills' ? (
        <SkillsPage navigate={navigate} />
      ) : route.name === 'workbench' ? (
        <Workbench navigate={navigate} initialTemplateId={route.templateId} />
      ) : route.name === 'promptStudio' ? (
        <PromptStudio />
      ) : route.name === 'uiuxStudio' ? (
        <UiUxPromptStudio />
      ) : (
        <div className="error-page">
          <h2>找不到頁面</h2>
          <button onClick={() => navigate({ name: 'home' })}>回到首頁</button>
        </div>
      )}
      
      {/* Footer / Info */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="mono">GPT-IMAGE-2 PROMPT ENGINEERING WORKBENCH v0.1.0</p>
          <div className="footer-links">
            <span className="dot-link" onClick={() => navigate({ name: 'home' })}>HOME</span>
            <span className="dot-link" onClick={() => navigate({ name: 'skills' })}>SKILLS</span>
            <span className="dot-link" onClick={() => navigate({ name: 'workbench' })}>WORKBENCH</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

