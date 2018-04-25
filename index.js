var fs = require('fs');
// import json data from v3_chart.json
var data = JSON.parse(fs.readFileSync('v3_chart.json', 'utf8'));

// store all positions we can visit in a custmized string
// '0#0#0' means position where v == 0, p == 0 and t == 0 
// for the begining, we only have '0#0#0' to start from
// at t == 1, we will popout '0#0#0' and push '1#1#1' and '0#0#1'
// everytime t increases, we update positionsNeedToVisit
var positionsNeedToVisit = ['0#0#0'];

// positionCourses save courses used to get to certain positions
// we store the position string as key and course array as value
// we add the courses at the same time we update positions
// for example, when we get from position '0#0#0' to '1#1#1', we 
// push acceleration 1 to the end of course '0#0#0', which is [], 
// so we get [1] to get to '1#1#1' and store it as positionCourses['1#1#1'] = [1],
// same as '0#0#1', we will get positionCourses['0#0#1'] = [0]
var positionCourses = {
    '0#0#0' : []
};

// this is tag used to indicate we need to continue travel to escape or not
var conti = true;

// when we have no where to go or we already escaped, exit while loop
while(positionsNeedToVisit.length > 0 && conti) {
    // in each while loop, time increases 1, and we need to update positionsNeedToVisit
    // for each position in positionsNeedToVisit, we remove the old position and save new
    // positions we can visit safety at next step (here is t increases 1)
    var originLength = positionsNeedToVisit.length;
    for(var i = 0; i < originLength; i++) {
        // parse details about current visit position to get v, p and t
        var currentVisitPosition = {
            v: parseInt(positionsNeedToVisit[0].split('#')[0]),
            p: parseInt(positionsNeedToVisit[0].split('#')[1]),
            t: parseInt(positionsNeedToVisit[0].split('#')[2]),
        }
        for(var a = 1; a >= -1; a--) {
            // check if it's save to use acceleration a to travel from this position to next position 
            if(!checkDeathByBlast(currentVisitPosition, a) && !checkDeathByHittingAnAsteroid(currentVisitPosition, a) && !checkDeathByHittingEschatonItself(currentVisitPosition, a)) {
                // format next position's string
                var newPos = (currentVisitPosition.v + a).toString() + '#' + (currentVisitPosition.p + currentVisitPosition.v + a).toString() + '#' + (currentVisitPosition.t + 1).toString();
                
                // check if next position can get us escaped
                if(currentVisitPosition.p + currentVisitPosition.v + a <= data.asteroids.length) {

                    // here is why I choose to store position infomation as string '0#0#0' not as an object {v:0,p:0,t:0}
                    // because we will get duplicate positions, it's easy to check position already in positionsNeedToVisit or not
                    
                    // if position not in positionsNeedToVisit yet, push newPos into positionsNeedToVisit
                    if(positionsNeedToVisit.indexOf(newPos) === -1) {
                        positionsNeedToVisit.push(newPos);

                        // at the same time add new course of next position base on current position into positionCourses
                        var newCourse = positionCourses[positionsNeedToVisit[0]].slice();
                        newCourse.push(a);
                        positionCourses[newPos] = newCourse;
                    }
                } else {
                    // when next position get me escaped, write final courses to certain json file
                    var finalCourse = positionCourses[positionsNeedToVisit[0]].slice();
                    finalCourse.push(a);

                    var fileName = newPos + '.json';
                    fs.writeFile(fileName, JSON.stringify(finalCourse), (err) => {  
                        if (err) throw err;
                        console.log('Course' + fileName + 'saved!');
                    });

                    // exit while loop when find final course
                    conti = false;
                }
            }
        }
        // remove old position from positionsNeedToVisit after add all positions we can visit from this position
        positionsNeedToVisit.shift();
    }
}

// cehck if 
function checkDeathByBlast(pos, a) {
    return (pos.t === data["t_per_blast_move"] - 1 && pos.p + pos.v + a === 0) ? true : false;
}

// check if hit an asteriod
function checkDeathByHittingAnAsteroid(pos, a) {
    // when travel to position between rings of first asteriod and last asteriod, check if current asteriod's offset equals 0
    // if equals 0, we hit the asteriod
    if(pos.p + pos.v + a > 0 && pos.p + pos.v + a <= data.asteroids.length) {
        var currentPositionAsteroid = data.asteroids[pos.p + pos.v + a - 1];
        return (pos.t + 1 + currentPositionAsteroid["offset"])%currentPositionAsteroid["t_per_asteroid_cycle"] === 0 ? true : false;
    } else {
        return false;
    }
}

// check if hit eschaton itself
function checkDeathByHittingEschatonItself(pos, a) {
    return pos.p + pos.v + a < 0 ? true : false;
}
