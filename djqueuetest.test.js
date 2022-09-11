const DJQueue = require('./djqueue');
const main = require('./chillybotstuff');

let djQueue;

beforeEach(() => {
     djQueue = new DJQueue();
});

test('pushes to queue for first time', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("6230bdffb61992001d3efc9c", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);
    expect(djQueue.getQueue()[0].id).toBe("6230bdffb61992001d3efc9c");
    expect(djQueue.getQueue()[0].name).toBe("Iggy Poop");
});

test('pushes to queue for first time', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("6230bdffb61992001d3efc9c", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);
    expect(djQueue.getQueue()[0].id).toBe("6230bdffb61992001d3efc9c");
    expect(djQueue.getQueue()[0].name).toBe("Iggy Poop");
});

test('adds a new dj with an existing DJ in queue', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue('1', "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue('2', "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);
    expect(djQueue.getQueue()[0].previousDJ).toBe(undefined);
    expect(djQueue.getQueue()[0].nextDJ).toBe('2');
    expect(djQueue.getQueue()[1].previousDJ).toBe('1');
    expect(djQueue.getQueue()[1].nextDJ).toBe(undefined);
});

// 1 -> 2
test('handles adding a dj to queue when dj is already in queue', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue('1', "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);
    
    djQueue.addDJToQueue('2', "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue('2', "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    console.log(djQueue.getQueue());

    expect(djQueue.getQueue()[0].previousDJ).toBe(undefined);
    expect(djQueue.getQueue()[0].nextDJ).toBe('2');
    expect(djQueue.getQueue()[1].previousDJ).toBe('1');
    expect(djQueue.getQueue()[1].nextDJ).toBe(undefined);
});

//start with queeue:
// 1 -> 2 -> 3
//new queue should look like
// 2 -> 3 -> 1
test('leader can join back of queue', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '2');

    expect(djQueue.getQueue().length).toBe(3);

    djQueue.addDJToQueue("1", "Iggy Poop", '3');

    expect(djQueue.getQueue().length).toBe(3);

    let iggy = djQueue.getQueue()[0];
    expect(iggy.nextDJ).toBe(undefined);
    expect(iggy.previousDJ).toBe('3');

    let dieter = djQueue.getQueue()[1];
    expect(dieter.nextDJ).toBe('3');
    expect(dieter.previousDJ).toBe(undefined);

    let majik = djQueue.getQueue()[2];
    expect(majik.nextDJ).toBe('1');
    expect(majik.previousDJ).toBe('2');
});

//1 -> 2 -> 3 -> 4
//2 -> 3 -> 1 -> 4
test('leader can join middle of queue', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '2');

    expect(djQueue.getQueue().length).toBe(3);

    djQueue.addDJToQueue("4", "four", '3');

    expect(djQueue.getQueue().length).toBe(4);

    console.log(djQueue.getQueue());

    djQueue.addDJToQueue("1", "Iggy Poop", '3');

    expect(djQueue.getQueue().length).toBe(4);

    let iggy = djQueue.getQueue()[0];
    expect(iggy.nextDJ).toBe('4');
    expect(iggy.previousDJ).toBe('3');

    let dieter = djQueue.getQueue()[1];
    expect(dieter.nextDJ).toBe('3');
    expect(dieter.previousDJ).toBe(undefined);

    let magik = djQueue.getQueue()[2];
    expect(magik.nextDJ).toBe('1');
    expect(magik.previousDJ).toBe('2');
});

