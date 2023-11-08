var aHistoryTree = [];
var nNodoPadre = 0;
var nNodoHijo = 1;
var nDeepMove = 0;
var LastMove;
var LastMove2;
var PrimeraVez = true;
var aControlSepa = [];
var DentroVariante = false;
//var nBufferNodoHijo = -2;
var BufferNodoPadre;
var BufferNodoHijo;
var LastEvent;
var BufferClick;
var IdGame = '';
var White = '';
var WElo = '';
var Black = '';
var BElo = '';
var Evento = '';
var Fecha = '';
var Result = '';

function onDrop (source, target, piece, newPos, oldPos, orientation) {
    
    //console.log('Source: ' + source)
    //console.log('Target: ' + target)
    //console.log('Piece: ' + piece)
    //console.log('New position: ' + Chessboard.objToFen(newPos))
    //console.log('Old position: ' + Chessboard.objToFen(oldPos))
    //console.log('Orientation: ' + orientation)
    
    try {
        chess.move({ from:source, to:target, promotion:'q' });
    }catch (err) {
        return 'snapback';
    }
    
    BufferNodoPadre = nNodoPadre;
    BufferNodoHijo = nNodoHijo;
       
    var fen = chess.fen();
    var found = false;
    
    for (var i = 0; i < aHistoryTree.length; i++){
        // Movimiento repetido
        if (fen == aHistoryTree[i].fen){
            found = true;            
            LastEvent = 'RepeMove';
            //alert('RepeMove')
            nNodoPadre = aHistoryTree[i].NodoPadre;
            nNodoHijo = aHistoryTree[i].NodoHijo;           
            for (var i = 0; i < aControlSepa.length; i++){
                if (nNodoHijo == aControlSepa[i].NodoHijo){
                    /*if (aControlSepa[i].DentroVariante){
                        alert(ContHermanos())
                        if (ContHermanos()==2){
                            LastMove = 'move'+nNodoHijo; 
                        }else{
                            LastMove = aControlSepa[i].Sepa;
                        }                                                      
                        LastMove2 = LastMove;                            
                    }else{                         
                        alert(ContHermanos())
                        if (ContHermanos()==2){                            
                            LastMove = 'move'+nNodoHijo; 
                        }else{                            
                            LastMove = aControlSepa[i].Sepa;
                        }                        
                        LastMove2 = LastMove;                            
                    }*/
                    LastMove = aControlSepa[i].Sepa;
                    LastMove2 = LastMove;                                                                                                        
                }     
            }            

            nNodoPadre = nNodoHijo;                
            
            break;
        }
    }    
    
    // Movimiento nuevo
    if (!found){        
        
        BufferNodoHijo = nNodoHijo;
        
        nNodoHijo = aHistoryTree.length;        
        
        var oMove = {
            NodoPadre:nNodoPadre,
            NodoHijo:nNodoHijo,
            fen:chess.fen(),
            san:chess.history({verbose:true})[nDeepMove].san,
            source:source,
            target:target,
            DeepMove:nDeepMove
        }

        aHistoryTree.push(oMove);        
        
        console.log(oMove); 

        //LastEvent = 'Reset';

        DrawMove(chess.history({verbose:true})[nDeepMove].san);

        nNodoPadre = nNodoHijo;

        //LastEvent = 'NewMove';
    }    
    
    nDeepMove++;
    
    SeekFEN(chess.fen());  
    
    //$('#move'+nNodoHijo).css('background','#f5a742');
    $('#'+BufferClick).css('background','#e8e8e8');
    $('#move'+nNodoPadre).css('background','#f5a742');
    BufferClick = 'move'+nNodoPadre;
    
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd(){
    board1.position(chess.fen());
}

function DrawMove(SANMove){

    var fen = chess.fen();
    var nJugada = Jugada(fen);
    var cTurno = Turno(fen);     

    if (HayHermano()){        
        for (var i = 0; i < aControlSepa.length; i++){            
            if (PrimerHermano() == aControlSepa[i].NodoHijo){            
                if (ContHermanos()==2){                    
                    LastMove = aControlSepa[i].Sepa;                                      
                }else{
                    LastMove = aControlSepa[i].Sepa;                    
                }                                                                                                           
            } 
        }

        $('<label id="sepafront' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold"> (</label>').insertAfter('#' + LastMove);
        if (cTurno=='w'){        
            $('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                nJugada + '.' + SANMove + '</label>').insertAfter('#sepafront' + nNodoHijo);
        }else{
            $('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                (nJugada-1) + '...' + SANMove + '</label>').insertAfter('#sepafront' + nNodoHijo);
        }
        $('<label id="sepa' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">)</label>').insertAfter('#move' + nNodoHijo);        
                
        // Actualizar primer hermano        
        aControlSepa.push({NodoHijo:PrimerHermano(),Sepa:'sepa'+nNodoHijo,DentroVariante:true});
        aControlSepa.push({NodoHijo:nNodoHijo,Sepa:'move'+nNodoHijo,DentroVariante:true});
        
        DentroVariante = true;
        LastEvent = 'Reset';
        
    }else{  
        //Movimiento normal
        if (PrimeraVez){
            PrimeraVez = false;
            $('#DivMoves').append('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                nJugada + '.' + SANMove + '</label>');            
        }else{                                    
            if (LastEvent == 'btPREV'){
                for (var i = 0; i < aControlSepa.length; i++){
                    if (BufferNodoHijo == aControlSepa[i].NodoHijo){
                        LastMove = aControlSepa[i].Sepa;                                                                                                                                                 
                    } 
                }
                LastEvent = 'Reset';
            }else if (LastEvent == 'btEND'){                
                if (cTurno=='w'){        
                    $('#DivMoves').append('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                        ' ' + nJugada + '.' + SANMove + '</label>');
                }else{
                    $('#DivMoves').append('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                        ' ' + SANMove + '</label>');
                }                                             
            }else if (LastEvent == 'RepeMove'){                
                LastMove = LastMove2;                
                LastEvent = 'Reset';
            }else{ 
                //Movimiento general
                if (DentroVariante == false){                     
                    for (var i = 0; i < aControlSepa.length; i++){
                        if (BufferNodoHijo == aControlSepa[i].NodoHijo){
                            LastMove = aControlSepa[i].Sepa; 
                            //alert('Test3:'+LastMove)                                                                                                                                                                                  
                        } 
                    }
                }else{                    
                    LastMove = 'move' + nNodoPadre;
                    //alert('Test4:'+LastMove)                    
                    DentroVariante = false;
                }            
            }
            
            if (LastEvent != 'btEND'){                
                if (cTurno=='w'){        
                    $('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                        ' ' + nJugada + '.' + SANMove + '</label>').insertAfter('#' + LastMove);
                }else{
                    $('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                        ' ' + SANMove + '</label>').insertAfter('#' + LastMove);
                }
                LastEvent = 'Reset';
            }
            
        }

        aControlSepa.push({NodoHijo:nNodoHijo,Sepa:'move'+nNodoHijo,DentroVariante:false});
        
        //var cPGN = $("#DivMoves").text();
        //alert(cPGN)
    } 
        
    $('#DivMoves').animate({scrollTop: $('#DivMoves').prop('scrollHeight')}, 500); 
    
    $('#DivMoves').on('click','#move'+nNodoHijo, function() { 
        //alert($(this).attr('id'))       
        ClickOnVariant($(this).attr('id'));
    });

    $('#move'+nNodoHijo).hover(function(){
        $(this).css('background','#f5a742');
    },
    function(){
        if ($(this).attr('id')!=BufferClick){
            $(this).css('background','#e8e8e8');
        }
    });
}

function btPREV(){

    LastEvent = 'btPREV';

    // Prevenir inicio
    if (nDeepMove == 0){
        return;
    }

    BufferNodoHijo = nNodoPadre;
        
    // Buscar Nodo Padre e Hijo nuevos
    for (var i = 0; i < aHistoryTree.length; i++){
        if (nNodoPadre == aHistoryTree[i].NodoHijo){
            nNodoPadre = aHistoryTree[i].NodoPadre;
            nNodoHijo = aHistoryTree[i].NodoHijo;
            BufferNodoHijo = nNodoHijo;            
            if (nNodoPadre == -1){
                nNodoPadre = 0;
                nNodoHijo = 1; 
                BufferNodoHijo = nNodoHijo;               
            }             

            DentroVariante = false;

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
    $('#'+BufferClick).css('background','#e8e8e8');
    $('#move'+nNodoPadre).css('background','#f5a742');
    BufferClick = 'move'+nNodoPadre;
}

function btNEXT(){

    DentroVariante = false;
    BufferNodoHijo = nNodoHijo;

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
            nDeepMove++;
            chess.move({from:aHistoryTree[i].source,to:aHistoryTree[i].target,promotion:'q'});
            board1.position(chess.fen());
            SeekFEN(chess.fen());            
            break;
        }
    }
    $('#'+BufferClick).css('background','#e8e8e8');
    $('#move'+nNodoPadre).css('background','#f5a742');
    BufferClick = 'move'+nNodoPadre;
}

function btEND(){

    LastEvent = 'btEND';
    
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
            DentroVariante = false; 
            BufferNodoHijo = nNodoHijo; 
            SeekFEN(chess.fen());
            $('#'+BufferClick).css('background','#e8e8e8'); 
            $('#move'+nNodoPadre).css('background','#f5a742');
            BufferClick = 'move'+nNodoPadre;                    
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
                        BufferNodoHijo = nNodoHijo;
                        break;
                    }
                }                            
                nDeepMove++;
                chess.move({from:aHistoryTree[i].source,to:aHistoryTree[i].target,promotion:'q'});
                board1.position(chess.fen());
                //SeekFEN(chess.fen());                
                break;
            }
        }

    } // End while    
        
}

function IniGrid1(){

    $("#Grid1").jqGrid({
        datatype:'local',
        colModel:[
            { label: 'Moves', name: 'Moves', width: 100},            
            { label: 'Games', name: 'Games', width: 130},
            { label: 'Stats', name: 'Stats', width: 150}
        ],
        height:472,
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
            { label: 'IdGame', name: 'IdGame', width: 60},
            { label: 'White', name: 'White',  width: 180},            
            { label: 'WElo', name: 'WElo', width: 34},
            { label: 'Black', name: 'Black',  width: 180},            
            { label: 'BElo', name: 'BElo', width: 34},
            { label: 'Event', name: 'Event', width: 200},
            { label: 'Date', name: 'Date', width: 74},
            { label: 'Result', name: 'Result', width: 50}
        ],
        height:132,
        onSelectRow:function(id){
            IdGame = $(this).jqGrid('getCell',id,'IdGame');
            White = $(this).jqGrid('getCell',id,'White');
            WElo = $(this).jqGrid('getCell',id,'WElo');
            Black = $(this).jqGrid('getCell',id,'Black');
            BElo = $(this).jqGrid('getCell',id,'BElo');
            Evento = $(this).jqGrid('getCell',id,'Event');
            Fecha = $(this).jqGrid('getCell',id,'Date');
            Result = $(this).jqGrid('getCell',id,'Result');

            socket.emit('LoadPGNGame',IdGame);
        }
    });    
      
}

function FillGrid1(msg){

    jQuery("#Grid1").jqGrid("clearGridData");
    for (var i = 0; i < msg.length; i++){
        jQuery("#Grid1").jqGrid('addRowData',i+1,{Moves:msg[i].SAN,Games:msg[i].Games,Stats:'test'});
    }

}

function FillGrid2(msg){

    jQuery("#Grid2").jqGrid("clearGridData");
    for (var i = 0; i < msg.length; i++){
        jQuery("#Grid2").jqGrid('addRowData',i+1,{IdGame:msg[i].IdGame,White:msg[i].White,WElo:msg[i].WhiteElo,Black:msg[i].Black,BElo:msg[i].BlackElo,Event:msg[i].Event,Date:msg[i].Date,Result:msg[i].Result});
    }
    
    if (msg.length == 0){
        jQuery("#Grid2").jqGrid('addRowData',1,{IdGame:IdGame,White:White,WElo:WElo,Black:Black,BElo:BElo,Event:Evento,Date:Fecha,Result:Result});
    }

}

function SeekFEN(FEN){
    nIndexGames = 0;
    socket.emit('SeekFEN',FEN);
}

function ClickOnSANMove(SANMove){
    
    try {
        chess.move(SANMove);
    }catch (err) {
        return 'snapback';
    }
    
    BufferNodoPadre = nNodoPadre;
    BufferNodoHijo = nNodoHijo;
       
    var fen = chess.fen();
    var found = false;
    
    for (var i = 0; i < aHistoryTree.length; i++){
        // Movimiento repetido
        if (fen == aHistoryTree[i].fen){
            found = true;            
            LastEvent = 'RepeMove';
            nNodoPadre = aHistoryTree[i].NodoPadre;
            nNodoHijo = aHistoryTree[i].NodoHijo;           
            for (var i = 0; i < aControlSepa.length; i++){
                if (nNodoHijo == aControlSepa[i].NodoHijo){
                    if (aControlSepa[i].DentroVariante){
                        if (ContHermanos()==2){
                            LastMove = 'move'+nNodoHijo; 
                        }else{
                            LastMove = aControlSepa[i].Sepa;
                        }                                                      
                        LastMove2 = LastMove;                            
                    }else{                         
                        if (ContHermanos()==2){                            
                            LastMove = 'move'+nNodoHijo; 
                        }else{                            
                            LastMove = aControlSepa[i].Sepa;
                        }                        
                        LastMove2 = LastMove;                            
                    }                                                                                                        
                }     
            }            

            nNodoPadre = nNodoHijo;                
            
            break;
        }
    }    
    
    // Movimiento nuevo
    if (!found){        
        
        BufferNodoHijo = nNodoHijo;
        
        nNodoHijo = aHistoryTree.length;        
        
        var oMove = {
            NodoPadre:nNodoPadre,
            NodoHijo:nNodoHijo,
            fen:chess.fen(),
            san:chess.history({verbose:true})[nDeepMove].san,
            source:chess.history({verbose:true})[nDeepMove].from,
            target:chess.history({verbose:true})[nDeepMove].to,
            DeepMove:nDeepMove
        }

        aHistoryTree.push(oMove);        
        
        console.log(oMove); 

        DrawMove(chess.history({verbose:true})[nDeepMove].san);

        nNodoPadre = nNodoHijo;
        
    }    
    
    nDeepMove++;
    
    SeekFEN(chess.fen());

    board1.position(chess.fen());

    $('#'+BufferClick).css('background','#e8e8e8');
    $('#move'+nNodoPadre).css('background','#f5a742');
    BufferClick = 'move'+nNodoPadre;
}

function ClickOnVariant(move){
        
    var aBuffer = [];    
    var MoveId = move.substring(4);

    nNodoPadre = MoveId;
    
    chess.reset();    

    // Ruta de la variante ascendente
    for (var i = aHistoryTree.length-1; i >= 0 ; i--){
        if (nNodoPadre == aHistoryTree[i].NodoHijo){
            nNodoPadre = aHistoryTree[i].NodoPadre;
            nNodoHijo = aHistoryTree[i].NodoHijo;
            var fen = aHistoryTree[i].fen;
            var san = aHistoryTree[i].san;
            var source = aHistoryTree[i].source;
            var target = aHistoryTree[i].target;
            var Deep = aHistoryTree[i].DeepMove; 
            aBuffer.push({NodoPadre:nNodoPadre,NodoHijo:nNodoHijo,fen:fen,san:san,source:source,target:target,DeepMove:Deep});
        }
    }

    // Cargar posiciones de la variante
    for (var i = aBuffer.length; i > 0 ; i--){
        nNodoPadre = aBuffer[i-1].NodoPadre;
        nNodoHijo = aBuffer[i-1].NodoHijo;        
        nDeepMove = aBuffer[i-1].DeepMove;
        if (nNodoPadre!=-1){
            chess.move({from:aBuffer[i-1].source,to:aBuffer[i-1].target,promotion:'q'});
            board1.position(chess.fen());                    
        }         
    }
    
    SeekFEN(chess.fen());

    nNodoHijo = MoveId;
    BufferNodoHijo = nNodoHijo;
    nNodoPadre = MoveId;

    for (var i = 0; i < aHistoryTree.length; i++){
        if (MoveId == aHistoryTree[i].NodoHijo){
            nDeepMove = aHistoryTree[i].DeepMove;            
        }
    }
    nDeepMove++;

    $('#'+BufferClick).css('background','#e8e8e8'); 
    $('#move'+nNodoPadre).css('background','#f5a742');
    BufferClick = 'move'+nNodoPadre;

}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function LoadPGNGame(Game){    
    
    //$(document.body).css({'cursor':'wait'});
    $('body').css('cursor','progress');

    await delay(500);
    
    chess.reset();  
    $('#DivMoves').html('');
    PrimeraVez = true;
    aControlSepa = [];    
    
    var aGame = Game.split('\n'); 
    
    chess.loadPgn(aGame.join('\n'));

    // Posicion inicial con reset
    aHistoryTree = [];
    var oMove = {
        NodoPadre:-1,
        NodoHijo:0,
        fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        san:'',
        source:'',
        target:'',
        DeepMove:0
    }
    aHistoryTree.push(oMove);    

    for (var i = 0; i < chess.history().length; i++){
        nNodoPadre = i;
        nNodoHijo = i+1;
        nDeepMove = i;
        oMove = {
            NodoPadre:nNodoPadre,
            NodoHijo:nNodoHijo,
            fen:chess.history({verbose:true})[nDeepMove].after,
            san:chess.history({verbose:true})[nDeepMove].san,
            source:chess.history({verbose:true})[nDeepMove].from,
            target:chess.history({verbose:true})[nDeepMove].to,
            DeepMove:nDeepMove
        };
        aHistoryTree.push(oMove);
        
        var fen = chess.history({verbose:true})[nDeepMove].after;
        var nJugada = Jugada(fen);
        var cTurno = Turno(fen);

        if (PrimeraVez){
            PrimeraVez = false;
            $('#DivMoves').append('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                nJugada + '.' + chess.history({verbose:true})[nDeepMove].san + '</label>');
        }else{
            LastMove = 'move' + nNodoPadre;
            if (cTurno=='w'){        
                $('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                    ' ' + nJugada + '.' + chess.history({verbose:true})[nDeepMove].san + '</label>').insertAfter('#' + LastMove);
            }else{
                $('<label id="move' + nNodoHijo + '" style="font-size:22px; font-family:Arial,serif; font-weight:bold">'+ 
                                    ' ' + chess.history({verbose:true})[nDeepMove].san + '</label>').insertAfter('#' + LastMove);
            }
        }
        aControlSepa.push({NodoHijo:nNodoHijo,Sepa:'move'+nNodoHijo,DentroVariante:false});

        //$("#DivMoves").html().load(document.URL+"#DivMoves"); //Try to refresh

        $('#DivMoves').on('click','#move'+nNodoHijo, function() {        
            ClickOnVariant($(this).attr('id'));
        });
    
        $('#move'+nNodoHijo).hover(function(){
            $(this).css('background','#f5a742');
        },
        function(){
            if ($(this).attr('id')!=BufferClick){
                $(this).css('background','#e8e8e8');
            }            
        });
        
    } // End for    

    $('#btEND').trigger('click');
    $('#btINI').trigger('click');

    //$(document.body).css({'cursor':'default'});
    await delay(500);
    $('body').css('cursor','default');
}

function btNEXTGames(){
    nIndexGames = nIndexGames + 10;
    socket.emit('LoadGames',{Nodo:nNodo,nIndexGames:nIndexGames});
}

function btPREVGames(){
    nIndexGames = nIndexGames - 10;
    if (nIndexGames < 0){
        nIndexGames = 0;
    }
    socket.emit('LoadGames',{Nodo:nNodo,nIndexGames:nIndexGames});
}

function btINIGames(){
    nIndexGames = 0;
    socket.emit('LoadGames',{Nodo:nNodo,nIndexGames:nIndexGames});
}

function btENDGames(){
    socket.emit('LoadLastGames',{Nodo:nNodo});
}

function Jugada(FEN){
    var aBuffer = FEN.split(' ');
    return aBuffer[5];
}

function Turno(FEN){
    var aBuffer = FEN.split(' ');
    if (aBuffer[1]=='w'){
        return 'b';
    }else{
        return 'w';
    }    
}

function HayHermano(){
    var nCont = 0;
    for (var i = 0; i < aHistoryTree.length; i++){
        if (nNodoPadre == aHistoryTree[i].NodoPadre){
            nCont++;
        }        
    }
    if (nCont>1){
        return true;
    }else{
        return false;
    }
}

function ContHermanos(){
    var nCont = 0;
    for (var i = 0; i < aHistoryTree.length; i++){
        if (nNodoPadre == aHistoryTree[i].NodoPadre){
            nCont++;
        }        
    }
    return nCont;    
}

function PrimerHermano(){
    for (var i = 0; i < aHistoryTree.length; i++){
        if (nNodoPadre == aHistoryTree[i].NodoPadre){
            return aHistoryTree[i].NodoHijo;
        }        
    }
}