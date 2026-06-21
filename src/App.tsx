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
    <div id="root-inner">
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