//start with queeue:
// 1 -> 2 -> 3 -> 5
// what happens when DJ 4 enters the queue after DJ 2?
//new queue should look like
// 1 -> 2 -> 4 -> 3 -> 5
test('adds a new dj in the middle of the queue', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '2');

    expect(djQueue.getQueue().length).toBe(3);

    djQueue.addDJToQueue("5", "Five", '3');

    expect(djQueue.getQueue().length).toBe(4);

    djQueue.addDJToQueue("4", "Nein!", '2');

    expect(djQueue.getQueue().length).toBe(5);

    let iggy = djQueue.getQueue()[0];
    expect(iggy.id).toBe('1');

    let dieter = djQueue.getQueue()[1];
    expect(dieter.id).toBe('2');

    let majick = djQueue.getQueue()[2];
    expect(majick.id).toBe('3');

    let five = djQueue.getQueue()[3];
    expect(five.id).toBe('5');

    let nein = djQueue.getQueue()[4];
    expect(nein.id).toBe('4');

    expect(iggy.nextDJ).toBe('2');
    expect(dieter.nextDJ).toBe('4');
    expect(majick.nextDJ).toBe('5');
    expect(nein.nextDJ).toBe('3');
    expect(five.nextDJ).toBe(undefined);

    expect(iggy.previousDJ).toBe(undefined);
    expect(dieter.previousDJ).toBe('1');
    expect(majick.previousDJ).toBe('4');
    expect(nein.previousDJ).toBe('2');
    expect(five.previousDJ).toBe('3');
});

// 1
// 1 -> 2
// 1 -> 3 -> 2
// 1 -> 4 -> 3 -> 2
//1 -> 4 -> 3 -> 2 -> 5
test('do a big do si do', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '1');

    expect(djQueue.getQueue().length).toBe(3);

    djQueue.addDJToQueue("4", "Four", '1');

    expect(djQueue.getQueue().length).toBe(4);

    djQueue.addDJToQueue("5", "Nein!", '2');

    expect(djQueue.getQueue().length).toBe(5);

    console.log(djQueue.getQueue());

    let iggy = djQueue.getQueue()[0];
    expect(iggy.id).toBe('1');
    expect(iggy.previousDJ).toBe(undefined);
    expect(iggy.nextDJ).toBe('4');

    let dieter = djQueue.getQueue()[1];
    expect(dieter.id).toBe('2');
    expect(dieter.previousDJ).toBe('3');
    expect(dieter.nextDJ).toBe('5');

    let magjik = djQueue.getQueue()[2];
    expect(magjik.id).toBe('3');
    expect(dieter.previousDJ).toBe('3');
    expect(dieter.nextDJ).toBe('5');

    let four = djQueue.getQueue()[3];
    expect(four.id).toBe('4');
    expect(four.previousDJ).toBe('1');
    expect(four.nextDJ).toBe('3');

    let five = djQueue.getQueue()[4];
    expect(five.id).toBe('5');
    expect(five.previousDJ).toBe('2');
    expect(five.nextDJ).toBe(undefined);
});

//3
test('all djs drop out except one', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '1');

    expect(djQueue.getQueue().length).toBe(3);

    djQueue.removeDJFromQueue('1');
    djQueue.removeDJFromQueue('2');

    let iggy = djQueue.getQueue()[0];
    expect(iggy.id).toBe('3');
    expect(iggy.previousDJ).toBe(undefined);
    expect(iggy.nextDJ).toBe(undefined);
});

test('remove dj from middle of queue', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '2');

    expect(djQueue.getQueue().length).toBe(3);

    djQueue.removeDJFromQueue('2');

    expect(djQueue.getQueue().length).toBe(2);

    let iggy = djQueue.getQueue()[0];
    expect(iggy.id).toBe('1');
    expect(iggy.nextDJ).toBe('3');
    expect(iggy.previousDJ).toBe(undefined);

    let magjik = djQueue.getQueue()[1];
    expect(magjik.id).toBe('3');
    expect(magjik.nextDJ).toBe(undefined);
    expect(magjik.previousDJ).toBe('1');
});

test('determine second to rightmost dj', () => {
    let djID = main.determineSecondToRightMostDJ({'0': '123', '1': '456', '2': '789', '3': '1010', '4':  '1111'});

    expect(djID).toBe('1010');

    let djID2 = main.determineSecondToRightMostDJ({'0': '123', '1': '456'});

    expect(djID2).toBe('123');
});

test('determine rightmost dj', () => {
    let djID = main.determineRightMostDJ({'0': '123', '1': '456', '2': '789', '3': '1010', '4':  '1111'});

    expect(djID).toBe('1111');

    let djID2 = main.determineRightMostDJ({'0': '123', '1': '456'});

    expect(djID2).toBe('456');
});

