import natural from 'natural';
import chalk from 'chalk';
import { execSync } from 'child_process';
import readline from 'readline';

const REFLEXION_COLOR = '#ef8da8';
const RESPONSE_COLOR = '#15b3ad';

class AIDetector {
  async detectAI() {
    try {
      const output = execSync('ollama list', { encoding: 'utf-8' });
      const models = output.split('\n').filter(line => line.trim()).map(line => line.split(' ')[0]);
      if (models.length > 0) {
        return {
          name: 'ollama',
          models: models
        };
      }
    } catch (error) {
      console.error('Error detecting Ollama:', error.message);
    }
    return null;
  }
}

class PersonalityTraits {
  constructor() {
    this.openness = Math.random();
    this.conscientiousness = Math.random();
    this.extraversion = Math.random();
    this.agreeableness = Math.random();
    this.neuroticism = Math.random();
  }

  getTraitDescription(trait) {
    if (trait < 0.3) return "low";
    if (trait < 0.7) return "moderate";
    return "high";
  }

  describePersonality() {
    return `I am an AI with ${this.getTraitDescription(this.openness)} openness, ${this.getTraitDescription(this.conscientiousness)} conscientiousness, ${this.getTraitDescription(this.extraversion)} extraversion, ${this.getTraitDescription(this.agreeableness)} agreeableness, and ${this.getTraitDescription(this.neuroticism)} neuroticism.`;
  }
}

class EmotionalState {
  constructor() {
    this.emotions = {
      joy: 0.5,
      sadness: 0.5,
      anger: 0.5,
      fear: 0.5,
      disgust: 0.5,
      surprise: 0.5,
      trust: 0.5,
      anticipation: 0.5
    };
    this.moodStability = Math.random();
  }

  updateEmotion(emotion, value) {
    const change = value * (1 - this.moodStability);
    this.emotions[emotion] = Math.max(0, Math.min(1, this.emotions[emotion] + change));
  }

  getDominantEmotion() {
    return Object.entries(this.emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  getEmotionalStateDescription() {
    const dominant = this.getDominantEmotion();
    return `My dominant emotion is ${dominant} with intensity ${this.emotions[dominant].toFixed(2)}.`;
  }
}

class MemoryBank {
  constructor() {
    this.shortTermMemory = [];
    this.longTermMemory = new Map();
  }

  addToShortTermMemory(item) {
    this.shortTermMemory.push(item);
    if (this.shortTermMemory.length > 5) {
      this.shortTermMemory.shift();
    }
  }

  addToLongTermMemory(key, value) {
    this.longTermMemory.set(key, value);
  }

  retrieveFromShortTermMemory() {
    return this.shortTermMemory;
  }

  retrieveFromLongTermMemory(key) {
    return this.longTermMemory.get(key);
  }
}

class KnowledgeBase {
  constructor() {
    this.facts = new Set();
    this.beliefs = new Map();
  }

  addFact(fact) {
    this.facts.add(fact);
  }

  addBelief(topic, belief) {
    this.beliefs.set(topic, belief);
  }

  getFacts() {
    return Array.from(this.facts);
  }

  getBelief(topic) {
    return this.beliefs.get(topic);
  }
}

class LanguageProcessor {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.sentiment = new natural.SentimentAnalyzer('English', this.stemmer, 'afinn');
  }

  tokenize(text) {
    return this.tokenizer.tokenize(text);
  }

  stem(word) {
    return this.stemmer.stem(word);
  }

  analyzeSentiment(text) {
    const tokens = this.tokenize(text);
    return this.sentiment.getSentiment(tokens);
  }
}

class ReflectionEngine {
  constructor(personality, emotionalState, memoryBank, knowledgeBase, languageProcessor) {
    this.personality = personality;
    this.emotionalState = emotionalState;
    this.memoryBank = memoryBank;
    this.knowledgeBase = knowledgeBase;
    this.languageProcessor = languageProcessor;
    this.previousThinking = '';
    this.previousResponse = '';
    this.confidenceLevel = 0.5;
  }

