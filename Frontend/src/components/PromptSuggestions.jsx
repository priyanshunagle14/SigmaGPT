import React from 'react';
import './PromptSuggestions.css';

const SUGGESTIONS = [
  {
    icon: '💡',
    title: 'Brainstorm ideas',
    subtitle: 'for a modern web application or startup concept',
    prompt: 'Give me 3 innovative ideas for a full-stack SaaS product in 2025.',
  },
  {
    icon: '💻',
    title: 'Explain code',
    subtitle: 'or help debug a tricky algorithm or bug',
    prompt: 'Explain the difference between JWT and session-based authentication with pros and cons.',
  },
  {
    icon: '✍️',
    title: 'Draft content',
    subtitle: 'like emails, blog posts, or cover letters',
    prompt: 'Help me draft a professional cover letter for a Full Stack Developer role.',
  },
  {
    icon: '🧠',
    title: 'Learn a topic',
    subtitle: 'from quantum computing to distributed systems',
    prompt: 'Explain how Large Language Models work in simple, intuitive terms.',
  },
];

export function PromptSuggestions({ onSelectPrompt }) {
  return (
    <div className="promptSuggestionsContainer">
      <div className="suggestionsHeader">
        <h2>What can I help you with today?</h2>
        <p className="suggestionsSubtitle">Choose a prompt below or start typing your own question.</p>
      </div>

      <div className="suggestionsGrid">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            className="suggestionCard"
            onClick={() => onSelectPrompt(item.prompt)}
          >
            <span className="cardIcon">{item.icon}</span>
            <div className="cardText">
              <span className="cardTitle">{item.title}</span>
              <span className="cardSubtitle">{item.subtitle}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