test('get next dj', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '2');

    let next = djQueue.getNextDJ('2');

    expect(next.id).toBe('3');

    let next2 = djQueue.getNextDJ('3');

    expect(next2.id).toBe('1');
});

test('get previous dj', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '2');

    let previousDJ = djQueue.getPreviousDJ('2');

    expect(previousDJ.id).toBe('1');

    let previousDJ2 = djQueue.getPreviousDJ('1');

    expect(previousDJ2.id).toBe('3');
});

test('get leader dj', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '2');

    let next = djQueue.getNextDJ('2');

    expect(next.id).toBe('3');

    expect(djQueue.getLeaderDJ()).toBe('1');

    djQueue.removeDJFromQueue('1');

    expect(djQueue.getLeaderDJ()).toBe('2');
});

// 1
// 1 -> 2
// 1 -> 3 -> 2
// 1 -> 4 -> 3 -> 2
// 1 -> 4 -> 3 -> 2
// 1 -> 4 -> 3 -> 2 -> 5
test('do a big do si do', () => {
    expect(djQueue.getQueue().length).toBe(0);

    djQueue.addDJToQueue("1", "Iggy Poop");

    expect(djQueue.getQueue().length).toBe(1);

    djQueue.addDJToQueue("2", "Dieter", '1');

    expect(djQueue.getQueue().length).toBe(2);

    djQueue.addDJToQueue("3", "Magjik", '1');

    expect(djQueue.getQueue().length).toBe(3);

    djQueue.addDJToQueue("4", "Four", '1');

    expect(djQueue.getQueue().length).toBe(4);

    let lastDJ = djQueue.getDanglingDJ();

    expect(lastDJ.id).toBe('2');

    djQueue.addDJToQueue("5", "Five", '2');

    let lastDJ2 = djQueue.getDanglingDJ();

    expect(lastDJ2.id).toBe('5');

    // djQueue.addDJToQueue("1", "Iggy Poop", "5");
    //
    // let lastDJ3 = djQueue.getDanglingDJ();
    //
    // expect(lastDJ3).toBe(undefined);
});

function newEndSongMessage() {
    return {
        command: 'endsong',
        room: {
            chatserver: [ 'chat1.turntable.fm', 8080 ],
            description: 'Rockit Zie Sprocket! \n\nSaturday nights...touch the monkey!\n',
            created: 1619135062.897962,
            shortcut: 'sprockets',
            name: 'SPROCKETS!',
            roomid: '60820a5647c69b001b3aa1f9',
            metadata: {
                songlog: [Array],
                dj_full: false,
                djs: [Array],
                screen_uploads_allowed: true,
                current_song: [Object],
                privacy: 'public',
                max_djs: 5,
                downvotes: 0,
                userid: '6046b7da47b5e3001be33735',
                listeners: 3,
                featured: false,
                djcount: 1,
                current_dj: '6230bdffb61992001d3efc9c',
                djthreshold: 0,
                moderator_id: [Array],
                upvotes: 0,
                max_size: 200,
                votelog: []
            }
        },
        success: true
    };
}

function newDJAddedMessage(ID) {
    return  {
        djs: { '0': '6230bdffb61992001d3efc9c' },
        success: true,
        command: 'add_dj',
        user: [
        {
            fanofs: 61,
            name: 'Iggy Plop',
            created: 1647361535.962828,
            laptop: 'mac',
            userid: ID,
            acl: 0,
            fans: 70,
            points: 11153,
            images: [Object],
            _id: '6230bdffb61992001d3efc9c',
            avatarid: 4,
            registered: 1647361609.780876
        }
    ],
        roomid: '60820a5647c69b001b3aa1f9',
        placements: [
        {
            top: 219,
            angle: -132.70154960781997,
            sticker_id: '62195830bbddf1f5995a6d5a',
            left: -17
        },
    ]
    };
}

function newSomeoneSpokeMessage() {
    return {
        command: 'speak',
        userid: '6230bdffb61992001d3efc9c',
        name: 'Iggy Plop',
        roomid: '60820a5647c69b001b3aa1f9',
        text: '/test'
    };
}
