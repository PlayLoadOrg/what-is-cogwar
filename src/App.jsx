import React, { useState, useRef, useEffect } from 'react';
import Intro from './components/Intro';
import PlayloadFooter from './components/PlayloadFooter';
import introMusicFile from './assets/IntroMusic.mp3';

function App() {
  console.log('🚀 App component rendering');
  
  const [gameStarted, setGameStarted] = useState(false);
  const audioRef = useRef(null);

  // Prevent body scrolling
  useEffect(() => {
    // Apply to both html and body
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  // This gets called from Intro when user clicks "I am human"
  const startMusic = () => {
    console.log('🎵 Starting music after human verification');
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      
      audioRef.current.play()
        .then(() => {
          console.log('🎵 Music playing successfully');
        })
        .catch(error => {
          console.log('🎵 Music play error:', error);
        });
    }
  };

  const handleStart = () => {
    console.log('🎮 Game starting');
    setGameStarted(true);
    // Optionally stop music here
    // audioRef.current?.pause();
  };

  return (
    <div className="App">
      <audio ref={audioRef} src={introMusicFile} preload="auto" />
      
      {!gameStarted ? (
        <Intro onStart={handleStart} onHumanVerified={startMusic} />
      ) : (
        <>
          <div style={{
            width: '100vw',
            minHeight: '100vh',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              Game content goes here...
            </h1>
          </div>
          <PlayloadFooter />
        </>
      )}
    </div>
  );
}

export default App;