import natural from 'natural';
import { NlpManager } from 'node-nlp';

const tokenizer = new natural.WordTokenizer();
const manager = new NlpManager({ languages: ['en'] });

// Train the NLP manager with intents and examples
manager.addDocument('en', 'find food near me', 'findFood');
manager.addDocument('en', 'show available food donations', 'findFood');
manager.addDocument('en', 'what food is available', 'findFood');

manager.addDocument('en', 'donate food', 'donateFood');
manager.addDocument('en', 'I want to give away food', 'donateFood');
manager.addDocument('en', 'how can I donate food', 'donateFood');

manager.addDocument('en', 'show my profile', 'viewProfile');
manager.addDocument('en', 'open my account', 'viewProfile');
manager.addDocument('en', 'view my information', 'viewProfile');

manager.addDocument('en', 'reserve this food', 'reserveFood');
manager.addDocument('en', 'I want to pick up this food', 'reserveFood');
manager.addDocument('en', 'can I have this food item', 'reserveFood');

manager.addDocument('en', 'show directions', 'getDirections');
manager.addDocument('en', 'how do I get there', 'getDirections');
manager.addDocument('en', 'navigate to pickup location', 'getDirections');

// Train and save the model
(async() => {
  await manager.train();
  manager.save();
})();

export const processNaturalLanguage = async (input) => {
  const tokens = tokenizer.tokenize(input);
  const result = await manager.process('en', tokens.join(' '));
  return result;
};

export const generateResponse = (intent, entities) => {
  switch (intent) {
    case 'findFood':
      return "I'm showing you the available food donations near you. You can tap on any item to see more details or reserve it.";
    case 'donateFood':
      return "Great! I'm opening the donation page where you can list the food items you want to donate.";
    case 'viewProfile':
      return "I'm taking you to your profile page where you can view and edit your information.";
    case 'reserveFood':
      return "Sure, I can help you reserve this food item. Please confirm the details and tap the reserve button.";
    case 'getDirections':
      return "I'm generating directions to the pickup location for you. Please make sure you have location services enabled.";
    default:
      return "I'm sorry, I didn't understand that. Could you please rephrase your request?";
  }
};
