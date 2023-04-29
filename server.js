// Define 'require'
import module from 'module';
const require = module.createRequire(import.meta.url);

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

import { Chess } from 'chess.js';

const chess = new Chess();

import path from 'path';
import {fileURLToPath} from 'url';
//import { finished } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
   console.log('A user connected');

   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});

http.listen(process.env.PORT || 3000, function() {
   console.log('Server listening on port 3000');
});