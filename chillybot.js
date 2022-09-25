const DJQueue = require('./djqueue');
const stuff = require('./chillybotstuff');

/*******************************BeginSetUp*****************************************************************************/
let Bot = require('ttapi');

//sprockets
var AUTH = 'dXhZHlHryToxwdnFpxSffHje';
var USERID = '628ed9e688b736001d2464f4';
// var ROOMID = '60820a5647c69b001b3aa1f9';

// var AUTH = 'dXhZHlHryToxwdnFpxSffHje';
// var USERID = '628ed9e688b736001d2464f4';
var ROOMID = '63309a47748e09001fda9864';

let bot = new Bot(AUTH, USERID, ROOMID);
bot.debug = true;

let playLimit = 1;

let queue;
let lastDJ = undefined;
let oneAndDone = false;
let currentDJ = undefined;
let currentDJs = [];
let userPlays = {};
let nextDJInLine;
let nextInLineTimeout;
let rotateStarted = false;

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
	queue.queue = [];
	registerUsers();

	oneAndDone = true;

	bot.speak('One and done engaged!');
}

bot.on('speak', function (data) {
	if (!data.text) {
		return;
	}

	if (data.text === '/commands') {
		bot.speak("\\rotate engages one and done \n \\stoprotate disengages one and done \n \\addme to add yourself to queue \n \\removeme to remove yourself from queue");
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

		bot.speak("Current queue is: " + queue.getQueue().map(function(dj) {
			return dj.name;
		}).join(", "));
	}

	if (data.text ===  '/addme') {
		if (!oneAndDone) {
			bot.speak('@' + data.name + ", there currently is no queue. Feel free to hop up whenever suits you.");
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
		bot.pm("Welcome! The room is currently one and done. Feel free to add yourself to the rotation by snagging a DJ spot, or by typing /addme.", userID);
	}
});

bot.on('newsong', (data) => {
	if (oneAndDone) {
		console.log('queue after new song');
		console.log(queue.getQueue());
		console.log({lastDJ});
	}

	lastDJ = data.room.metadata.current_dj;
});

bot.on('add_dj', (data) => {
	let userid = data['user'][0].userid;

	if (nextDJInLine) {
		if (userid != nextDJInLine.id) {
			bot.speak("Be cool, we're still waiting for @" + nextDJInLine.name + " to hop up.");
			bot.remDj(userid);
			return;
		}
		nextDJInLine = null;
		clearTimeout(nextInLineTimeout);
	}

	let index = currentDJs.findIndex((currentDJ) => {
		return currentDJ === userid
	});
	if (!index) {
		currentDJs.push(userid);
	}
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
	console.log();

	let index = currentDJs.findIndex((currentDJ) => {
		return currentDJ === userid
	});
	console.log("index when removing");
	console.log(index);
	console.log(index > -1);

	let removedDJid;

	if (index > -1) {
		removedDJid = currentDJs[index];
		currentDJs.splice(index, 1);
	}

	console.log("current djs after removing");
	console.log({currentDJs});
	console.log({removedDJid});

	if (!oneAndDone) {
		return;
	}

	let nextDJ = queue.findNext();

	console.log('queue after popping');
	console.log(queue.getQueue());
	console.log({nextDJ});

	if (!nextDJ) {
		return;
	}

	if (nextDJ.id === removedDJid) {
		bot.speak('@' + nextDJ.name + " is next, but they just played. Does anyone else want to hop up?");
		return;
	}

	if (!nextDJ.name) {
		return;
	}

	nextDJInLine = nextDJ;
	bot.speak('@' + nextDJ.name + ", you have 60 seconds to get up!");

	nextInLineTimeout = setTimeout(() => {
		nextDJInLine = null;
		clearTimeout(nextInLineTimeout);
	},60000);
});

bot.on('snagged', function (data) {
	console.log('queue after snagged');
	console.log(queue.getQueue());
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

	console.log('end song!');

	console.log(data);
	console.log(currentDJ);
	console.log(queue.getUserName(currentDJ));
	console.log({rotateStarted});
	console.log({oneAndDone});
	console.log(currentDJs[0]);
	console.log(queue.getUserName(currentDJs[0]));

	if (rotateStarted === true && oneAndDone === false && currentDJs.length > 0 && currentDJ == currentDJs[0]) {
		startOneAndDone();
		rotateStarted = false;
	}

	if (!oneAndDone) {
		return;
	}

	console.log({userPlays});
	console.log({currentDJ});

	if (!userPlays.hasOwnProperty(currentDJ) || userPlays[currentDJ] >= playLimit) {
		console.log({queue});
		queue.addDJToQueue(currentDJ, queue.getUserName(currentDJ));
		bot.speak('@' + queue.getUserName(currentDJ) + ', you have been added to the queue. Type /removeme to remove yourself.');
		bot.remDj(currentDJ);
	}
});
