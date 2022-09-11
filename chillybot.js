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
// var ROOMID = '62b8af5088b736001dfd4052';

let bot = new Bot(AUTH, USERID, ROOMID);
bot.debug = true;

let lastDJ = undefined;
let oneAndDone = false;
let currentDJs = [];

let queue;

bot.on('ready', function (data) {
	bot.roomRegister(ROOMID);
	queue = new DJQueue();
});

bot.on('roomChanged', function (data) {
	currentDJs = Object.assign({}, data.room.metadata.djs);

	if (oneAndDone) {
		addCurrentDJsToQueue();
	}
	bot.bop();
});

bot.on('speak', function (data) {
	if (!data.text) {
		return;
	}

	if (data.text === '/rotate' && !oneAndDone) {
		oneAndDone = true;

		addCurrentDJsToQueue();

		bot.speak('One and done engaged!');
		return;
	}

	if (data.text === '/beforeme' && oneAndDone) {
		let djSpoke = queue.getQueue().find((dj) =>  {
			return dj.id === data.userid;
		});

		if (!djSpoke) {
			bot.speak("You are not in the queue!");
			return;
		}

		let previousDJ = queue.getPreviousDJ(data.userid);

		if (!previousDJ) {
			bot.speak("I'm not sure who is before you!");
			return;
		}

		bot.speak("@" + previousDJ.name + " is before you");
	}

	if (data.text === '/afterme' && oneAndDone) {
		let djSpoke = queue.getQueue().find((dj) =>  {
			return dj.id === data.userid;
		});

		if (!djSpoke) {
			bot.speak("You are not in the queue!");
			return;
		}

		let nextDJ = queue.getNextDJ(data.userid);

		if (!nextDJ) {
			bot.speak("I'm not sure who is after you!");
		}

		bot.speak("@" + nextDJ.name + " is after you.");
	}

	if (data.text === '/rotate' && oneAndDone) {
		bot.speak('One and done already engaged! To disengage, type /stoprotate');
		return;
	}

	if (data.text === '/rotate' && oneAndDone) {
		bot.speak('One and done already engaged! To disengage, type /stoprotate');
		return;
	}

	if (data.text === '/stoprotate' && oneAndDone) {
		oneAndDone = false;
		queue.clear();
		bot.speak('One and done disengaged! Spin as much as you like. Do not exercise moderation.');
		return;
	}

	if (data.text === '/stoprotate' && !oneAndDone) {
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

		queue.removeDJFromQueue(data.userid);
		console.log('queue after removing DJ from queue');
		console.log(queue.getQueue());

		bot.speak('@' + data.name + ", you have been removed from the queue.");
		return;
	}

	if (data.text.startsWith('/addme')) {
		if (!oneAndDone) {
			bot.speak('@' + data.name + ", there currently is no queue. Feel free to hop up whenever suits you.");
			return;
		}

		let queuedDJ = queue.getQueue().find((dj) =>  {
			return dj.id === data.userid;
		});

		if (queuedDJ) {
			//tell user who they are after
			bot.speak('@' + data.name + ", I'm confused. You are already in the queue!");
			return;
		}

		let danglingDJ = queue.getDanglingDJ();

		if (danglingDJ && danglingDJ.id !== data.userid)  {
			queue.addDJToQueue(data.userid, data.name, danglingDJ.id);
			bot.speak('@' + data.name + ", you have been added to the queue!");
			console.log("queue after adding DJ after dangling DJ");
			console.log(queue.getQueue());
			return;
		}

		let cDJs = Object.values(currentDJs);
		if (cDJs.length > 0) {
			let firstPlayingDJ = cDJs[0];
			if (firstPlayingDJ.previousDJ !== undefined) {
				queue.addDJToQueue(data.userid, data.name, firstPlayingDJ.previousDJ);
				bot.speak('@' + data.name + ", you have been added to the queue!");
				console.log("queue after adding DJ when queue is circular");
				console.log(queue.getQueue());
				return;
			} else {
				queue.addDJToQueue(data.userid, data.name, cDJs[cDJs.length - 1].id);
				bot.speak('@' + data.name + ", you have been added to the queue!");
				console.log("queue when adding DJ when queue is not circular");
				console.log(queue.getQueue());
				return;
			}
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

function addCurrentDJsToQueue() {
	let lastDJID;
	Object.values(currentDJs).forEach(djID => {
		bot.getProfile(djID, (prof) => {
			queue.addDJToQueue(prof.userid, prof.name, lastDJID);
			lastDJID = djID;
			lastDJ = djID;

			console.log('queue after adding DJ to queue');
			console.log(queue.getQueue());
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

	let userID = getUserIDFromEvent(data);

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
	currentDJs = data.djs;

	console.log('queue before adding dj');
	console.log(queue.getQueue());

	if (!oneAndDone) {
		return;
	}

	queue.addDJToQueue(data['user'][0].userid, data['user'][0].name, stuff.determineSecondToRightMostDJ(data.djs));

	console.log('queue after adding dj');
	console.log(queue.getQueue());
});

bot.on('rem_dj', function (data) {
	currentDJs = data.djs;

	console.log('queue when removing dj');
	console.log(queue.getQueue());
	console.log({currentDJs});

	if (currentDJs.length < 1) {
		queue.getQueue().clear();
		console.log('queue cleared');
		console.log(queue.getQueue());
	}

	if (!oneAndDone) {
		return;
	}

	let rightMostDJID = stuff.determineRightMostDJ(data.djs);

	if (!rightMostDJID) {
		return;
	}

	let rightMostDJ = queue.getQueue().find((dj) => {
		return dj.id === rightMostDJID;
	});

	if (rightMostDJ === undefined) {
		return;
	}

	let next = queue.getQueue().find((dj) => {
		return dj.id === rightMostDJ.nextDJ;
	});

	if (!next)  {
		let leftMostDJ = queue.getQueue().find((dj) => {
			return dj.previousdJ === undefined;
		});

		if (Object.values(currentDJs).includes(leftMostDJ.id)) {
			return;
		}

		bot.speak('@' + leftMostDJ.name + ", you're up!");
		return;
	}

	if (Object.values(currentDJs).includes(next.id)) {
		return;
	}

	console.log('queue when notifying next dj');
	console.log(queue.getQueue());

	bot.speak('@' + next.name + ", you're up!");
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

bot.on('endsong', function (data) {
	if (!data.room || !data.room.metadata || !data.room.metadata.current_dj) {
		return;
	}

	if (oneAndDone) {
		console.log('queue after song ended');
		console.log(queue.getQueue());
		bot.remDj(lastDJ);
	}
});
