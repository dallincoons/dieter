const DJQueue = require('./djqueue');
const stuff = require('./chillybotstuff');

/*******************************BeginSetUp*****************************************************************************/
let Bot = require('ttapi');

//sprockets
var AUTH = 'dXhZHlHryToxwdnFpxSffHje';
var USERID = '628ed9e688b736001d2464f4';
var ROOMID = '60820a5647c69b001b3aa1f9';

// var AUTH = 'dXhZHlHryToxwdnFpxSffHje';
// var USERID = '628ed9e688b736001d2464f4';
// var ROOMID = '6341dd4a748e09001c04acc2';

let bot = new Bot(AUTH, USERID, ROOMID);
bot.debug = true;

let playLimit = 1;
let numberOfSeats  = 5;

let queue;
let lastDJ = undefined;
let oneAndDone = false;
let currentDJ = undefined;
let currentDJs = [];
let userPlays = {};
let nextDJInLine;
let nextInLineTimeout = null;
let rotateStarted = false;
let toEscort = {};
let maintainingQueueOrder = false;
let currentSong = undefined;
let currentSongPlays = 0;

bot.on('ready', function (data) {
	console.log("on ready");
	console.log({data});
	bot.roomRegister(ROOMID);
});

bot.on('roomChanged', function (data) {
	console.log("on room changed");
	console.log({data});
	currentDJs = data.room.metadata.djs;

	if (!queue) {
		console.log("initializing queue");
		queue = new DJQueue();
	}

	let users = data.users || [];

	users.forEach((user) => {
		queue.registerUser(user.userid, user.name);
	});

	console.log('all registered users');
	console.log(queue.registeredUsers);

	bot.bop();
});

function startOneAndDone() {
	registerUsers();

	let firstDJ = currentDJs[0];

	console.log({lastDJ});
	console.log(queue.getUserName(lastDJ));

	if (firstDJ === lastDJ) {
		oneAndDone = true;
		bot.speak('One and done engaged, effective immediately!');
	} else {
		rotateStarted = true;
		bot.speak('One and done will start with @' + queue.getUserName(firstDJ));
	}
}

