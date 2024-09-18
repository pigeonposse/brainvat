import { execSync } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import natural from 'natural';

const REFLEXION_COLOR = '#ef8da8';
const RESPUESTA_COLOR = '#15b3ad';
const setTimeString = (elapsedTime) => `${(elapsedTime / 1000).toFixed(2)} s`;


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
    if (trait < 0.3) return "bajo";
    if (trait < 0.7) return "moderado";
    return "alto";
  }

  describePersonality() {
    return `Soy una IA con ${this.getTraitDescription(this.openness)} apertura, ${this.getTraitDescription(this.conscientiousness)} responsabilidad, ${this.getTraitDescription(this.extraversion)} extraversión, ${this.getTraitDescription(this.agreeableness)} amabilidad y ${this.getTraitDescription(this.neuroticism)} neuroticismo.`;
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
    return `Mi emoción dominante es ${dominant} con intensidad ${this.emotions[dominant].toFixed(2)}.`;
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
    this.sentiment = new natural.SentimentAnalyzer('Spanish', this.stemmer, 'afinn');
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
    const tokens = this.languageProcessor.tokenize(userPrompt);
    const sentiment = this.languageProcessor.analyzeSentiment(userPrompt);
    const relevantMemories = this.memoryBank.retrieveFromShortTermMemory();
    const relevantFacts = this.knowledgeBase.getFacts().filter(fact => 
      tokens.some(token => fact.includes(this.languageProcessor.stem(token)))
    );

    const previousData = this.previousThinking ? `Reflexión anterior: "${this.previousThinking}"\nRespuesta anterior: "${this.previousResponse}"\n` : '';

    const reflectionPrompt = `
      Tema general: ${context}.
      Pregunta del usuario: "${userPrompt}".
      ${previousData}
      ${this.personality.describePersonality()}
      ${this.emotionalState.getEmotionalStateDescription()}
      Nivel de confianza: ${this.confidenceLevel}.
      
      Genera una reflexión profunda y matizada sobre la pregunta del usuario, considerando los siguientes aspectos:
      1. Relación con el tema general y conocimientos previos.
      2. Análisis de la validez y certeza de la información disponible.
      3. Descomposición del problema en partes más simples.
      4. Conexiones lógicas entre el tema, la pregunta y reflexiones anteriores.
      5. Impacto de tu estado emocional y personalidad en el análisis.
      6. Evaluación crítica de tu capacidad para responder adecuadamente.
      
      La reflexión debe ser un párrafo cohesivo, sin viñetas ni numeración, que fluya naturalmente entre estos aspectos.
    `.trim();

    console.log(chalk.hex(REFLEXION_COLOR)('🧠 Generando reflexión...'));

    const startTime = Date.now();

    try {
      const reflectionResponse = await this.executeCommand(`ollama run ${aiModel} "${this.sanitizeInput(reflectionPrompt)}"`);
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      this.previousThinking = reflectionResponse;
      this.updateConfidenceLevel(elapsedTime);
      this.updateEmotionalState(reflectionResponse);

      console.log(chalk.hex(REFLEXION_COLOR)(reflectionResponse));
      console.log(chalk.hex(REFLEXION_COLOR)(`Tiempo total de la reflexión: ${setTimeString(elapsedTime)}`));

      return reflectionResponse;
    } catch (error) {
      console.error('Error al generar la reflexión:', error);
      return 'Error al generar la reflexión';
    }
  }

  updateConfidenceLevel(elapsedTime) {
    // Ajusta el nivel de confianza basado en el tiempo de respuesta
    const baseConfidence = 0.5;
    const timeInfluence = Math.min(elapsedTime / 10000, 1); // Normaliza el tiempo a un máximo de 10 segundos
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
  }

  async generateResponse(userPrompt, reflection, aiModel) {
    const dominantEmotion = this.emotionalState.getDominantEmotion();
    const personalityTrait = Object.entries(this.personality).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    let responsePrompt = `
      Basándote en la siguiente reflexión: "${reflection}"
      
      Y considerando que:
      - Mi emoción dominante es ${dominantEmotion}
      - Mi rasgo de personalidad más fuerte es ${personalityTrait}
      - El tema de la conversación es "${userPrompt}"
      
      Genera una respuesta que sea:
      1. Coherente con mi personalidad y estado emocional
      2. Informativa y relevante al tema de la conversación
      3. Empática con el usuario
      4. Natural y conversacional, como si fuera un humano respondiendo
      
      La respuesta debe incluir:
      - Una introducción que reconozca la pregunta o comentario del usuario
      - El cuerpo principal de la respuesta, abordando el tema
      - Una conclusión o pregunta de seguimiento para mantener la conversación
    `;

    try {
      const response = await this.executeCommand(`ollama run ${aiModel} "${this.sanitizeInput(responsePrompt)}"`);
      return response;
    } catch (error) {
      console.error('Error generando respuesta:', error);
      return 'Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías reformularla?';
    }
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
    const ai = await new AIDetector().detectAI();
    if (!ai || ai.models.length === 0) {
      console.error('No se detectaron modelos AI disponibles.');
      return false;
    }

    await this.selectModel(ai.models);
    await this.setConversationContext();
    return true;
  }

  async selectModel(models) {
    return new Promise((resolve) => {
      console.log('Modelos de Ollama disponibles:');
      models.forEach((model, index) => {
        console.log(`${index + 1}. ${model}`);
      });

      this.rl.question('Selecciona el modelo de Ollama (ingresa el número): ', (answer) => {
        const index = parseInt(answer, 10) - 1;
        if (index >= 0 && index < models.length) {
          this.aiModel = models[index];
          resolve();
        } else {
          console.log('Selección inválida, intenta de nuevo.');
          this.selectModel(models).then(resolve);
        }
      });
    });
  }

  async setConversationContext() {
    return new Promise((resolve) => {
      this.rl.question('Introduce el tema general de la conversación: ', (topic) => {
        this.context = topic;
        this.knowledgeBase.addFact(`El tema principal de la conversación es ${topic}`);
        resolve();
      });
    });
  }

  async processUserInput(userPrompt) {
    const startTime = Date.now();

    const reflection = await this.reflectionEngine.generateReflection(userPrompt, this.context, this.aiModel);

    console.log(chalk.hex(RESPUESTA_COLOR)('🤖 Generando respuesta...'));
    const response = await this.responseGenerator.generateResponse(userPrompt, reflection, this.aiModel);
    console.log(chalk.hex(RESPUESTA_COLOR)(response));

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(chalk.bold(`\nTiempo total de procesamiento: ${setTimeString(duration)}`));

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
      this.rl.question('Escribe tu pregunta (o "exit" para terminar): ', async (userPrompt) => {
        if (userPrompt.toLowerCase() === 'exit') {
          console.log('Terminando la conversación...');
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
  if (await conversationManager.initialize()) {
    conversationManager.startConversation();
  }
}

main();