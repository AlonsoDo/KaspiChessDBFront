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
    
    // Hacer movimiento
    var result = chess.move({ from:source, to:target, promotion:'q' });
    
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


            //Test!!!!
            nNodoPadre = nNodoHijo;


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
            san:chess.history({verbose:true})[nDeepMove].san,
            source:source,
            target:target
        }

        aHistoryTree.push(oMove);

        nNodoPadre = nNodoHijo;
        
        console.log(oMove); 
    }

    nDeepMove++;

    SeekFEN(chess.fen());    
    
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
    for (var i = 0; i < aHistoryTree.length; i++){
        if (nNodoPadre == aHistoryTree[i].NodoHijo){
            nNodoPadre = aHistoryTree[i].NodoPadre;
            nNodoHijo = aHistoryTree[i].NodoHijo;
            if (nNodoPadre== -1){
                nNodoPadre = 0;
                nNodoHijo = 1;                
            }
            console.log(nNodoPadre);
            console.log(nNodoHijo);
            console.log(aHistoryTree[i].san);
            nDeepMove--;
            if (nDeepMove == -1){
                nDeepMove = 0;
            }
            chess.undo();
            board1.position(chess.fen());
            SeekFEN(chess.fen());
            break;
        }
    }
}

function btNEXT(){
    for (var i = 0; i < aHistoryTree.length; i++){
        // Nuevo padre
        if (nNodoPadre == aHistoryTree[i].NodoPadre){
            nNodoPadre = aHistoryTree[i].NodoHijo;
            // Nuevo hijo
            for (var j = 0; j < aHistoryTree.length; j++){
                if (nNodoPadre == aHistoryTree[j].NodoPadre){
                    nNodoHijo = aHistoryTree[j].NodoHijo;
                    break;
                }
            }
            console.log(nNodoPadre);
            console.log(nNodoHijo);                        
            nDeepMove++;
            chess.move({from:aHistoryTree[i].source,to:aHistoryTree[i].target,promotion:'q'});
            board1.position(chess.fen());
            SeekFEN(chess.fen());
            console.log(aHistoryTree[i].san);
            break;
        }
    }
}

function btEND(){
    
    // Cojer la variante principal
    board1.position(aHistoryTree[0].fen);
    nNodoPadre = 0;
    chess.reset();
    nDeepMove = 0;
    
    while (true){
        
        // Ningun movimiento todavia
        if (aHistoryTree.length == 1){
            return;
        // No hay mas hijos
        }else if (nNodoPadre == nNodoHijo){
            return;
        }
        
        for (var i = 0; i < aHistoryTree.length; i++){
            // Nuevo padre
            if (nNodoPadre == aHistoryTree[i].NodoPadre){
                nNodoPadre = aHistoryTree[i].NodoHijo;
                // Nuevo hijo
                for (var j = 0; j < aHistoryTree.length; j++){
                    if (nNodoPadre == aHistoryTree[j].NodoPadre){
                        nNodoHijo = aHistoryTree[j].NodoHijo;
                        break;
                    }
                }
                console.log(nNodoPadre);
                console.log(nNodoHijo);            
                nDeepMove++;
                chess.move({from:aHistoryTree[i].source,to:aHistoryTree[i].target,promotion:'q'});
                board1.position(chess.fen());
                SeekFEN(chess.fen());
                console.log(aHistoryTree[i].san);
                break;
            }
        }

    }// End while
}

function IniGrid1(){

    $("#Grid1").jqGrid({
        datatype:'local',
        colModel:[
            { label: 'Moves', name: 'Moves', key: true, index: 'Moves', width: 100},            
            { label: 'Games', name: 'Games', width: 130},
            { label: 'Stats', name: 'Stats', width: 150}
        ],
        height:422,
        onSelectRow:function(id){
            // get data from the column 'Moves'
            var SANMove = $(this).jqGrid('getCell',id,'Moves');
            ClickOnSANMove(SANMove);
        }
    });
      
}

function IniGrid2(){

    $("#Grid2").jqGrid({
        datatype:'local',
        colModel:[
            { label: 'IdGame', name: 'IdGame', width: 50},
            { label: 'White', name: 'White',  width: 180},            
            { label: 'WElo', name: 'WElo', width: 30},
            { label: 'Black', name: 'Black',  width: 180},            
            { label: 'BElo', name: 'BElo', width: 30},
            { label: 'Event', name: 'Event', width: 200},
            { label: 'Date', name: 'Date', width: 70},
            { label: 'Result', name: 'Result', width: 50}
        ],
        height:132,
        onSelectRow:function(id){
            alert('Test');
        }
    });    
      
}

function FillGrid1(msg){

    jQuery("#Grid1").jqGrid("clearGridData");
    for (var i = 0; i < msg.length; i++){
        jQuery("#Grid1").jqGrid('addRowData',i+1,{Moves:msg[i].SAN,Games:'1000',Stats:'test'});
    }

}

function FillGrid2(msg){

    jQuery("#Grid2").jqGrid("clearGridData");
    for (var i = 0; i < msg.length; i++){
        jQuery("#Grid2").jqGrid('addRowData',i+1,{IdGame:msg[i].IdGame,White:msg[i].White,WElo:msg[i].WhiteElo,Black:msg[i].Black,BElo:msg[i].BlackElo,Event:msg[i].Event,Date:msg[i].Date,Result:msg[i].Result});
    }

}

function SeekFEN(FEN){
    socket.emit('SeekFEN',FEN);
}

function ClickOnSANMove(SANMove){
    // Hacer movimiento
    var result = chess.move(SANMove);
    
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


            //Test!!!!
            nNodoPadre = nNodoHijo;


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
            san:chess.history({verbose:true})[nDeepMove].san,
            source:chess.history({verbose:true})[nDeepMove].from,
            target:chess.history({verbose:true})[nDeepMove].to
        }

        aHistoryTree.push(oMove);

        nNodoPadre = nNodoHijo;
        
        console.log(oMove); 
    }

    nDeepMove++;

    SeekFEN(chess.fen());

    board1.position(chess.fen());
}