bot.on('speak', function (data) {
	if (!data.text) {
		return;
	}

	if (data.text === '/commands') {
		bot.speak("\\rotate engages one and done \n \\stoprotate disengages one and done \n \\addme to add yourself to queue \n \\removeme to remove yourself from queue");
	}

	if (data.text === '911') {
		bot.speak(':rotating_light:');
		return;
	}

	if (data.text.startsWith('/roll')) {
		let regex = /\/roll\D*(\d+)/;
		let matches = regex.exec(data.text);
		if (matches.length > 0 && !isNaN(parseInt(matches[1]))) {
			let number = parseInt(matches[1]);
			if (number > 100) {
				number = 100;
			} else if (number < 1)  {
				number = 1;
			}
			bot.speak('You roll a ' + number + ' sided dice and get ' + (Math.floor(Math.random() * number) + 1));
		}
	}

	if (data.text === ':9:') {
		let gifs = [
			"https://media.giphy.com/media/kfznTxem5HG0w/giphy.gif",
			"https://media.giphy.com/media/sRFGnkY4BYBjGBdJIz/giphy.gif",
			"https://media.giphy.com/media/3o8dp7uKPWmFYe2TeM/giphy.gif",
			"https://media.giphy.com/media/LmwxkgDdxV1ToJW048/giphy.gif",
			"https://media.giphy.com/media/1R8EfVEqTswDWvBFAi/giphy.gif",
			"https://media.giphy.com/media/ZTDdarO1y8H3pAKO6o/giphy.gif",
			"https://media.giphy.com/media/gIfWp2yO8xRajV9ufg/giphy.gif",
			"https://media.giphy.com/media/M2Ml23remyvjq/giphy.gif",
			"https://media.giphy.com/media/l2QDW6fklsISgA3MQ/giphy.gif",
			"https://media.giphy.com/media/l3vRfhFD8hJCiP0uQ/giphy.gif",
			"https://media.giphy.com/media/QuxqWk7m9ffxyfoa0a/giphy.gif",
			"https://media.giphy.com/media/xWazTCAcI7m2A/giphy.gif",
			"https://media.giphy.com/media/l41lNkAFGs7jyWzYY/giphy.gif",
			"https://media.giphy.com/media/71UnFdzKw7kTm/giphy.gif",
			"https://media.giphy.com/media/10QqGj0eqGOWIw/giphy.gif",
			"https://media.giphy.com/media/5CchhJMhQAEbS/giphy.gif",
			"https://media.giphy.com/media/XfE6Pcjy6LZW12XOS0/giphy.gif",
			"https://media.giphy.com/media/MmTuPMAuUjumc/giphy.gif",
			"https://media.giphy.com/media/1pA5bNYbDnSc6K45LI/giphy.gif",
			"https://media.giphy.com/media/F6ub4AQXz13xK/giphy.gif",
			"https://media.giphy.com/media/qTD9EXZRgI1y0/giphy.gif",
			"https://media.giphy.com/media/BvC7TmEd7odbi/giphy.gif",
			"https://media.giphy.com/media/P0I4FJmnYl5E4/giphy.gif",
			"https://media.giphy.com/media/O9SfWhDlVFsvC/giphy.gif",
			"https://media.giphy.com/media/l3vRb92lVAy2yXJnO/giphy.gif",
			"https://media.giphy.com/media/5zI213WKIL2uI/giphy.gif",
			"https://media.giphy.com/media/26vIdGToqHJNFc3tu/giphy.gif",
			"https://media.giphy.com/media/xUPGcrEwuDJmKeDZK0/giphy.gif",
			"https://media.giphy.com/media/xUn3Cc9P0CdKoSbMdi/giphy.gif",
			"https://media.giphy.com/media/1Pq6EZxEQ7sbu/giphy.gif",
			"https://media.giphy.com/media/26h0qLFdOBklnBsyI/giphy.gif",
			"https://media.giphy.com/media/RIHJGMww0p2IZng2l9/giphy.gif",
			"https://media.giphy.com/media/129rZZ3a4anp0Q/giphy.gif",
			"https://media.giphy.com/media/OsazxrOHCXQBi/giphy.gif",
			"https://media.giphy.com/media/2pCOOzE06hJcc/giphy.gif",
			"https://media.giphy.com/media/fGuqeA6PiXINa/giphy.gif",
			"https://media.giphy.com/media/fGuqeA6PiXINa/giphy.gif",
			"https://media.giphy.com/media/Xn45Idyn6JxTi/giphy.gif",
			"https://media.giphy.com/media/3oKIPbKtneOWixLShO/giphy.gif",
			"https://media.giphy.com/media/QcQrhJH9UWr0tbvwYV/giphy.gif",
			"https://media.giphy.com/media/b2c9qnyHRg2afFYOP2/giphy.gif",
			"https://media.giphy.com/media/hLP8nZ7HmukyA/giphy.gif",
			"https://media.giphy.com/media/bBntLYoOJhqv0sJ1Tr/giphy.gif",
			"https://media.giphy.com/media/1kIwyU8oi7WUunM4ms/giphy.gif",
			"https://media.giphy.com/media/sZSF5oIOYQdJ6/giphy.gif",
			"https://media.giphy.com/media/7atcoVG3Wy8nu/giphy.gif",
			"https://media.giphy.com/media/xasTHaFHEWV2g/giphy.gif",
			"https://thumbs.gfycat.com/AlertIckyBison-size_restricted.gif",
			"https://media.tenor.com/kVM2t4UP_UAAAAAM/mike-myers-sprockets.gif",
		];

		const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
		bot.speak(randomGif);
	}

	if (data.text === "/escortme") {
		if (!currentDJs.includes(data.userid)) {
			bot.speak("I can only escort you if you are on deck.");
			return;
		}

		if (toEscort.hasOwnProperty(data.userid) && toEscort[data.userid] === true) {
			bot.speak('@' + queue.getUserName(data.userid) + ', you have already requested to be escorted after your next play.');
			return;
		}

		toEscort[data.userid] = true;
		bot.speak('@' + queue.getUserName(data.userid) + ', you will be escorted after your next play.');
		return;
	}

	if (data.text === "/unescortme") {
		if (toEscort.hasOwnProperty(data.userid) && !toEscort[data.userid]) {
			bot.speak('@' + queue.getUserName(data.userid) + ', you have not requested to be escorted.');
			return;
		}

		toEscort[data.userid] = false;
		bot.speak('@' + queue.getUserName(data.userid) + ', you will no longer be escorted after your next play.');
		return;
	}

	if (data.text === '/rotate' && !oneAndDone && !rotateStarted) {
		rotateStarted = true;

		console.log('starting rotate');
		console.log({currentDJs});
		currentDJs.forEach((djID) => {
			console.log(queue.getUserName(djID));
		});

		let firstDJ = currentDJs[0];

		console.log({lastDJ});
		console.log(queue.getUserName(lastDJ));

		if (firstDJ == lastDJ) {
			oneAndDone = true;
			bot.speak('One and done engaged, effective immediately!');
		} else {
			bot.speak('One and done will start with @' + queue.getUserName(firstDJ));
		}

		return;
	}

	if (data.text === '/rotate' && (oneAndDone || rotateStarted)) {
		bot.speak('One and done already engaged! To disengage, type /stoprotate');
		return;
	}

	if (data.text === '/stoprotate' && (oneAndDone || rotateStarted)) {
		stopRotate();
		return;
	}

	if (data.text === '/stoprotate' && !oneAndDone && !rotateStarted) {
		bot.speak('One and done not engaged yet!');
		return;
	}

	if (data.text.startsWith('/removeme')) {
		if (!oneAndDone) {
			return;
		}

		if (nextDJInLine == data.userid) {
			clearTimeout(nextInLineTimeout);
			nextInLineTimeout = null;
			bot.speak('@' + data.name + ", you have been removed from the queue.");
			shiftQueue(data.userid);
			return;
		}

		let queuedDJ = queue.getQueue().find((dj) =>  {
			return dj.id === data.userid;
		});

		if (!queuedDJ) {
			bot.speak('@' + data.name + ", I'm confused. You were not in the queue!");
			return;
		}

		let result = queue.removeDJ(data.userid);
		if (result === 1) {
			bot.speak("@"+data.name + ", you are not in the queue!");
			return;
		}
		console.log('queue after removing DJ from queue');
		console.log(queue.getQueue());

		bot.speak('@' + data.name + ", you have been removed from the queue.");
		return;
	}

	if (data.text === '/queue') {
		if (!oneAndDone) {
			bot.speak("There currently is no queue.");
			return;
		}

		if (queue.getQueue().length < 1) {
			bot.speak("There is nobody in the queue.");
			return;
		}

		printQueue();
	}

	if (data.text ===  '/addme') {
		let userid = data.userid;
		if (!oneAndDone && !rotateStarted && currentDJs && currentDJs.length >= numberOfSeats) {
			if (currentDJs.includes(userid))  {
				bot.speak('@' + data.name + ", you are already spinning, ya dope!");
				return;
			}
			startOneAndDone();
			queue.addDJToQueue(data.userid, data.name);
			bot.speak('@' + data.name + ", you have been added to the queue!");
			printQueue();
			return;
		}

		if (!oneAndDone && !rotateStarted && currentDJs.length < numberOfSeats) {
			bot.speak('@' + data.name + ", looks like there's a spot with your name on it. Hop on up!");
			return;
		}

		let queuedDJ = queue.getQueue().find((dj) =>  {
			console.log({dj});
			console.log(data.userid);
			return dj.id == data.userid;
		});

		if (queuedDJ) {
			//tell user who they are after
			bot.speak('@' + data.name + ", I'm confused. You are already in the queue!");
			return;
		}

		if (Array.isArray(currentDJs) && currentDJs.includes(data.userid)) {
			bot.speak("Please wait until you are not on deck. You will be automatically added to the queue after your turn.");
			return;
		}

		queue.addDJToQueue(data.userid, data.name);
		bot.speak('@' + data.name + ", you have been added to the queue!");
		printQueue();

		console.log('queue after adding DJ to queue');
		console.log(queue.getQueue());
	}

	if (data.text.startsWith('/remove')) {
		if (!oneAndDone) {
			return;
		}

		if (!data.text.includes('@')) {
			return;
		}

		let username = data.text.split('@').pop();

		let dj = queue.getQueue().find((dj) => {
			return dj.name === username;
		});

		if (!dj) {
			bot.speak('@' + username + " was not in the queue!");
		} else {
			queue.removeDJFromQueue(dj.id);
			bot.speak(dj.name + " was removed from the queue!");
		}

		console.log('queue after removing DJ from queue');
		console.log(queue.getQueue());
	}
});

