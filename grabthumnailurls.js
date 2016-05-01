 const games = require('./supersmash.json').games;
var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }



games.forEach(game=>{
    
    if (game.cover_id) {
        console.log(game.cover);
        
        exec("wget "+game.cover, puts)
        
    }
});