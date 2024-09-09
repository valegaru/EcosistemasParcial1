let socket = io('http://localhost:5050', { path: '/real-time' });

document.getElementById('join-button').addEventListener('click', fetchData);
const startBtn = document.getElementById('start-button');
startBtn.style.display = 'none';
const waiting = document.getElementById('waiting');
waiting.style.display = 'none';
const nicknamecontainer = document.getElementById('nickname-container');
nicknamecontainer.style.display = 'none';
const rol = document.getElementById('rol');

async function fetchData() {
	const user = document.getElementById('user').value;
	//guarda el nombre en localstorage para mostrarlo ahorita en el nickname
	localStorage.setItem('user', user);
	socket.emit('joinGame', user);
	//oculta el input y boton para mandar el nombre de usuario cuando ya se mando
	const joinBtn = document.getElementById('join-button');
	joinBtn.style.display = 'none';
	const userinput = document.getElementById('user');
	userinput.style.display = 'none';
	nicknamecontainer.style.display = 'block';
	document.getElementById('nickname').innerText = ` ${user}`;
}

socket.on('userJoined', (data) => {
	if (data.players.length >= 3) {
		//este boton se muestra cuando el tercer jugador le da enviar a su nombre de usuario. Se termina mostrando en todas las pantallas porque el servidor lo emite para todos
		startBtn.style.display = 'block';
	} else {
		waiting.style.display = 'block';
		startBtn.style.display = 'none';
	}
	console.log(data);
});

startBtn.addEventListener('click', () => {
	socket.emit('startGame');
	waiting.style.display = 'none';
	startBtn.style.display = 'none';
});

//hay un problema con los botones polo cuando se hunde el boton marco ya que vuelven a aparecer, no alcancé a segmentarlo bien por roles
socket.on('assignRoles', (roles) => {
	const user = localStorage.getItem('user');
	const role = roles.marco === user ? 'Marco' : roles.poloSpecial === user ? 'Polo especial' : 'Polo';
	rol.style.display = 'block';
	document.getElementById('rol').innerText = `Tu rol es: ${role}`;

	if (role === 'Marco') {
		// Mostrar botón para gritar "Marco"
		const marcoBtn = document.createElement('button');
		marcoBtn.innerText = 'Gritar Marco';
		marcoBtn.onclick = () => socket.emit('notifyMarco');
		document.body.appendChild(marcoBtn);
	} else {
		// Mostrar botón para gritar "Polo"
		const poloBtn = document.createElement('button');
		poloBtn.innerText = 'Gritar Polo';
		poloBtn.onclick = () => socket.emit('notifyPolo');
		document.body.appendChild(poloBtn);
	}
});

// Cuando Marco grita, Polos ven el mensaje y aparece su botón de gritar Polo
socket.on('marcoHasGritado', () => {
	alert('Marco ha gritado. Debes responder con "Polo"');
});

// Cuando un Polo grita, Marco ve quiénes han gritado
socket.on('poloHasGritado', (poloList) => {
	const poloDiv = document.createElement('div');
	poloDiv.innerHTML = '<h3>Lista de Polos que han gritado:</h3>';
	poloList.forEach((polo, index) => {
		const poloBtn = document.createElement('button');
		poloBtn.innerText = `Polo ${index + 1}`;
		poloBtn.onclick = () => socket.emit('selectPolo', polo);
		poloDiv.appendChild(poloBtn);
	});
	document.body.appendChild(poloDiv);
});

// Fin del juego
socket.on('gameEnded', (message) => {
	alert(message);
});