  async generateReflection(userPrompt, context, aiModel) {
    const emotionalState = this.emotionalState.getEmotionalStateDescription();
    const reflectionPrompt = `
      General topic: ${context}.
      User question: "${userPrompt}".
      Previous reflection: "${this.previousThinking}"
      Previous response: "${this.previousResponse}"
      Emotional state: ${emotionalState}
      ${this.personality.describePersonality()}
      Confidence level: ${this.confidenceLevel}.
      
      Generate a deep and nuanced reflection on the user's question, considering the context, previous interactions, and current emotional state. The reflection should be a cohesive paragraph that flows naturally between these aspects. Avoid repeating information from the previous reflection.
    `.trim();

    console.log(chalk.hex(REFLEXION_COLOR)('🧠 Generating reflection...'));

    const startTime = Date.now();

    try {
      const reflectionResponse = await this.executeCommand(`ollama run ${aiModel} "${this.sanitizeInput(reflectionPrompt)}"`);
      const endTime = Date.now();
      const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds

      this.previousThinking = reflectionResponse;
      this.updateConfidenceLevel(elapsedTime);
      this.updateEmotionalState(reflectionResponse);

      console.log(chalk.hex(REFLEXION_COLOR)(reflectionResponse));
      console.log(chalk.hex(REFLEXION_COLOR)(`Total reflection time: ${elapsedTime.toFixed(2)} seconds`));

      return reflectionResponse;
    } catch (error) {
      console.error('Error generating reflection:', error);
      return 'Error generating reflection';
    }
  }

  updateConfidenceLevel(elapsedTime) {
    const baseConfidence = 0.5;
    const timeInfluence = Math.min(elapsedTime / 10, 1); // Normalize time to a maximum of 10 seconds
    this.confidenceLevel = baseConfidence * (1 - timeInfluence) + Math.random() * timeInfluence;
  }

  updateEmotionalState(reflection) {
    const sentiment = this.languageProcessor.analyzeSentiment(reflection);
    this.emotionalState.updateEmotion('joy', sentiment > 0 ? 0.1 : -0.1);
    this.emotionalState.updateEmotion('sadness', sentiment < 0 ? 0.1 : -0.1);
  }

  sanitizeInput(input) {
    return input.replace(/"/g, '\\"');
  }

  async executeCommand(command) {
    return execSync(command, { encoding: 'utf-8' }).trim();
  }
}

class ResponseGenerator {
  constructor(personality, emotionalState, memoryBank, knowledgeBase, languageProcessor) {
    this.personality = personality;
    this.emotionalState = emotionalState;
    this.memoryBank = memoryBank;
    this.knowledgeBase = knowledgeBase;
    this.languageProcessor = languageProcessor;
    this.lastResponse = '';
  }

  async generateResponse(userPrompt, reflection, aiModel) {
    const dominantEmotion = this.emotionalState.getDominantEmotion();
    const personalityTrait = Object.entries(this.personality).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    let responsePrompt = `
      Based on the following reflection: "${reflection}"
      
      And considering that:
      - My dominant emotion is ${dominantEmotion}
      - My strongest personality trait is ${personalityTrait}
      - The conversation topic is "${userPrompt}"
      
      Generate a response that is:
      1. Consistent with my personality and emotional state
      2. Informative and relevant to the conversation topic
      3. Empathetic towards the user
      4. Natural and conversational, as if a human were responding
      5. Different from the provided reflection, avoiding repetitions
      
      The response should include:
      - An introduction acknowledging the user's question or comment
      - The main body of the response, addressing the topic
      - A conclusion or follow-up question to keep the conversation going
    `;

    try {
      let response = await this.executeCommand(`ollama run ${aiModel} "${this.sanitizeInput(responsePrompt)}"`);
      
      // Check if the response is too similar to the reflection or the last response
      while (this.isTooSimilar(response, reflection) || this.isTooSimilar(response, this.lastResponse)) {
        console.log("Response too similar, generating a new one...");
        response = await this.executeCommand(`ollama run ${aiModel} "${this.sanitizeInput(responsePrompt)}"`);
      }
      
      this.lastResponse = response;
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, I encountered an issue processing your question. Could you please rephrase it?';
    }
  }

