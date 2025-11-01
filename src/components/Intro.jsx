import React, { useState, useEffect } from 'react';
import PlayloadFooter from './PlayloadFooter';

const Intro = ({ onStart, onHumanVerified }) => {
  const [humanVerified, setHumanVerified] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [emojiMood, setEmojiMood] = useState('happy');
  const [animationKey, setAnimationKey] = useState(0);

  const happyEmojis = ['👍', '❤️', '😊', '😍', '🔥', '✨', '💯', '🎉'];
  const sadEmojis = ['😢', '😰', '😨', '😱', '💔', '😞'];
  const angryEmojis = ['😡', '😠', '🤬', '💢', '😤'];

  const getRandomEmoji = () => {
    if (emojiMood === 'happy') {
      return happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
    } else if (emojiMood === 'slightly-mixed') {
      // 80% happy, 20% negative
      if (Math.random() < 0.8) {
        return happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
      }
      return [...sadEmojis, ...angryEmojis][Math.floor(Math.random() * (sadEmojis.length + angryEmojis.length))];
    } else if (emojiMood === 'mixed') {
      // 50% happy, 50% negative
      if (Math.random() < 0.5) {
        return happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
      }
      return [...sadEmojis, ...angryEmojis][Math.floor(Math.random() * (sadEmojis.length + angryEmojis.length))];
    } else if (emojiMood === 'mostly-negative') {
      // 25% happy, 75% negative
      if (Math.random() < 0.25) {
        return happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
      }
      return [...sadEmojis, ...angryEmojis][Math.floor(Math.random() * (sadEmojis.length + angryEmojis.length))];
    } else if (emojiMood === 'very-negative') {
      // 10% happy, 90% negative
      if (Math.random() < 0.1) {
        return happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
      }
      return [...sadEmojis, ...angryEmojis][Math.floor(Math.random() * (sadEmojis.length + angryEmojis.length))];
    } else {
      // Almost all angry and sad
      const negativeEmojis = [...sadEmojis, ...angryEmojis, ...angryEmojis];
      return negativeEmojis[Math.floor(Math.random() * negativeEmojis.length)];
    }
  };

  // Show content after human verification
  useEffect(() => {
    if (humanVerified) {
      setTimeout(() => setShowContent(true), 300);
    }
  }, [humanVerified]);

  // Gradual mood transition timeline
  useEffect(() => {
    if (!humanVerified) return;

    const timers = [];
    
    timers.push(setTimeout(() => {
      setEmojiMood('slightly-mixed');
    }, 3000));
    
    timers.push(setTimeout(() => {
      setEmojiMood('mixed');
    }, 7000));
    
    timers.push(setTimeout(() => {
      setEmojiMood('mostly-negative');
    }, 11000));
    
    timers.push(setTimeout(() => {
      setEmojiMood('very-negative');
    }, 15000));
    
    timers.push(setTimeout(() => {
      setEmojiMood('negative');
    }, 19000));

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [humanVerified, animationKey]);

  // Generate floating emojis continuously
  useEffect(() => {
    if (!humanVerified) return;
    
    const interval = setInterval(() => {
      const drift = (Math.random() - 0.5) * 100;
      const newEmoji = {
        id: Date.now() + Math.random(),
        emoji: getRandomEmoji(),
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 4 + Math.random() * 2,
        size: 30 + Math.random() * 30,
        drift: drift
      };
      
      setFloatingEmojis(prev => [...prev, newEmoji]);
      
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
      }, (newEmoji.duration + newEmoji.delay) * 1000);
    }, 300);

    return () => clearInterval(interval);
  }, [emojiMood, humanVerified, animationKey]);

  const handleHumanClick = () => {
    setHumanVerified(true);
    if (onHumanVerified) {
      onHumanVerified();
    }
  };

  const handleStartClick = () => {
    setEmojiMood('happy');
    setFloatingEmojis([]);
    setAnimationKey(prev => prev + 1);
  };

  // Show "I am human" verification first
  if (!humanVerified) {
    return (
      <>
        <div style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #dbeafe 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}>
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '1rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{
              fontSize: '1.5rem',
              color: '#4b5563',
              marginBottom: '2rem'
            }}>
              Click below to verify you're human
            </p>
            
            <button
              onClick={handleHumanClick}
              style={{
                padding: '1.25rem 3rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#2563eb';
              }}
            >
              ✓ I am human
            </button>
          </div>
        </div>
        <PlayloadFooter />
      </>
    );
  }

  // Main intro screen with floating emojis
  return (
    <>
      <div style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #dbeafe 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem 3rem 1rem',
        gap: '3rem',
        opacity: showContent ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        margin: 0
      }}>
      {/* Floating emojis */}
      {floatingEmojis.map(emoji => (
        <div
          key={emoji.id}
          style={{
            position: 'absolute',
            left: `${emoji.x}%`,
            bottom: '-10%',
            fontSize: `${emoji.size}px`,
            pointerEvents: 'none',
            animation: `floatUpSmooth ${emoji.duration}s ease-out ${emoji.delay}s forwards`,
            '--drift-x': `${emoji.drift}px`
          }}
        >
          {emoji.emoji}
        </div>
      ))}

      {/* Single static keyframe animation */}
      <style>{`
        @keyframes floatUpSmooth {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110vh) translateX(var(--drift-x, 0px));
            opacity: 0;
          }
        }
      `}</style>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(3rem, 10vw, 8rem)',
        fontWeight: 'bold',
        color: '#312e81',
        letterSpacing: '-0.025em',
        textAlign: 'center',
        filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
        zIndex: 10,
        margin: 0
      }}>
        What Is COGWAR?
      </h1>
      
      {/* Button container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 10
      }}>
        <button
          onClick={handleStartClick}
          style={{
            padding: '1.25rem 4rem',
            backgroundColor: '#2563eb',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.backgroundColor = '#1d4ed8';
            e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
          }}
        >
          START
        </button>
        
        <a
          href="https://www.act.nato.int/activities/cognitive-warfare/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#4338ca',
            fontSize: '1.125rem',
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#312e81';
            e.target.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#4338ca';
            e.target.style.textDecoration = 'none';
          }}
        >
          Releasing in NATO Perception Summer 2026
        </a>
      </div>
    </div>
    <PlayloadFooter />
    </>
  );
};

export default Intro;