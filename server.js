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

import { Chess } from 'chess.js';
const chess = new Chess();

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
    io.to(socket.id).emit('IniSANs',resultSelectSansIni);

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
        pool.query("SELECT * FROM tree WHERE NodoPadre = '" + NodoPadre + "'",  (error, results)=>{
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};