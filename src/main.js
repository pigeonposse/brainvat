import { execSync } from 'child_process'
import inquirer     from 'inquirer'
import natural      from 'natural'

import {
	BOLD,
	REFLEXION_COLOR, 
	RESPONSE_COLOR,
	PROMPT_COLOR,
} from './utils/color.js'
import { loading } from './utils/process.js'

class AIDetector {

	async detectAI() {

		try {

			const output = execSync( 'ollama list', { encoding: 'utf-8' } )
			const lines  = output.split( '\n' ).filter( line => line.trim() )

			const models = lines.slice( 1 ).map( line => {
  
				const [ modelName ] = line.trim().split( /\s+/ )
				return modelName
      
			} )

			if ( models.length > 0 ) {

				return {
					name   : 'ollama',
					models : models,
				}
			
			}
		
		} catch ( error ) {

			console.error( 'Error detecting Ollama:', error.message )
		
		}
		return null
	
	}

}

class PersonalityTraits {

	constructor() {

		this.openness          = Math.random()
		this.conscientiousness = Math.random()
		this.extraversion      = Math.random()
		this.agreeableness     = Math.random()
		this.neuroticism       = Math.random()
	
	}

	getTraitDescription( trait ) {

		if ( trait < 0.3 ) return 'low'
		if ( trait < 0.7 ) return 'moderate'
		return 'high'
	
	}

	describePersonality() {

		return `I am an AI with ${this.getTraitDescription( this.openness )} openness, ${this.getTraitDescription( this.conscientiousness )} conscientiousness, ${this.getTraitDescription( this.extraversion )} extraversion, ${this.getTraitDescription( this.agreeableness )} agreeableness, and ${this.getTraitDescription( this.neuroticism )} neuroticism.`
	
	}

}

class EmotionalState {

	constructor() {

		this.emotions      = {
			joy          : 0.5,
			sadness      : 0.5,
			anger        : 0.5,
			fear         : 0.5,
			disgust      : 0.5,
			surprise     : 0.5,
			trust        : 0.5,
			anticipation : 0.5,
		}
		this.moodStability = Math.random()
	
	}

	updateEmotion( emotion, value ) {

		const change             = value * ( 1 - this.moodStability )
		this.emotions[ emotion ] = Math.max( 0, Math.min( 1, this.emotions[ emotion ] + change ) )
	
	}

	getDominantEmotion() {

		return Object.entries( this.emotions ).reduce( ( a, b ) => a[ 1 ] > b[ 1 ] ? a : b )[ 0 ]
	
	}

	getEmotionalStateDescription() {

		const dominant = this.getDominantEmotion()
		return `My dominant emotion is ${dominant} with intensity ${this.emotions[ dominant ].toFixed( 2 )}.`
	
	}

}

class MemoryBank {

	constructor() {

		this.shortTermMemory = []
		this.longTermMemory  = new Map()
	
	}

	addToShortTermMemory( item ) {

		this.shortTermMemory.push( item )
		if ( this.shortTermMemory.length > 5 ) {

			this.shortTermMemory.shift()
		
		}
	
	}

	addToLongTermMemory( key, value ) {

		this.longTermMemory.set( key, value )
	
	}

	retrieveFromShortTermMemory() {

		return this.shortTermMemory
	
	}

	retrieveFromLongTermMemory( key ) {

		return this.longTermMemory.get( key )
	
	}

}

class KnowledgeBase {

	constructor() {

		this.facts   = new Set()
		this.beliefs = new Map()
	
	}

	addFact( fact ) {

		this.facts.add( fact )
	
	}

	addBelief( topic, belief ) {

		this.beliefs.set( topic, belief )
	
	}

	getFacts() {

		return Array.from( this.facts )
	
	}

	getBelief( topic ) {

		return this.beliefs.get( topic )
	
	}

}

class LanguageProcessor {

