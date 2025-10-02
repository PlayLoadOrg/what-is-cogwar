import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Import assets and data
import './App.css';
import ParetoLogoSVG from './assets/PSlogo.svg';
import scenarios from './scenarios/citizen.json';

const TugOfWarBar = ({ value }) => {
  // Percentage maps the value -5 to +5 onto a 0% to 100% scale. This is correct.
  const percentage = ((value + 5) / 10) * 100;

  return (
    <div className="tug-of-war-container">
      <div className="tug-of-war-bar">
        {/* This is the new color fill layer. */}
        {/* We use a clip-path to reveal it from left to right based on the score. */}
        <div 
          className="bar-color-fill"
          style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
        />
        
        {/* The marker's logic remains the same. */}
        <div 
          className="bar-marker"
          style={{ left: `${percentage}%` }}
        >
          <div className="bar-marker-orb" />
        </div>
      </div>
      <div className="bar-labels">
        <span className="label-fragmentation">FRAGMENTATION</span>
        <span className="label-neutral">NEUTRAL</span>
        <span className="label-unity">UNITY</span>
      </div>
      <div className="meter-value">
        Meter: {value > 0 ? '+' : ''}{value}
      </div>
    </div>
  );
};


export default function NarrativeFront() {
  const [screen, setScreen] = useState('start');
  const [round, setRound] = useState(0);
  const [meter, setMeter] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleChoice = (choice) => {
    const scenario = scenarios[round];
    const response = scenario.responses[choice];
    
    const newMeter = Math.max(-5, Math.min(5, meter + response.shift));
    setMeter(newMeter);
    setFeedback(response.feedback);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (round < scenarios.length - 1) {
      setRound(round + 1);
    } else {
      setScreen('end');
    }
  };

  const resetGame = () => {
    setScreen('start');
    setRound(0);
    setMeter(0);
    setFeedback('');
    setShowFeedback(false);
  };

  if (screen === 'start') {
    return (
      <div className="app-container start-screen">
        <div className="card start-card">
          <img src={ParetoLogoSVG} alt="Pareto Syndicate Logo" className="logo" />
          
          <div className="brand-text">Pareto Syndicate Presents</div>
          <div className="credit-text">With special thanks to NATO Cognitive Warfare Division</div>
          
          <div className="title-container">
            <h1 className="main-title">NARRATIVE FRONT</h1>
          </div>
          
          <div className="disclaimer-text">
            I commit to use the following material for the protection of the Common Good in alignment with the Declaration of Human Rights, the UN Charter, and in accordance with the treaties and agreements of my country of residence.
          </div>
          
          <button onClick={() => setScreen('game')} className="button primary-button">
            This I Swear
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'end') {
    let outcome, message, icon, colorClass;
    
    if (meter >= 3) {
      outcome = "RESILIENT VICTORY";
      message = "The population remained resilient. Allies stood united, operations continued unhindered, and adversary attempts to destabilize perception failed. Maintaining trust and cohesion is itself a decisive victory.";
      icon = <CheckCircle className="end-icon" />;
      colorClass = "text-green";
    } else if (meter <= -3) {
      outcome = "COGNITIVE DEFEAT";
      message = "Misinformation fractured alliances. Public support collapsed, leaders faced internal doubt, and adversary narratives gained dominance. Military options were constrained before the first shot was fired.";
      icon = <XCircle className="end-icon" />;
      colorClass = "text-red";
    } else {
      outcome = "FRAGILE STABILITY";
      message = "Adversary attempts created turbulence, but resilience held just enough to prevent collapse. Operations moved forward, though at a cost. Cognitive battles are ongoing; vigilance must be constant.";
      icon = <AlertTriangle className="end-icon" />;
      colorClass = "text-yellow";
    }

    return (
      <div className="app-container end-screen">
        <div className="card end-card">
          <div className={`end-icon-container ${colorClass}`}>
            {icon}
          </div>
          <h2 className={`end-title ${colorClass}`}>{outcome}</h2>
          <TugOfWarBar value={meter} />
          <p className="end-message">{message}</p>
          <div className="end-actions">
            <button onClick={resetGame} className="button primary-button">
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[round];

  return (
    <div className="app-container game-screen">
      <div className="game-content">
        <header className="game-header">
          <div className="header-title-container">
            <Shield className="header-icon" />
            <span className="header-title">NARRATIVE FRONT</span>
          </div>
          <div className="header-subtitle">
            NATO-led peacekeeping exercise in Eastern Europe
          </div>
        </header>

        <TugOfWarBar value={meter} />

        {!showFeedback ? (
          <div className="card scenario-card">
            <div className="scenario-inject">
              <div className="inject-icon-container">
                <AlertTriangle className="inject-icon" />
              </div>
              <div className="inject-content">
                <h3 className="inject-title">
                  Round {currentScenario.round} – Adversary Inject
                </h3>
                <p className="inject-text">{currentScenario.inject}</p>
              </div>
            </div>

            <div className="scenario-responses">
              <h4 className="responses-title">Your Response:</h4>
              <div className="responses-grid">
                {Object.entries(currentScenario.responses).map(([key, response]) => (
                  <button
                    key={key}
                    onClick={() => handleChoice(parseInt(key))}
                    className="button response-button"
                  >
                    {response.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card feedback-card">
            <h3 className="feedback-title">Outcome</h3>
            <p className="feedback-text">{feedback}</p>
            <button onClick={handleNext} className="button primary-button full-width">
              {round < scenarios.length - 1 ? 'Next Round' : 'View Results'}
            </button>
          </div>
        )}

        <footer className="game-footer">
          Round {round + 1} of {scenarios.length}
        </footer>
      </div>
    </div>
  );
}