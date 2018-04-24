var fs = require('fs');
var data = JSON.parse(fs.readFileSync('v3_chart.json', 'utf8'));
//course[0] !== -1;
var a = [0];
var v = [0];
var p = [0];
var t = 0;

function fireThrusters(t, t2) {
  console.log('['+ t + ']');
  if(t>0) {
    if(a[t] === undefined) {
      console.log('go ahead');
      for(var i = 1; i >= -1; i--) {
        // no death occur
        if(!checkDeathByBlast(t, i) && !checkDeathByHittingAnAsteroid(t, i) && !checkDeathByHittingEschatonItself(t, i)) {
          a.push(i);
          v.push(v[t-1] + i);
          p.push(p[t-1] + v[t-1] + i);
          console.log('go ahead succed');
          if(t === t2) {
            return;
          } else {
            return fireThrusters(t+1);
          }
        }   
      }
      console.log('go ahead fail');
      return fireThrusters(t-1);
    } else {
      console.log('go back');
      var previousAcc = a[t];
      a.pop();
      v.pop();
      p.pop();
      for(var i = previousAcc - 1; i >= -1; i--) {
        // no death occur
        if(!checkDeathByBlast(t, i) && !checkDeathByHittingAnAsteroid(t, i) && !checkDeathByHittingEschatonItself(t, i)) {
          a.push(i);
          v.push(v[t-1] + i);
          p.push(p[t-1] + v[t-1] + i);
          console.log('go back succed');
          return fireThrusters(t+1);
        }
      }
      console.log('go back fail, go back further');
      return fireThrusters(t-1);
    }   
  }
}

while(p[p.length - 1] <= data.asteroids.length) {
  
  fireThrusters(++t, ++t);
  console.log(t);
  // console.log(a);
  // console.log(v);
  // console.log(p);
}

function checkDeathByBlast(t, a) {
  return (t === data["t_per_blast_move"] && p[t-1] + v[t-1] + a === 0) ? true : false;
}

function checkDeathByHittingAnAsteroid(t, a) {
  if(p[t-1] + v[t-1] + a <= data.asteroids.length) {
    var currentPositionAsteroid = data.asteroids[p[t-1] + v[t-1] + a - 1];
    // if(t === 149) {
    //   console.log(p[t-1] + v[t-1] + a - 1);
    //   console.log(currentPositionAsteroid);
    // }
    // if(currentPositionAsteroid["t_per_asteroid_cycle"] === 1) {
    //   return true;
    // } else {
      return (t + currentPositionAsteroid["offset"])%currentPositionAsteroid["t_per_asteroid_cycle"] === 0 ? true : false;
    // }
  } else {
    return false;
  }
}

function checkDeathByHittingEschatonItself(t, a) {
  return p[t-1] + v[t-1] + a < 0 ? true : false;
}
