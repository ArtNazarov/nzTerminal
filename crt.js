Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

class ttyScreenChar{
	constructor(){
			this.tt = ' ';
			this.tx = 'green';
			this.bg = 'black';
	}
	asHtml(){
		return '<span style="background-color:'+this.bg+';font-color:'+this.tx+';">'+this.tt+'</span>';
	}
}

class nzTerminal {
    constructor(){      
		this.demo = false;
		this.timer = 0;
	    this.emptyChar = new ttyScreenChar();
        this.crt = "";
        this.crtId = "";
        this.cursorId = 0;
        this.signal = 0;
        this.carretX = 0;
        this.carretY = 0;
        this.sigType = '';        
        this.screen = [];
		this.hiddenPage = [];
        this.buffer = [];
        this.emptyScreen();
    }
    
    emptyScreen(){
        console.log('call of empty screen');
        this.screen = [];
		
        for (var i=0;i<25;i++){
            this.screen.push( [] );
			this.hiddenPage.push( [ ] );
            for (var j=0;j<80;j++){
                
				this.hiddenPage[i].push( this.emptyChar );
				this.screen[i].push( this.hiddenPage[i][j].asHtml() );
            };
        };
        //console.log(this.screen);
    }
    
    setChar(x,y,ch){
        if ((x < 80)&&(x>=0)&&(y<25)&&(y>=0))
        {
		this.hiddenPage[y][x].tt = ch;
		this.screen[y][x] = this.hiddenPage[y][x].asHtml();
        };
    }
    
    getCharRaw(x, y){
        var result = '';
        if ((x < 80)&&(x>=0)&&(y<25)&&(y>=0))
        {
        result =  this.hiddenPage[y][x].tt;
        };
        return result;
    }
	
	getChar(x, y){
        var result = '';
        if ((x < 80)&&(x>=0)&&(y<25)&&(y>=0))
        {
        result =  this.hiddenPage[y][x].asHtml();
        };
        return result;
    }
    
    eraseChar(x, y){
        var temp = this.hiddenPage[y][x];
		this.hiddenPage[y][x] = new ttyScreenChar();
		temp = null;
		this.hiddenPage[y][x].tx = this.emptyChar.tt;
		this.screen[y][x] = this.hiddenPage[y][x].asHtml();
    }
	
	setColor(x, y, background, text){
		
		var temp = this.hiddenPage[y][x];
		var Litera = new ttyScreenChar();
		this.hiddenPage[y][x] = Litera;
		temp = null;
		
		this.hiddenPage[y][x].tx = text;
		this.hiddenPage[y][x].bg = background;
		this.screen[y][x] = this.hiddenPage[y][x].asHtml();
	}
    
    pushB(ch){
        this.buffer.push(ch);
    }
    
    pushC(ch){ 
        //console.log('pushed '+ch);
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
            //console.log('set sendEnter!');
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
         //console.log('signal catched!');
        };
    }
    
    processSignals(ch){
       // console.log('process signals');
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
		console.log(this.crt);
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
	
	// event.type должен быть keypress
	getChar(event) {
  if (event.which == null) { // IE
    if (event.keyCode < 32) return null; // спец. символ
    return String.fromCharCode(event.keyCode)
  }

  if (event.which != 0 && event.charCode != 0) { // все кроме IE
    if (event.which < 32) return null; // спец. символ
    return String.fromCharCode(event.which); // остальные
  }

  return null; // спец. символ
}
    
    render(){           
    var q = this;
    return function(){
		q.timer+=150;
		if (this.demo){
		if (q.timer>10000) { clearInterval(window.term); }
		};
        var ch = q.readBuffer(); // read char from buffer
        //console.log('readed '+ch);
        q.analyseChar(ch);       
        q.processSignals(ch); // have we any signals in the buffer?
        q.onAddChar(ch);  // add char if it is not control                          
        q.buildCrt(); // get screen presentation
		
		
        document.getElementById(q.crtId).innerHTML = q.crt;    
    }
    }
	
	attachInput(){
		var q = this;
		document.body.addEventListener("keypress", function(event) {
				q.pushB(q.getChar(event));
		});
	}

}
