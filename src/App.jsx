import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Menu, BookOpen, VolumeX, Volume2, RotateCcw } from 'lucide-react';

// Import assets and data
import './App.css';
import ParetoLogoSVG from './assets/PSlogo.svg';
import scenarios from './data/standard.json';
import outcomes from './data/outcomes.json';
import doctrineData from './data/AJP10summary.json';
import i18n from './data/english.json'; // INTERNATIONALIZATION
import fracturingAudio from './assets/fracturing.mp3';
import neutralAudio from './assets/neutral.mp3';
import unityAudio from './assets/unity.mp3';

// Helper component to render text with embedded links
const TextWithLinks = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\[link: .*?\]\(.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = /\[link: (.*?)\]\((.*?)\)/.exec(part);
        if (match) {
          return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>;
        }
        return part;
      })}
    </>
  );
};

const TugOfWarBar = ({ value }) => {
  const percentage = ((value + 5) / 10) * 100;
  return (
    <div className="tug-of-war-container">
      <div className="tug-of-war-bar">
        <div className="bar-color-fill" style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}/>
        <div className="bar-marker" style={{ left: `${percentage}%` }}><div className="bar-marker-orb" /></div>
      </div>
      <div className="bar-labels">
        <span className="label-fragmentation">{i18n.fragmentationLabel}</span>
        <span className="label-neutral">{i18n.neutralLabel}</span>
        <span className="label-unity">{i18n.unityLabel}</span>
      </div>
      <div className="meter-value">{i18n.meterLabel} {value > 0 ? '+' : ''}{value}</div>
    </div>
  );
};

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function NarrativeFront() {
  const [screen, setScreen] = useState('start');
  const [round, setRound] = useState(0);
  const [meter, setMeter] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prebunkCharges, setPrebunkCharges] = useState(1);
  const [counterNarrativeCharges, setCounterNarrativeCharges] = useState(1);
  const [savedGameState, setSavedGameState] = useState(null);
  const [scenarioDeck, setScenarioDeck] = useState([]);

  const audioRefs = {
    fracturing: useRef(null),
    neutral: useRef(null),
    unity: useRef(null),
  };
  const [activeAudio, setActiveAudio] = useState('neutral');
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    audioRefs.fracturing.current = new Audio(fracturingAudio);
    audioRefs.neutral.current = new Audio(neutralAudio);
    audioRefs.unity.current = new Audio(unityAudio);
    Object.values(audioRefs).forEach(ref => {
      ref.current.loop = true;
      ref.current.volume = 0.4;
    });
  }, []);

  useEffect(() => {
    if (!userInteracted || isMuted || (screen !== 'game' && screen !== 'end')) {
        Object.values(audioRefs).forEach(ref => ref.current?.pause());
        return;
    }
  
    let targetAudio = 'neutral';
    if (meter <= -2) targetAudio = 'fracturing';
    else if (meter >= 2) targetAudio = 'unity';
  
    if (activeAudio !== targetAudio) {
      audioRefs[activeAudio].current?.pause();
      audioRefs[targetAudio].current?.play().catch(e => console.error("Audio play failed:", e));
      setActiveAudio(targetAudio);
    } else if (audioRefs[activeAudio].current?.paused) {
      audioRefs[activeAudio].current?.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [meter, screen, isMuted, userInteracted]);

  const startGame = () => {
    if (!userInteracted) setUserInteracted(true);
    setScenarioDeck(shuffleArray([...scenarios]));
    setScreen('game');
  }

  const resetGame = (goToBriefing = true) => {
    setRound(0);
    setMeter(0);
    setFeedback('');
    setShowFeedback(false);
    setPrebunkCharges(1);
    setCounterNarrativeCharges(1);
    setIsSettingsOpen(false);
    if (goToBriefing) {
      setScreen('briefing');
    } else {
      startGame();
    }
  };

  const handleChoice = (choiceKey) => {
    const currentScenario = scenarioDeck[round];
    const choiceProbabilities = currentScenario.probabilities[choiceKey];
    
    if (choiceKey === 'PRE_BUNK') setPrebunkCharges(c => c - 1);
    if (choiceKey === 'COUNTER_NARRATIVE') setCounterNarrativeCharges(c => c - 1);

    const [successThreshold, neutralThreshold, rewardChance, rewardType] = choiceProbabilities;
    const roll = Math.random();
    
    let outcomeType = (roll < successThreshold) ? 'SUCCESS' : (roll < neutralThreshold) ? 'NEUTRAL' : 'FAILURE';
    
    const possibleOutcomes = outcomes[choiceKey][outcomeType];
    const selectedOutcome = possibleOutcomes[Math.floor(Math.random() * possibleOutcomes.length)];
    
    const newMeter = Math.max(-5, Math.min(5, meter + selectedOutcome.shift));
    setMeter(newMeter);
    
    let finalFeedback = selectedOutcome.text;

    if (rewardType && Math.random() < rewardChance) {
      if(rewardType === 'PRE_BUNK') {
        setPrebunkCharges(c => c + 1);
        finalFeedback += ` ${i18n.rewardPreBunk}`;
      }
      if(rewardType === 'COUNTER_NARRATIVE') {
        setCounterNarrativeCharges(c => c + 1);
        finalFeedback += ` ${i18n.rewardCounterNarrative}`;
      }
    }
    
    setFeedback(finalFeedback);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (round < scenarioDeck.length - 1) {
      setRound(r => r + 1);
    } else {
      setScreen('end');
    }
  };

  const studyDoctrine = () => {
    setSavedGameState({ screen, round, meter, prebunkCharges, counterNarrativeCharges, scenarioDeck });
    setIsSettingsOpen(false);
    setScreen('doctrine');
  };

  const returnToGame = () => {
    if (savedGameState) {
      setScreen(savedGameState.screen);
      setRound(savedGameState.round);
      setMeter(savedGameState.meter);
      setPrebunkCharges(savedGameState.prebunkCharges);
      setCounterNarrativeCharges(savedGameState.counterNarrativeCharges);
      setScenarioDeck(savedGameState.scenarioDeck);
      setSavedGameState(null);
    } else {
      resetGame(false);
    }
  };

  const SettingsMenu = () => (
    <>
      <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)} />
      <div className="settings-menu">
        <h3 className="settings-title">{i18n.settingsTitle}</h3>
        <button className="button settings-button" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX/> : <Volume2/>} {isMuted ? i18n.settingsSoundOff : i18n.settingsSoundOn}
        </button>
        <button className="button settings-button" onClick={studyDoctrine}>
          <BookOpen/> {i18n.settingsStudy}
        </button>
        <button className="button settings-button" onClick={() => resetGame(true)}>
          <RotateCcw/> {i18n.settingsNewRun}
        </button>
      </div>
    </>
  );

  const renderScreen = () => {
    switch(screen) {
      case 'start':
        return (
          <div className="card start-card">
            <img src={ParetoLogoSVG} alt="Logo" className="logo" />
            <div className="brand-text">{i18n.presenter}</div>
            <div className="credit-text">{i18n.credits}</div>
            <div className="title-container"><h1 className="main-title">{i18n.appTitle}</h1></div>
            <div className="disclaimer-text">{i18n.disclaimer}</div>
            <button onClick={() => {setUserInteracted(true); setScreen('briefing');}} className="button primary-button">{i18n.swearButton}</button>
          </div>
        );

      case 'briefing':
        return (
          <div className="card briefing-card">
            <header className="card-header">
              <span/>
              <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
            </header>
            <p className="briefing-text"><TextWithLinks text={i18n.briefingText} /></p>
            <div className="choice-button-container">
              <button onClick={() => setScreen('doctrine')} className="button choice-button">{i18n.learnButton}</button>
              <button onClick={() => resetGame(false)} className="button choice-button primary-button">{i18n.trialsButton}</button>
            </div>
          </div>
        );

      case 'doctrine':
        return (
          <div className="card doctrine-card">
             <header className="card-header">
              <span/>
              <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
            </header>
            <div className="doctrine-content">{doctrineData.map((item, index) => {
              switch (item.type) {
                case 'title': return <h1 key={index} className="doctrine-title">{item.text}</h1>;
                case 'subtitle': return <h2 key={index} className="doctrine-subtitle">{item.text}</h2>;
                case 'heading': return <h3 key={index} className="doctrine-heading">{item.text}</h3>;
                case 'paragraph': return <p key={index} className="doctrine-paragraph">{item.text}</p>;
                case 'list': return <ul key={index} className="doctrine-list"> {item.items.map((li, i) => <li key={i}>{li}</li>)} </ul>;
                case 'definitions': return <dl key={index} className="doctrine-definitions">{item.items.map((def, i) => <div key={i}><dt>{def.term}</dt><dd>{def.def}</dd></div>)}</dl>;
                case 'final_paragraph': return <p key={index} className="doctrine-final-paragraph">{item.text}</p>;
                default: return null;
              }
            })}</div>
            <div className="doctrine-footer">
              <button onClick={savedGameState ? returnToGame : () => resetGame(false)} className="button primary-button">
                {savedGameState ? i18n.doctrineReturn : i18n.doctrineProceed}
              </button>
            </div>
          </div>
        );

      case 'end':
        let outcome, message, icon, colorClass;
        if (meter >= 3) { [outcome, message, icon, colorClass] = [i18n.endVictoryTitle, i18n.endVictoryMessage, <CheckCircle className="end-icon" />, "text-green"]; }
        else if (meter <= -3) { [outcome, message, icon, colorClass] = [i18n.endDefeatTitle, i18n.endDefeatMessage, <XCircle className="end-icon" />, "text-red"]; }
        else { [outcome, message, icon, colorClass] = [i18n.endNeutralTitle, i18n.endNeutralMessage, <AlertTriangle className="end-icon" />, "text-yellow"]; }
        return (
          <div className="card end-card">
            <div className={`end-icon-container ${colorClass}`}>{icon}</div>
            <h2 className={`end-title ${colorClass}`}>{outcome}</h2>
            <TugOfWarBar value={meter} />
            <p className="end-message">{message}</p>
            <div className="end-actions"><button onClick={() => resetGame(true)} className="button primary-button">{i18n.playAgainButton}</button></div>
          </div>
        );

      case 'game':
        if (!scenarioDeck.length) { return <div className="card">{i18n.loading}</div>; }
        const currentScenario = scenarioDeck[round];
        return (
          <div className="game-wrapper">
            {isSettingsOpen && <SettingsMenu />}
            <div className="game-content">
              <header className="game-header">
                <button className="settings-hamburger" onClick={() => setIsSettingsOpen(current => !current)}><Menu/></button>
                <div className="header-title-container"><Shield className="header-icon" /><span className="header-title">{i18n.appTitle}</span></div>
                <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
              </header>
              <div className="header-subtitle">{i18n.appSubtitle}</div>
              <TugOfWarBar value={meter} />
              <div className={`card-fader ${isSettingsOpen ? 'blurred' : ''}`}>
                {!showFeedback ? (
                  <div className="card scenario-card">
                    <div className="scenario-inject">
                      <div className="inject-icon-container"><AlertTriangle className="inject-icon" /></div>
                      <div className="inject-content">
                        <h3 className="inject-title">{i18n.roundLabel} {round + 1} – {i18n.adversaryInject}</h3>
                        <p className="inject-text">{currentScenario.inject}</p>
                      </div>
                    </div>
                    <div className="scenario-responses">
                      <h4 className="responses-title">{i18n.yourResponse}</h4>
                      <div className="responses-grid">{Object.keys(currentScenario.probabilities).map((key) => {
                        let isDisabled = (key === 'PRE_BUNK' && prebunkCharges === 0) || (key === 'COUNTER_NARRATIVE' && counterNarrativeCharges === 0);
                        return (
                          <button key={key} onClick={() => handleChoice(key)} className="button response-button" disabled={isDisabled}>
                            {key.replace('_', ' ')}
                            {key === 'PRE_BUNK' && ` (${prebunkCharges})`}
                            {key === 'COUNTER_NARRATIVE' && ` (${counterNarrativeCharges})`}
                          </button>
                        );
                      })}</div>
                    </div>
                  </div>
                ) : (
                  <div className="card feedback-card">
                    <h3 className="feedback-title">{i18n.outcomeTitle}</h3>
                    <p className="feedback-text">{feedback}</p>
                    <button onClick={handleNext} className="button primary-button full-width">
                      {round < scenarioDeck.length - 1 ? i18n.nextRoundButton : i18n.viewResultsButton}
                    </button>
                  </div>
                )}
              </div>
              <footer className="game-footer">{i18n.roundLabel} {round + 1} of {scenarioDeck.length}</footer>
            </div>
          </div>
        );

      default:
        return <div>Error: Unknown screen state.</div>
    }
  }

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}