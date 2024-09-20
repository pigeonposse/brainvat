import {
	spawn,
	spawnSync, 
} from 'child_process'
import ora      from 'ora'
import readline from 'readline'

export const loading = ora
export const createReadLine = () => {

	const rl = readline.createInterface( {
		input  : process.stdin,
		output : process.stdout,
	} )
	readline.cursorTo( process.stdout, 0, 0 )
	readline.clearScreenDown( process.stdout )
	rl.resume()
	rl.on( 'close', () => {

		console.warn( '\n\nBye bye! 👋\n' )
  
	} )
	return rl

}
// TODO Change funct fro execChildAndParent
export const execTemp = command =>{

	return spawnSync( command, { 
		shell : true,
		stdio : 'inherit',
	} )

}
export const execChild = async command => {

	return new Promise( ( resolve, reject ) => {

		const process = spawn( command, {
			shell : true,
			stdio : 'pipe', // Cambiado de 'inherit' a 'pipe' para capturar la salida
		} )
	
		let output = '',
			errorOutput = ''
	
		// Captura la salida estándar
		process.stdout.on( 'data', data => {

			output += data.toString()
		
		} )
	
		// Captura la salida de errores
		process.stderr.on( 'data', data => {

			errorOutput += data.toString()
		
		} )
	
		process.on( 'close', code => {

			if ( code === 0 ) {

				resolve( output ) // Resuelve la promesa con la salida del comando
        
			} else {

				reject( new Error( `Command failed with code ${code}: ${errorOutput}` ) )
        
			}
		
		} )
	
		process.on( 'error', err => {

			reject( new Error( `Failed to start command: ${err.message}` ) )
		
		} )
	
		// Maneja señales de interrupción
		process.on( 'SIGINT', () => {

			console.log( 'Process interrupted' )
			process.kill() // Envía una señal para terminar el proceso hijo
			reject( new Error( 'Process was interrupted' ) )
		
		} )
	
		process.on( 'SIGTERM', () => {

			console.log( 'Process terminated' )
			process.kill() // Envía una señal para terminar el proceso hijo
			reject( new Error( 'Process was terminated' ) )
		
		} )
	
	} )

}

export const execChildAndParent = async command => {

	return new Promise( ( resolve, reject ) => {

		const child = spawn( command, {
			shell : true,
			stdio : [
				'pipe',
				'pipe',
				'pipe',
			], 
		} )

		let output = '',
			errorOutput = ''

		child.stdout.on( 'data', data => {

			process.stdout.write( data ) // Muestra en la terminal
			output += data.toString() // Guarda en la variable

		} )

		// Captura la salida de errores y la muestra en la terminal
		child.stderr.on( 'data', data => {

			process.stderr.write( data ) // Muestra en la terminal
			errorOutput += data.toString() // Guarda en la variable

		} )

		child.on( 'close', code => {

			console.log( code )
			if ( code === 0 ) {

				resolve( output ) 
	
			} else {

				reject( new Error( `Command failed with code ${code}: ${errorOutput}` ) )
	
			}

		} )

		child.on( 'error', err => {

			reject( new Error( `Failed to start command: ${err.message}` ) )

		} )

		// Maneja señales de interrupción
		child.on( 'SIGINT', () => {

			console.log( 'Process interrupted' )
			child.kill() 
			reject( new Error( 'Process was interrupted' ) )

		} )

		child.on( 'SIGTERM', () => {

			console.log( 'Process terminated' )
			child.kill() 
			reject( new Error( 'Process was terminated' ) )

		} )

	} )

}