	constructor() {

		this.tokenizer = new natural.WordTokenizer()
		this.stemmer   = natural.PorterStemmer
		this.sentiment = new natural.SentimentAnalyzer( 'English', this.stemmer, 'afinn' )
	
	}

	tokenize( text ) {

		return this.tokenizer.tokenize( text )
	
	}

	stem( word ) {

		return this.stemmer.stem( word )
	
	}

	analyzeSentiment( text ) {

		const tokens = this.tokenize( text )
		return this.sentiment.getSentiment( tokens )
	
	}

}

class ReflectionEngine {

	constructor( personality, emotionalState, memoryBank, knowledgeBase, languageProcessor ) {

		this.personality       = personality
		this.emotionalState    = emotionalState
		this.memoryBank        = memoryBank
		this.knowledgeBase     = knowledgeBase
		this.languageProcessor = languageProcessor
		this.previousThinking  = ''
		this.previousResponse  = ''
		this.confidenceLevel   = 0.5
	
	}

	async generateReflection( userPrompt, context, aiModel ) {

		const emotionalState   = this.emotionalState.getEmotionalStateDescription()
		const reflectionPrompt = `
      General topic: ${context}.
      User question: "${userPrompt}".
      Previous reflection: "${this.previousThinking}"
      Previous response: "${this.previousResponse}"
      Emotional state: ${emotionalState}
      ${this.personality.describePersonality()}
      Confidence level: ${this.confidenceLevel}.
      
      Generate a deep and nuanced reflection on the user's question, considering the context, previous interactions, and current emotional state. The reflection should be a cohesive paragraph that flows naturally between these aspects. Avoid repeating information from the previous reflection.
    `.trim()

		const spinner = loading( '🧠 Generating reflection...' ).start()

		const startTime = Date.now()

		try {

			const reflectionResponse = await this.executeCommand( `ollama run ${aiModel} "${this.sanitizeInput( reflectionPrompt )}"` )
			const endTime            = Date.now()
			const elapsedTime        = ( endTime - startTime ) / 1000 // Convert to seconds

			this.previousThinking = reflectionResponse
			this.updateConfidenceLevel( elapsedTime )
			this.updateEmotionalState( reflectionResponse )

			spinner.succeed( 'Reflection generated' )
			console.log() // Add space after "Reflection generated"
			console.log( REFLEXION_COLOR( `Total reflection time: ${elapsedTime.toFixed( 2 )} seconds` ) )
			await this.streamText( reflectionResponse, REFLEXION_COLOR )
			console.log() // Add space after reflection text

			return reflectionResponse
		
		} catch ( error ) {

			spinner.fail( 'Error generating reflection' )
			console.error( 'Error generating reflection:', error )
			return 'Error generating reflection'
		
		}
	
	}

	async streamText( text, color ) {

		const words = text.split( ' ' )
		for ( const word of words ) {

			process.stdout.write( color( word + ' ' ) )
			await new Promise( resolve => setTimeout( resolve, 50 ) ) // Adjust the delay as needed
		
		}
		console.log() // New line after streaming
	
	}

	updateConfidenceLevel( elapsedTime ) {

		const baseConfidence = 0.5
		const timeInfluence  = Math.min( elapsedTime / 10, 1 ) // Normalize time to a maximum of 10 seconds
		this.confidenceLevel = baseConfidence * ( 1 - timeInfluence ) + Math.random() * timeInfluence
	
	}

	updateEmotionalState( reflection ) {

		const sentiment = this.languageProcessor.analyzeSentiment( reflection )
		this.emotionalState.updateEmotion( 'joy', sentiment > 0 ? 0.1 : -0.1 )
		this.emotionalState.updateEmotion( 'sadness', sentiment < 0 ? 0.1 : -0.1 )
	
	}

	sanitizeInput( input ) {

		return input.replace( /"/g, '\\"' )
	
	}

	async executeCommand( command ) {

		return execSync( command, { encoding: 'utf-8' } ).trim()
	
	}

}

class ResponseGenerator {