function stopRotate() {
	oneAndDone = false;
	rotateStarted = false;
	queue.clear();
	userPlays = {};
	bot.speak('One and done disengaged!');
}

function registerUsers() {
	let lastDJID;
	Object.values(currentDJs).forEach(djID => {
		bot.getProfile(djID, (prof) => {
			console.log('registering user');
			console.log(prof.userid);
			console.log(prof.name);
			queue.registerUser(prof.userid, prof.name);
			lastDJID = djID;
			lastDJ = djID;
		});
	});
}

function getUserIDFromEvent(event) {
	if (!event.user || !Array.isArray(event.user) || event.user.length < 1) {
		console.log('error: event does not contain user info');
		console.log(event);
		return "";
	}

	if (!event.user[0].hasOwnProperty('userid')) {
		console.log('error: event user info does not contain userid');
		console.log(event);
		return "";
	}

	return event.user[0].userid;
}

bot.on('registered', function (data) {
	if (!data.user) {
		return;
	}

	if (!queue) {
		queue = new DJQueue();
	}

	let userID = getUserIDFromEvent(data);

	// console.log("registered");
	// console.log(data);
	// console.log(userID);
	// console.log(queue.getUserName(userID));

	queue.registerUser(data['user'][0].userid, data['user'][0].name);

	if (oneAndDone) {
		bot.pm("Welcome! The room is currently one and done. Feel free to add yourself to the rotation by snagging a DJ spot, or by typing /addme.\n", userID);
	}
});

