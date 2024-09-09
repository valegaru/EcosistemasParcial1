const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express(); // Creates HTTP server
app.use(express.json()); // utility to process JSON in requests
app.use(cors()); // utility to allow clients to make requests from other hosts or ips

const httpServer = createServer(app); // Explicity creates an HTTP server from the Express app

const io = new Server(httpServer, {
	path: '/real-time',
	cors: {
		origin: '*', // Allow requests from any origin
	},
}); // Creates a WebSocket server, using the same HTTP server as the Express app and listening on the /real-time path

const db = {
	players: [],
};

io.on('connection', (socket) => {
	// "joinGame" listerner
	socket.on('joinGame', (user) => {
		db.players.push(user);
		console.log(user);
		io.emit('userJoined', db); // Example: Broadcasts the message to all connected clients including the sender
		// socket.broadcast.emit("userJoined", db); // Example: Broadcasts the message to all connected clients except the sender
	});

	socket.on('startGame', () => {
		if (db.players.length >= 3) {
			const shuffledPlayers = db.players.sort(() => Math.random() - 0.5); // Mezclar jugadores
			const marco = shuffledPlayers[0]; // El primer jugador será "Marco"
			const poloSpecial = shuffledPlayers[1]; // El segundo jugador será "Polo especial"
			const polos = shuffledPlayers.slice(2); // Los demás serán "Polos normales"

			// Asignar roles
			io.emit('assignRoles', {
				marco,
				poloSpecial,
				polos,
			});
		}
	});

	// Marco grita "Marco"
	socket.on('notifyMarco', () => {
		io.emit('marcoHasGritado');
		db.polos = []; // Limpiar la lista de polos que gritaron para estar listo para recibirlos
	});

	// Polo grita "Polo"
	socket.on('notifyPolo', () => {
		const user = db.players.find((p) => p === socket.id); // Obtener el usuario de este socket
		if (user) {
			db.polos.push(user);
			io.emit('poloHasGritado', db.polos); // Notificar a Marco con la lista actualizada
		}
	});

  //no lo alcancé a probarrrrr :(
	// Marco selecciona un Polo
	socket.on('selectPolo', (polo) => {
		if (polo === db.polos[1]) {
			// Si selecciona al Polo especial
			io.emit('gameEnded', 'El juego ha terminado');
		} else {
			// Cambiar roles entre Marco y Polo seleccionado
			const marco = db.players[0]; // Marco actual
			db.players[0] = polo; // Polo seleccionado ahora es Marco
			io.emit('assignRoles', { marco: polo, poloSpecial: db.polos[1], polos: db.polos.slice(2) });
		}
	});
	// implement "startGame" listener

	// implement "notifyMarco" listener

	// implement "notifyPolo" listener

	// implement "onSelectPolo" listener
});

httpServer.listen(5050, () => {
	// Starts the server on port 5050, same as before but now we are using the httpServer object
	console.log(`Server is running on http://localhost:${5050}`);
});
