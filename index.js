const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameButton = document.getElementById('newGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCode = document.getElementById('gameCode');

newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);

const socket = io('http://localhost:3000');

function newGame(){
	socket.emit('newGame');
	init();
}

function joinGame(){
	const code = gameCodeInput.value;
	socket.emit('joinGame', code);
	init();
}

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameOver', handleGameOver);

let canvas, Context;
let fighter1, fighter2, Bg;
let playerNumber;
let gameActive = false;

function init(){
	initialScreen.style.display = 'none';
	gameScreen.style.display = 'block';

	canvas = document.querySelector('canvas');
	Context = canvas.getContext('2d');

	canvas.width = 1024;
	canvas.height = 576;

	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);
	document.addEventListener('click', click);

	gameActive = true;
}

function handleInit(number){
	playerNumber = number;

	Bg = new Image();
	Bg.src = "assets/bg/bg.png";
	fighter1 = new Fighter({position: {x: 50, y: 50}, 
		velocity:{x: 0, y: 0}, 
		offset:{ x:215, y:157}, 
		imgSrc: "assets/samurai1/Idle.png", 
		animationFrames: 8, 
		scale:2.5, 
		framesHold: 2,
		hitBoxOffset:{x: 0, y:0},
		sprites:{idle:{ imgSrc: "assets/samurai1/Idle.png", animationFrames: 8,},
		run:{ imgSrc: "assets/samurai1/Run.png", animationFrames: 8},
		jump:{ imgSrc: "assets/samurai1/Jump.png", animationFrames:2},
		fall:{ imgSrc: "assets/samurai1/Fall.png", animationFrames:2},
		attack1:{ imgSrc: "assets/samurai1/Attack1.png", animationFrames:6},
	}});

	fighter2 = new Fighter({position: {x: 500, y: 50}, 
		velocity:{x: 0, y: 0}, offset:{ x:215, y:170}, 
		imgSrc: "assets/samurai1/Idle.png", 
		animationFrames: 8, 
		scale:2.5, 
		framesHold: 5,
		hitBoxOffset:{x: 150, y:0},
		sprites:{idle:{ imgSrc: "assets/samurai2/Idle.png", animationFrames: 4,},
		run:{ imgSrc: "assets/samurai2/Run.png", animationFrames: 8},
		jump:{ imgSrc: "assets/samurai2/Jump.png", animationFrames:2},
		fall:{ imgSrc: "assets/samurai2/Fall.png", animationFrames:2},
		attack1:{ imgSrc: "assets/samurai2/Attack1.png", animationFrames:4},
		takeHit:{imgSrc: "assets/samurai2/Take hit.png", animationFrames:3}
	}});	
}

function click(e){
	if(gameActive){
		socket.emit('click', e.button);
	}	
}

function keydown(e){
	if(gameActive){
		socket.emit('keydown', e.keyCode);
	}
}

function keyup(e){
	if(gameActive){
	socket.emit('keyup', e.keyCode);
	}
}

function handleGameState(gameState){
	gameCode.style.display = "none";
	if(!gameActive){
		return;
	}
	gameState = JSON.parse(gameState);
	requestAnimationFrame(() => gameLoop(gameState));
}

function handleGameCode(gameCode){
	gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame(){
	Reset();
	alert("Unknown game code");
}

function handleTooManyPlayers(){
	Reset();
	alert("This game is already in progress");
}

function handleGameOver(data){
	if(!gameActive){
		retrun ;
	}
	data = JSON.parse(data);
	if( playerNumber === data.winner){
		var r = confirm("You win!")
		if(r == true || r == false){
			location.reload();
		}
	}else{
		var r = confirm("You Lose!")
		if(r == true || r == false){
			location.reload();
		}
	}
	gameActive = false;
}

function Reset(){
	playerNumber = null;
	gameCodeInput.value = "";
	gameCodeDisplay.innerText = "";
	initialScreen.style.display = "block";
	gameScreen.style.display = "none";
}

function gameLoop(state){
	Context.drawImage(Bg, 0, 0);

	const player1 = state.players[0];
	const player2 = state.players[1];

	fighter1.velocity = player1.velocity;
	fighter2.velocity = player2.velocity;

	fighter1.position = player1.position;
	fighter2.position = player2.position;

	fighter1.attackBox.position = player1.attackBox.position;
	fighter2.attackBox.position = player2.attackBox.position;

	fighter1.health = player1.health;
	fighter2.health = player2.health;

	document.querySelector('#player2Health').style.width = player2.health + '%';
	document.querySelector('#player1Health').style.width = player1.health + '%';

	if(player1.shouldAttack){
		fighter1.attack();
	}

	if(player2.shouldAttack){
		fighter2.attack();
	}
	
	fighter2.update();
	fighter1.update();
}