bot.on('newsong', (data) => {
	currentSong = data["room"]["metadata"]["current_song"]["metadata"]["mnid"];
	currentSongPlays = 0;
	if (oneAndDone) {
		console.log('queue after new song');
		console.log(queue.getQueue());
		console.log({lastDJ});
	}

	lastDJ = data.room.metadata.current_dj;
});

bot.on('add_dj', (data) => {
	let userid = data['user'][0].userid;

	currentDJs = Object.values(data.djs);

	console.log('adding dj');
	console.log({data});
	console.log(queue.getUserName(userid));
	console.log({currentDJs});
	currentDJs.forEach((dj) => {
		console.log(queue.getUserName(dj));
	});

	if (nextDJInLine) {
		if (userid != nextDJInLine.id) {
			bot.speak("Hang tight, we're still waiting for @" + nextDJInLine.name + " to hop up.");
			bot.remDj(userid);
			return;
		}
		nextDJInLine = null;
		clearTimeout(nextInLineTimeout);
	}

	maintainingQueueOrder = false;

	if (!oneAndDone) {
		return
	}

	console.log("current djs after adding");
	console.log({currentDJs});
	console.log('current dj names after adding');
	if (Array.isArray(currentDJs)) {
		currentDJs.forEach((cdj) => {
			console.log(queue.getUserName(cdj));
		})
	}

	queue.removeDJ(userid);

	queue.registerUser(userid, data['user'][0].name);
});

bot.on('rem_dj', function (data) {
	console.log("remove dj!");
	let userid = data['user'][0].userid;
	console.log({userid});
	console.log({data});

	let removedDJid = userid;

	currentDJs = Object.values(data.djs);

	console.log("current djs after removing");
	console.log({currentDJs});
	console.log({removedDJid});
	console.log({maintainingQueueOrder});

	if (!oneAndDone || maintainingQueueOrder) {
		return;
	}

	shiftQueue(removedDJid);
});