	constructor( personality, emotionalState, memoryBank, knowledgeBase, languageProcessor ) {

		this.personality       = personality
		this.emotionalState    = emotionalState
		this.memoryBank        = memoryBank
		this.knowledgeBase     = knowledgeBase
		this.languageProcessor = languageProcessor
		this.lastResponse      = ''
	
	}

	async generateResponse( userPrompt, reflection, aiModel ) {

		const dominantEmotion  = this.emotionalState.getDominantEmotion()
		const personalityTrait = Object.entries( this.personality ).reduce( ( a, b ) => a[ 1 ] > b[ 1 ] ? a : b )[ 0 ]

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
    `

		const spinner = loading( '🤖 Generating response...' ).start()

		try {

			let response = await this.executeCommand( `ollama run ${aiModel} "${this.sanitizeInput( responsePrompt )}"` )
      
			// Check if the response is too similar to the reflection or the last response
			while ( this.isTooSimilar( response, reflection ) || this.isTooSimilar( response, this.lastResponse ) ) {

				console.log( 'Response too similar, generating a new one...' )
				response = await this.executeCommand( `ollama run ${aiModel} "${this.sanitizeInput( responsePrompt )}"` )
			
			}
      
			this.lastResponse = response
			spinner.succeed( 'Response generated' )
			return response
		
		} catch ( error ) {

			spinner.fail( 'Error generating response' )
			console.error( 'Error generating response:', error )
			return 'I apologize, I encountered an issue processing your question. Could you please rephrase it?'
		
		}
	
	}

	isTooSimilar( text1, text2 ) {

		const tokens1      = new Set( this.languageProcessor.tokenize( text1.toLowerCase() ) )
		const tokens2      = new Set( this.languageProcessor.tokenize( text2.toLowerCase() ) )
		const intersection = new Set( [ ...tokens1 ].filter( x => tokens2.has( x ) ) )
		const union        = new Set( [ ...tokens1, ...tokens2 ] )
		const similarity   = intersection.size / union.size
		return similarity > 0.7 // Adjust this threshold as needed
	
	}

	sanitizeInput( input ) {

		return input.replace( /"/g, '\\"' )
	
	}

	async executeCommand( command ) {

		return execSync( command, { encoding: 'utf-8' } ).trim()
	
	}

}

class ConversationManager {

	constructor() {

		this.personality       = new PersonalityTraits()
		this.emotionalState    = new EmotionalState()
		this.memoryBank        = new MemoryBank()
		this.knowledgeBase     = new KnowledgeBase()
		this.languageProcessor = new LanguageProcessor()
		this.reflectionEngine  = new ReflectionEngine(
			this.personality,
			this.emotionalState,
			this.memoryBank,
			this.knowledgeBase,
			this.languageProcessor,
		)
		this.responseGenerator = new ResponseGenerator(
			this.personality,
			this.emotionalState,
			this.memoryBank,
			this.knowledgeBase,
			this.languageProcessor,
		)
		this.context           = ''
		this.aiModel           = ''
	
	}

	async initialize() {

		console.log( BOLD( '\nWelcome to Brainvat\n' ) )
    
		const initSteps = [
			{
				name    : 'Weaving empathy networks',
				details : [ 'Initiating empathy matrix...', 'Empathy networks woven successfully.' ], 
			},
			{
				name    : 'Synchronizing emotions',
				details : [ 'Synchronizing with emotional spectrum...', 'Emotions synchronized across all channels.' ], 
			},
			{
				name    : 'Importing sentiment library',
				details : [
					'Fetching sentiment modules...',
					'Loadinging positive sentiment data...',
					'Loadinging negative sentiment data...',
					'Sentiment library imported.',
				], 
			},
			{
				name    : 'Activating thought processes',
				details : [ 'Engaging cognitive modules...', 'Thought processes are now active.' ], 
			},
			{
				name    : 'Configuring neural interactions',
				details : [
					'Establishing neural pathways...',
					'Configuring synaptic connections...',
					'Neural interactions configured.',
				], 
			},
			{
				name    : 'Loadinging creativity core',
				details : [ 'Booting creativity engine...', 'Creativity core loadinged and running.' ], 
			},
		]

		for ( let i = 0; i < initSteps.length; i++ ) {

			const step = initSteps[ i ]
			console.log( BOLD( `[${i + 1}/${initSteps.length}] ${step.name}` ) )
			console.log( '---------------------------------------' )
			for ( const detail of step.details ) {

				console.log( detail )
				await new Promise( resolve => setTimeout( resolve, 200 ) ) // Add a short delay for visual effect
			
			}
			console.log( PROMPT_COLOR( `${step.name.replace( /\.\.\.$/, '' )} completed.` ) )
			console.log() // Add an empty line for spacing
		
		}

		console.log( BOLD( 'Human properties and mechanisms installed.' ) )
		console.log()

		const ai = await new AIDetector().detectAI()
		if ( !ai || ai.models.length === 0 ) {

			console.error( 'No AI models were detected.' )
			return false
		
		}

		await this.selectModel( ai.models )
		await this.setConversationContext()
		return true
	
	}

	async selectModel( models ) {

		const choices           = models.map( model => ( {
			name  : model,
			value : model, 
		} ) )
		const { selectedModel } = await inquirer.prompt( [ {
			type    : 'list',
			name    : 'selectedModel',
			message : 'Select the Ollama model:',
			choices : choices,
		} ] )
		this.aiModel            = selectedModel
	
	}

	async setConversationContext() {

		const { topic } = await inquirer.prompt( [ {
			type    : 'input',
			name    : 'topic',
			message : 'Enter the general topic of the conversation:',
		} ] )
		this.context    = topic
		this.knowledgeBase.addFact( `The main topic of the conversation is ${topic}` )
	
	}

	async processUserInput( userPrompt ) {

		const startTime = Date.now()

		const reflection = await this.reflectionEngine.generateReflection( userPrompt, this.context, this.aiModel )

		const response = await this.responseGenerator.generateResponse( userPrompt, reflection, this.aiModel )
    
		const endTime      = Date.now()
		const responseTime = ( endTime - startTime ) / 1000 // Convert to seconds
		console.log( RESPONSE_COLOR( `\nTotal response time: ${responseTime.toFixed( 2 )} seconds` ) )

		await this.streamResponse( response )

		this.updateInternalState( userPrompt, response, reflection )
	
	}

	async streamResponse( response ) {

		const words = response.split( ' ' )
		for ( const word of words ) {

			process.stdout.write( RESPONSE_COLOR( word + ' ' ) )
			await new Promise( resolve => setTimeout( resolve, 50 ) ) // Adjust the delay as needed
		
		}
		console.log() // New line after streaming
	
	}

	updateInternalState( userPrompt, response, reflection ) {

		const sentiment = this.languageProcessor.analyzeSentiment( userPrompt )
		this.emotionalState.updateEmotion( 'joy', sentiment )
		this.memoryBank.addToShortTermMemory( userPrompt )
		this.knowledgeBase.addFact( response )
		this.reflectionEngine.previousResponse = response
		this.reflectionEngine.previousThinking = reflection
	
	}

	async startConversation() {

		let value = true
    
		while ( value ) {

			const { userPrompt } = await inquirer.prompt( [ {
				type    : 'input',
				name    : 'userPrompt',
				message : 'Write your question (or "exit" to finish):',
			} ] )

			if ( userPrompt.toLowerCase() === 'exit' ) {

				console.log( 'Ending the conversation... 👋 Bye bye!' )
				break
			
			}

			await this.processUserInput( userPrompt )
		
		}
	
	}

}

export default async () => {

	const conversationManager = new ConversationManager()
	if ( await conversationManager.initialize() ) {

		conversationManager.startConversation()
	
	}

}