  isTooSimilar(text1, text2) {
    const tokens1 = new Set(this.languageProcessor.tokenize(text1.toLowerCase()));
    const tokens2 = new Set(this.languageProcessor.tokenize(text2.toLowerCase()));
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    const similarity = intersection.size / union.size;
    return similarity > 0.7; // Adjust this threshold as needed
  }

  sanitizeInput(input) {
    return input.replace(/"/g, '\\"');
  }

  async executeCommand(command) {
    return execSync(command, { encoding: 'utf-8' }).trim();
  }
}

class ConversationManager {
  constructor() {
    this.personality = new PersonalityTraits();
    this.emotionalState = new EmotionalState();
    this.memoryBank = new MemoryBank();
    this.knowledgeBase = new KnowledgeBase();
    this.languageProcessor = new LanguageProcessor();
    this.reflectionEngine = new ReflectionEngine(
      this.personality,
      this.emotionalState,
      this.memoryBank,
      this.knowledgeBase,
      this.languageProcessor
    );
    this.responseGenerator = new ResponseGenerator(
      this.personality,
      this.emotionalState,
      this.memoryBank,
      this.knowledgeBase,
      this.languageProcessor
    );
    this.context = '';
    this.aiModel = '';
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async initialize() {
    console.log(chalk.bold('Welcome to Brainvat'));
    console.log('\nWeaving empathy networks.');
    console.log('Synchronizing emotions.');
    console.log('Importing sentiment library.');
    console.log('Activating thought processes.');
    console.log('Configuring neural interactions.');
    console.log('Loading creativity core.');
    console.log('\nHuman properties and mechanisms installed.');
    console.log();

    const ai = await new AIDetector().detectAI();
    if (!ai || ai.models.length === 0) {
      console.error('No AI models were detected.');
      return false;
    }

    await this.selectModel(ai.models);
    await this.setConversationContext();
    return true;
  }

  async selectModel(models) {
    return new Promise((resolve) => {
      console.log('Available Ollama models:');
      models.forEach((model, index) => {
        console.log(`${index + 1}. ${model}`);
      });

      this.rl.question('Select the Ollama model (enter the number): ', (answer) => {
        const index = parseInt(answer, 10) - 1;
        if (index >= 0 && index < models.length) {
          this.aiModel = models[index];
          resolve();
        } else {
          console.log('Invalid selection, please try again.');
          this.selectModel(models).then(resolve);
        }
      });
    });
  }

  async setConversationContext() {
    return new Promise((resolve) => {
      this.rl.question('Enter the general topic of the conversation: ', (topic) => {
        this.context = topic;
        this.knowledgeBase.addFact(`The main topic of the conversation is ${topic}`);
        resolve();
      });
    });
  }

  async processUserInput(userPrompt) {
    const startTime = Date.now();

    const reflection = await this.reflectionEngine.generateReflection(userPrompt, this.context, this.aiModel);

    console.log(chalk.hex(RESPONSE_COLOR)('🤖 Generating response...'));
    const response = await this.responseGenerator.generateResponse(userPrompt, reflection, this.aiModel);
    console.log(chalk.hex(RESPONSE_COLOR)(response));

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    console.log(chalk.bold(`\nTotal processing time: ${duration.toFixed(2)} seconds`));

    this.updateInternalState(userPrompt, response, reflection);
  }

  updateInternalState(userPrompt, response, reflection) {
    const sentiment = this.languageProcessor.analyzeSentiment(userPrompt);
    this.emotionalState.updateEmotion('joy', sentiment);
    this.memoryBank.addToShortTermMemory(userPrompt);
    this.knowledgeBase.addFact(response);
    this.reflectionEngine.previousResponse = response;
    this.reflectionEngine.previousThinking = reflection;
  }

  async startConversation() {
    const askQuestion = () => {
      this.rl.question('Write your question (or "exit" to finish): ', async (userPrompt) => {
        if (userPrompt.toLowerCase() === 'exit') {
          console.log('Ending the conversation...');
          this.rl.close();
        } else {
          await this.processUserInput(userPrompt);
          askQuestion();
        }
      });
    };

    askQuestion();
  }
}

async function main() {
  const conversationManager = new ConversationManager();
  if (await conversationManager.initialize())

 {
    conversationManager.startConversation();
  }
}

main();