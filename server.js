// Define 'require'
import module from 'module';
const require = module.createRequire(import.meta.url);

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const favicon = require('serve-favicon');
var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'kaspichessdb',    
    port            : 3306
});

import { parse } from '@mliebelt/pgn-parser';

import { Chess } from 'chess.js';
const chess = new Chess();

// Test peon pasado
chess.move('e4');
chess.move('c5');
chess.move('e5');
chess.move('f5');
console.log(chess.history({ verbose: true }));

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + '/public'));

app.use(favicon(__dirname + '/public/favicon.ico'));

io.on('connection', async function(socket){

    console.log('A user connected. Sending initial SAN moves');
    const resultSelectSansIni = await SelectSansFromTree(1);
    console.log(resultSelectSansIni);
    io.to(socket.id).emit('SANs',{resultSelectSans:resultSelectSansIni,Nodo:1});

    socket.on('SeekFEN', async function (msg) {
        console.log(msg);
        var resultSeekFEN = await SelectFENFromTree(msg);
        if (resultSeekFEN.length > 0){
            console.log(resultSeekFEN[0].Nodo);
            // Pasar nodo padre para optener los movimientos SANs
            var resultSelectSans = await SelectSansFromTree(resultSeekFEN[0].Nodo);
            io.to(socket.id).emit('SANs',{resultSelectSans:resultSelectSans,Nodo:resultSeekFEN[0].Nodo});
        }else{
            var resultSelectSans = [];
            io.to(socket.id).emit('SANs',{resultSelectSans:resultSelectSans,Nodo:0});
        }
    });

    socket.on('LoadGames', async function (msg) {

        console.log('nIndexGames: ' + msg.nIndexGames)
        
        var resultSelectGames = await SelectGames(msg);
        
        var resultFormated = [];

        for (var i = 0; i < resultSelectGames.length; i++){
            var game = parse(resultSelectGames[i].PGNGame, {startRule: "game"});            
            resultFormated.push({IdGame:resultSelectGames[i].IdGame,White:game.tags.White,WhiteElo:game.tags.WhiteElo,Black:game.tags.Black,BlackElo:game.tags.BlackElo,Event:game.tags.Event,Date:game.tags.Date.value,Result:game.tags.Result});
        }
        
        //console.log(JSON.stringify(game.tags.White, null, 2))
        //console.log(JSON.stringify(game.tags.Date.year, null, 2))

        socket.emit('LoadGamesBack',{resultSelectGames:resultFormated,nIndexGames:msg.nIndexGames});
    }); 
    
    socket.on('LoadLastGames', async function (msg) {
        var aCountGames = await CountGames(msg);
        console.log('Numero de registros: ' + aCountGames.length);

        var nIndexGames = aCountGames.length - 10;
        if (nIndexGames < 0){
            nIndexGames = 0;
        }

        var resultSelectGames = await SelectGames({Nodo:msg.Nodo,nIndexGames:nIndexGames});
        
        var resultFormated = [];

        for (var i = 0; i < resultSelectGames.length; i++){
            var game = parse(resultSelectGames[i].PGNGame, {startRule: "game"});            
            resultFormated.push({IdGame:resultSelectGames[i].IdGame,White:game.tags.White,WhiteElo:game.tags.WhiteElo,Black:game.tags.Black,BlackElo:game.tags.BlackElo,Event:game.tags.Event,Date:game.tags.Date.value,Result:game.tags.Result});
        }
        
        //console.log(JSON.stringify(game.tags.White, null, 2))
        //console.log(JSON.stringify(game.tags.Date.year, null, 2))

        socket.emit('LoadGamesBack',{resultSelectGames:resultFormated,nIndexGames:nIndexGames});
    });
    
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });

});

http.listen(process.env.PORT || 3000, function() {
    console.log('Server listening on port 3000');
});

// Funciones
async function SelectSansFromTree(NodoPadre){
    return new Promise((resolve, reject)=>{
        pool.query("SELECT * FROM tree WHERE NodoPadre = '" + NodoPadre + "' ORDER BY Games DESC", (error, results)=>{
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};

async function SelectFENFromTree(FEN){
    return new Promise((resolve, reject)=>{
        pool.query("SELECT * FROM tree WHERE FEN = '" + FEN + "'", (error, results)=>{
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};

async function SelectGames(msg){
    return new Promise((resolve, reject)=>{
        pool.query("SELECT gameref.IdGame,games.PGNGame FROM gameref JOIN games ON gameref.IdGame=games.IdGame WHERE gameref.Nodo='" + msg.Nodo + "' LIMIT " + msg.nIndexGames + " , 10", (error, results)=>{
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};

async function CountGames(msg){
    console.log('Nodo: ' + msg.Nodo);
    return new Promise((resolve, reject)=>{
        pool.query("SELECT * FROM gameref WHERE Nodo = '" + msg.Nodo + "'", (error, results)=>{
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};