function shiftQueue(removedDJid) {
	console.log('queue before popping');
	console.log(queue.getQueue());

	let nextDJ = queue.findNext();

	console.log('queue after popping');
	console.log(queue.getQueue());
	console.log({nextDJ});

	if (!nextDJ) {
		return;
	}

	if (nextDJ.id === removedDJid) {
		stopRotate();
		bot.speak('@' + nextDJ.name + " is next, but they just played. One is done is disengaged. Type /rotate to start it again.");
		return;
	}

	if (!nextDJ.name) {
		return;
	}

	nextDJInLine = nextDJ;
	bot.speak('@' + nextDJ.name + ", you have 1 minute to get up!");

	maintainingQueueOrder = true;

	nextInLineTimeout = setTimeout(() => {
		nextDJInLine = null;
		bot.speak('@' + nextDJ.name + ", you have been bumped from the queue. Type /addme to add yourself again.");
		maintainingQueueOrder = false;
		if (queue.getQueue().length > 0)  {
			shiftQueue(removedDJid);
		}
	},60000);
}

bot.on('snagged', function (data) {
	currentSongPlays++;
	console.log("on snagged");
	console.log({data});
	bot.playlistAdd(currentSong);
});

bot.on('deregistered', function (data) {
	if (oneAndDone) {
		queue.removeDJFromQueue(getUserIDFromEvent(data));

		console.log('queue after user is deregistered');
		console.log(queue.getQueue());
	}
});

bot.on('newsong', function (data) {
	if (!data.room || !data.room.metadata || !data.room.metadata.current_dj) {
		return;
	}

	currentDJ = data.room.metadata.current_dj;
	currentDJs = data.room.metadata.djs;

	if (!oneAndDone || !currentDJ) {
		return;
	}

	if (!userPlays.hasOwnProperty(currentDJ)) {
		userPlays[currentDJ] = 0;
	}

	userPlays[currentDJ]++;
});

bot.on('endsong', function (data) {
	currentDJs = data.room.metadata.djs;
	let currentDJ = data.room.metadata.current_dj;

	if (!oneAndDone) {
		if (toEscort.hasOwnProperty(currentDJ) && toEscort[currentDJ] === true) {
			toEscort[currentDJ] = false;
			bot.remDj(currentDJ);
			bot.speak('@'+queue.getUserName(currentDJ) + ', as requested you have been escorted down.');
		}
	}

	console.log('end song!');

	console.log(data);
	console.log(currentDJ);
	console.log(queue.getUserName(currentDJ));
	console.log({rotateStarted});
	console.log({oneAndDone});
	console.log(currentDJs[0]);
	console.log(queue.getUserName(currentDJs[0]));

	if (currentDJs.length < numberOfSeats && oneAndDone === false && rotateStarted === true) {
		rotateStarted = false;
		return;
	}

	if (currentDJs.length < numberOfSeats && oneAndDone === true) {
		stopRotate();
		return;
	}

	if (rotateStarted === true && oneAndDone === false && currentDJs.length > 0 && currentDJ == currentDJs[0]) {
		oneAndDone = true;
		rotateStarted = false;
	}

	if (!oneAndDone) {
		return;
	}

	console.log({userPlays});
	console.log({currentDJ});

	console.log("should be removing DJ");

	console.log(userPlays[currentDJ]);
	console.log({playLimit});

	if (!userPlays.hasOwnProperty(currentDJ) || userPlays[currentDJ] >= playLimit) {
		console.log({queue});
		bot.remDj(currentDJ, (remDJResult) => {
			console.log({remDJResult});
			if (remDJResult.success == false) {
				return;
			}
			console.log("remove dj callback");
			queue.addDJToQueue(currentDJ, queue.getUserName(currentDJ));
			printQueue();
		});
	}
});

function printQueue() {
	bot.speak("Current queue is: " + queue.getQueue().map(function(dj) {
		return dj.name;
	}).join(", "));
}
