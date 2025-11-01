import React, { useState, useRef } from 'react';
import Intro from './components/Intro';
import introMusicFile from './assets/IntroMusic.mp3';

function App() {
  console.log('🚀 App component rendering');
  
  const [gameStarted, setGameStarted] = useState(false);
  const audioRef = useRef(null);

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
        <div style={{
          width: '100%',
          minHeight: '100vh',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            Game content goes here...
          </h1>
        </div>
      )}
    </div>
  );
}

export default App;