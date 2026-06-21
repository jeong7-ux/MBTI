import { useState, useEffect } from 'react';
import Intro from './pages/Intro';
import Test from './pages/Test';
import Result from './pages/Result';
import { deserializeResult } from './types';
import type { UserResult } from './types';


type ViewState = 'intro' | 'test' | 'result';

function App() {
  const [view, setView] = useState<ViewState>('intro');
  const [nickname, setNickname] = useState('');
  const [result, setResult] = useState<UserResult | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [bgTheme, setBgTheme] = useState('');

  // 1. Check for shared state in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateHash = params.get('state');

    if (stateHash) {
      const decodedResult = deserializeResult(stateHash);
      if (decodedResult) {
        setNickname(decodedResult.nickname);
        setResult(decodedResult);
        setIsSharedView(true);
        setView('result');
      }
    }
  }, []);

  // 2. Set adaptive gradient theme based on current time
  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      let themeGradient = '';

      if (hour >= 6 && hour < 9) {
        // Morning Bloom
        themeGradient = 'linear-gradient(135deg, #FFF5F7 0%, #FFE4EB 50%, #FFF0E5 100%)';
      } else if (hour >= 9 && hour < 17) {
        // Day Light
        themeGradient = 'linear-gradient(135deg, #FAFAFE 0%, #F4F4F8 100%)';
      } else if (hour >= 17 && hour < 21) {
        // Golden Hour
        themeGradient = 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 50%, #FFF0F5 100%)';
      } else {
        // Night Garden
        themeGradient = 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #1E1535 100%)';
      }
      setBgTheme(themeGradient);
    };

    updateTheme();
    // Check every minute
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTest = (name: string) => {
    setNickname(name);
    setView('test');
  };

  const handleCompleteTest = (mbtiType: string, scores: number[]) => {
    const newResult: UserResult = {
      nickname,
      type: mbtiType,
      scores
    };
    
    // Save to state & local storage
    setResult(newResult);
    setIsSharedView(false);
    localStorage.setItem('bloom_mbti_result', JSON.stringify(newResult));
    setView('result');
  };

  const handleViewSavedResult = (saved: UserResult) => {
    setNickname(saved.nickname);
    setResult(saved);
    setIsSharedView(false);
    setView('result');
  };

  const handleRestart = () => {
    // If we were on a shared view, clear url query parameters to restart fresh
    if (isSharedView) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setNickname('');
    setResult(null);
    setIsSharedView(false);
    setView('intro');
  };

  return (
    <div id="root" style={{ background: bgTheme }}>
      {view === 'intro' && (
        <Intro 
          onStart={handleStartTest} 
          onViewSavedResult={handleViewSavedResult} 
        />
      )}
      
      {view === 'test' && (
        <Test 
          nickname={nickname} 
          onComplete={handleCompleteTest} 
          onBack={handleRestart} 
        />
      )}
      
      {view === 'result' && result && (
        <Result 
          nickname={result.nickname}
          mbtiType={result.type}
          scores={result.scores}
          isSharedView={isSharedView}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
