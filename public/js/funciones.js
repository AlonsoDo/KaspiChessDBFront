var aHistoryTree = [];
var nNodoPadre = 0;
var nNodoHijo = 1;
var nDeepMove = 0;

function onDrop (source, target, piece, newPos, oldPos, orientation) {
    
    //console.log('Source: ' + source)
    //console.log('Target: ' + target)
    //console.log('Piece: ' + piece)
    //console.log('New position: ' + Chessboard.objToFen(newPos))
    //console.log('Old position: ' + Chessboard.objToFen(oldPos))
    //console.log('Orientation: ' + orientation)
    
    var result = chess.move({ from:source, to:target, promotion:'q' })
    
    // Movimiento ilegal
    if ( result == null){
        return 'snapback';
    }    

    // Buscar movimiento repetido
    var fen = chess.fen();
    var found = false;
    for (var i = 0; i < aHistoryTree.length; i++){
        if (fen == aHistoryTree[i].fen){
            found = true;
            nNodoPadre = aHistoryTree[i].NodoPadre;
            nNodoHijo = aHistoryTree[i].NodoHijo;
            console.log(nNodoPadre);
            console.log(nNodoHijo);
            console.log(aHistoryTree[i].san);
            break;
        }
    }
    
    // Movimiento nuevo
    if (!found){    
        
        nNodoHijo = aHistoryTree.length;
        
        var oMove = {
            NodoPadre:nNodoPadre,
            NodoHijo:nNodoHijo,
            fen:chess.fen(),
            san:chess.history({verbose:true})[nDeepMove].san
        }

        aHistoryTree.push(oMove);

        nNodoPadre = nNodoHijo;
        
        console.log(oMove); 
    }

    nDeepMove++;
    
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd(){
    board1.position(chess.fen());
}

function btPREV(){
    // Prevenir inicio
    if (nDeepMove == 0){
        return;
    }

    // Buscar Nodo Padre e Hijo nuevos
    for (var i = 0; i < aHistoryTree.length; i++) {
        if (nNodoPadre == aHistoryTree[i].NodoHijo){
            nNodoPadre = aHistoryTree[i].NodoPadre;
            nNodoHijo = aHistoryTree[i].NodoHijo;
            console.log(nNodoPadre);
            console.log(nNodoHijo);
            nDeepMove--;
            if (nDeepMove == -1){
                nDeepMove = 0;
            }
            chess.undo();
            board1.position(chess.fen());
            break;
        }
    }
}