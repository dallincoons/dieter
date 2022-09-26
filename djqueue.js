class DJQueue {
    constructor() {
        this.queue = [];
        this.registeredUsers = [];
    }

    getQueue() {
        return this.queue;
    }

    findNext() {
        return this.queue.shift();
    }

    registerUser(id, name) {
        console.log('register new user');
        console.log({id});
        console.log({name});
        if (!this.registeredUsers.hasOwnProperty(id)) {
            this.registeredUsers[id] = name;
        }
    }

    getUserName(id) {
        if (this.registeredUsers.hasOwnProperty(id)) {
            return this.registeredUsers[id];
        }

        return "";
    }

    addDJToQueue(id, name, previousID = null) {
        // if (id === previousID) {
        //     return;
        // }

        let index = this.queue.findIndex((dj) => {
            return dj.id == id;
        });
        if (index > -1) {
            return;
        }

        if (name === "") {
            console.log("name is empty");
            return;
        }

        if (id === "") {
            console.log("id is empty");
            return;
        }

        console.log({id});
        console.log({name});

        this.registerUser(id, name);

        //if there is nobody in queue, simply add the dJ to the queue and be done
        // if (this.queue.length < 1) {
        this.queue.push({
            id: id,
            name: name,
            previousDJ: undefined,
            nextDJ: undefined,
            first: true,
        });

        console.log("queue");
        console.log(this.queue);

            //somehow notify caller this is the first on the queue?
        return;
        // }

        // let previousDJ = this.queue.find((dj) => {
        //     return dj.id === previousID;
        // });

        // if (!previousDJ) {
        //     console.log("error: there is no previous dj for " + previousID);
        //     //not sure how to fix this yet
        //     return;
        // }

        let inQueue = this.queue.find((dj) => {
            return dj.id === id;
        });

        let thisDJ = this.queue.find((dj) => {
            return dj.id === id;
        });

        let nextDJ = this.queue.find((dj) => {
            return dj.id === previousDJ.nextDJ;
        });

        //if we're adding the first DJ in the queue,
        if (inQueue) {
            // if (previousDJ.previousDJ === thisDJ.id) {
            //     previousDJ.previousDJ = thisDJ.previousDJ;
            //     thisDJ.nextDJ = previousDJ.nextDJ;
            // }

            // if (thisDJ.previousDJ === undefined) {
            //     nextDJ.previousDJ = un
            // }

            if (thisDJ.nextDJ) {
                let nextDJAfterThis = this.queue.find((dj) => {
                    return dj.id === thisDJ.nextDJ;
                });
                if (nextDJAfterThis) {
                    nextDJAfterThis.previousDJ = thisDJ.previousDJ;
                }
            }

            thisDJ.previousDJ = previousDJ.id;
            if (previousDJ && previousDJ.nextDJ !== thisDJ.id) {
                thisDJ.nextDJ = previousDJ.nextDJ;
                previousDJ.nextDJ = thisDJ.id;
            }
            if (nextDJ && nextDJ.id !== thisDJ.id) {
                nextDJ.previousDJ = thisDJ.id;
            }

            return;
        }

        //handle cutting into middle of queue
        if (previousDJ.nextDJ != null) {
            this.queue.push({
                id: id,
                name: name,
                previousDJ: previousDJ.id,
                nextDJ: nextDJ.id,
                first: false,
            });

            nextDJ.previousDJ = id;
            previousDJ.nextDJ = id;

            return;
        }

        if (thisDJ && thisDJ.previousDJ === undefined) {
            thisDJ.previousDJ = previousID;
            previousDJ.nextDJ = thisDJ.id;
            return;
        }

            this.queue.push({
                id: id,
                name: name,
                previousDJ: previousDJ.id,
                nextDJ: undefined,
                first: false,
            });
            previousDJ.nextDJ = id;
    }

    removeDJ(id) {
        this.queue = this.queue.filter((dj) =>  {
            return dj.id !== id;
        });
    }

    getNextDJ(id) {
        let currentDJ = this.queue.find((dj) => {
            return dj.id === id;
        });

        if  (!currentDJ) {
            //do something?
            return;
        }

        if (currentDJ.nextDJ === undefined) {
            let firstDJ = this.queue.find((dj) => {
                return dj.previousDJ === undefined;
            });

            if (!firstDJ) {
                return;
            }

            return firstDJ;
        }

        let nextDJ = this.queue.find((dj) => {
            return dj.id === currentDJ.nextDJ;
        });

        return nextDJ;
    }

    getPreviousDJ(id) {
        let currentDJ = this.queue.find((dj) => {
            return dj.id === id;
        });

        if  (!currentDJ) {
            //do something?
            return;
        }

        if (currentDJ.previousDJ === undefined) {
            let lastDJ = this.getDanglingDJ();

            if (!lastDJ) {
                return;
            }

            return lastDJ;
        }

        let previousDJ = this.queue.find((dj) => {
            return dj.id === currentDJ.previousDJ;
        });

        return previousDJ;
    }

    getLeaderDJ() {
        let leaderDJ = this.queue.find((dj) => {
            return dj.previousDJ === undefined;
        });

        if  (!leaderDJ) {
            //do something?
            return;
        }

        return leaderDJ.id;
    }

    removeDJFromQueue(ID) {
        let removeDJ = this.queue.find((dj) => {
            return dj.id === ID;
        });

        console.log({removeDJ});

        if (!removeDJ) {
            console.log("Not in the queue! " + ID);
            //what else do we need to do?
            return 1;
        }

        let previousDJ = this.queue.find((dj) => {
            return dj.id === removeDJ.previousDJ;
        });

        let nextDJ = this.queue.find((dj) => {
            return dj.id === removeDJ.nextDJ;
        });

        if (previousDJ && nextDJ) {
            previousDJ.nextDJ = nextDJ.id;
            nextDJ.previousDJ = previousDJ.id;
        } else if (previousDJ) {
            previousDJ.nextDJ = undefined;
        } else if (nextDJ) {
            nextDJ.previousDJ = undefined;
        }

        let removeDJIndex = this.queue.findIndex((dj) => {
            return dj.id === ID;
        });

        this.queue.splice(removeDJIndex, 1);
    }

    clear() {
        this.queue = [];
    }

    getDanglingDJ() {
        if (this.queue.length < 1) {
            return;
        }

        return this.queue.find((dj) => {
            return dj.nextDJ === undefined;
        });
    }
}

function createNewDJ(dj, nextDj) {
    return {
        id: '',
        name: '',
        nextDJ: '',
        previousDJ: null,
    }
}

module.exports = DJQueue;
