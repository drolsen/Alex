/** 
  Allows Alex access to a webpack's stats object for error reporting
*/
const Robot = require('say');
let buildFailedFlag = false;

class AlexPlugin {
  // Alex helps track down location of build errors.
  apply(compiler) {    
    compiler.hooks.done.tap({name:'AlexPlugin'}, stats => {
      if (stats.hasErrors()) {
        Robot.speak('There appears to be a build error.');
        buildFailedFlag = true;
      } else {
        if (buildFailedFlag) {
          buildFailedFlag = false;
          Robot.speak('Build back to normal.');
        }
      }
    });  
  }
}

module.exports = AlexPlugin;