function determineRightMostDJ(spinningDJs) {
    if (!spinningDJs) {
        return 0;
    }

    let djCount = Object.keys(spinningDJs).length - 1;

    if (djCount  < 0) {
        djCount = 0;
    }

    return spinningDJs[djCount.toString()];
}

function determineSecondToRightMostDJ(spinningDJs) {
    if (!spinningDJs) {
        return 0;
    }

    let djCount = Object.keys(spinningDJs).length - 2;

    if (djCount  < 0) {
        djCount = 0;
    }

    return spinningDJs[djCount.toString()];
}

module.exports.determineSecondToRightMostDJ = determineSecondToRightMostDJ;
module.exports.determineRightMostDJ = determineRightMostDJ;
