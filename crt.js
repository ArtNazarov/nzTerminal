Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

class nzTerminal {
    constructor(){           
        this.crt = "";
        this.crtId = "";
        this.cursorId = 0;
        this.signal = 0;
        this.carretX = 0;
        this.carretY = 0;
        this.sigType = '';        
        this.screen = [];
        this.buffer = [];
        this.emptyScreen();
    }
    
    emptyScreen(){
        console.log('call of empty screen');
        this.screen = [];
        for (var i=0;i<25;i++){
            this.screen.push( [] );
            for (var j=0;j<80;j++){
                this.screen[i].push(' ');
            };
        };
        console.log(this.screen);
    }
    
    setChar(x,y,ch){
        if ((x < 80)&&(x>=0)&&(y<25)&&(y>=0))
        {
        this.screen[y][x] = ch;
        };
    }
    
    getChar(x, y){
        var result = '';
        if ((x < 80)&&(x>=0)&&(y<25)&&(y>=0))
        {
        result = this.screen[x][y];
        };
        return result;
    }
    
    eraseChar(x, y){
        this.screen[y][x] = '&nbsp;';
    }
    
    pushB(ch){
        this.buffer.push(ch);
    }
    
    pushC(ch){ 
        console.log('pushed '+ch);
        this.setChar(this.carretX, this.carretY, ch);
        this.carretX++;
        if (this.carretX > 80) {
            this.carretY++;
        }
    }
    
    sendMessage(message){
    
    for (var i=0; i<message.length;i++){
        this.pushB(message[i]);
    };
    
    this.pushB('#');   
    
    }
    
    cursor(){
        var cursors = ['░', '▓', '█'];
        this.cursorId = this.cursorId + 1;
        if (this.cursorId === cursors.length)
        {
            this.cursorId = 0;
        };
        return cursors[this.cursorId];
    }
    
    readBuffer(){                
        var result = ''; 
        if (this.buffer.length===0)
        {
            result = '';
        }
        else
        {
        var ch = this.buffer.shift(); 
        if (ch === '#')
        {        
            console.log('set sendEnter!');
            this.sigType = 'enter';
            this.signal = 1;
        }                       
        else { 
              result = ch;
        }
        };
        return result;
    }
      
    processEnter(ch){                
        this.carretY++;
        this.carretX = 0;
    }
    
    onBackspace(ch){
        if (ch === '-'){              
              // remove from last char in current line
              this.carretX = this.carretX - 1;                
              this.setChar(this.carretX, this.carretY, ' ');
            };          
    }
    
    onEnter(ch){
         if (this.sigType === 'enter'){
         this.processEnter();
         console.log('signal catched!');
        };
    }
    
    processSignals(ch){
        console.log('process signals');
        if (this.signal === 0) {return null;};
        if (this.sigType === '') {return null;};
        // just add section
        
        this.onBackspace(ch);
        this.onEnter(ch);                      
           
        this.signal = 0;
        this.sigType = '';
    }
    
    onAddChar(ch){       
        if (ch ==='') return 0; // ignore
        if (ch === '`') return 0;
        if (ch === '#')  return 0;
        if (ch === '-') return 0;        
        this.pushC(ch);                
    }
    
    buildCrt(){
        this.crt = '';
        var temp = this.getChar(this.carretX+1, this.carretY);
        this.setChar(this.carretX+1, this.carretY, this.cursor());
        for (var i=0;i<this.screen.length;i++){
            this.crt = this.crt + this.screen[i].join('') + "<br/>";
        };        
        this.setChar(this.carretX+1, this.carretY, temp);
    }
    
    analyseChar(ch){
         if ((ch === '#')||(ch==='-')){
            this.signal = 1;
            if (ch === '-'){
                this.sigType = 'backspace';
            };
            if (ch === '#'){
                this.sigType = 'enter';
            };
        };
        if (this.signal > 0){
            console.log('interruption...');
        }
    }
    
    render(){           
    var q = this;
    return function(){
        var ch = q.readBuffer(); // read char from buffer
        console.log('readed '+ch);
        q.analyseChar(ch);       
        q.processSignals(ch); // have we any signals in the buffer?
        q.onAddChar(ch);  // add char if it is not control                          
        q.buildCrt(); // get screen presentation
        document.getElementById(q.crtId).innerHTML = q.crt;    
    }
    }

}
