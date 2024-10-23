import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { processNaturalLanguage, generateResponse } from '../services/nlpService';

const VoiceInteraction = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const history = useHistory();

  const processVoiceCommand = async (command) => {
    const result = await processNaturalLanguage(command);
    const response = generateResponse(result.intent, result.entities);
    setResponse(response);

    // Perform actions based on intent
    switch (result.intent) {
      case 'findFood':
        history.push('/find');
        break;
      case 'donateFood':
        history.push('/donate');
        break;
      case 'viewProfile':
        history.push('/profile');
        break;
      case 'reserveFood':
        // This would need to be handled in the context of the current food item
        console.log('Attempting to reserve food');
        break;
      case 'getDirections':
        // This would need to be handled in the context of the current food item
        console.log('Attempting to get directions');
        break;
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // In a real app, this would start the speech recognition
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        setTranscript("Find food near me");
        setIsListening(false);
      }, 2000);
    }
  };

  useEffect(() => {
    if (transcript) {
      processVoiceCommand(transcript);
    }
  }, [transcript]);

  return (
    <div className="voice-interaction">
      <button onClick={toggleListening} className={isListening ? 'listening' : ''}>
        {isListening ? 'Listening...' : 'Start Voice Command'}
      </button>
      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> {transcript}
        </div>
      )}
      {response && (
        <div className="response">
          <strong>AI Response:</strong> {response}
        </div>
      )}
    </div>
  );
};

export default VoiceInteraction;
