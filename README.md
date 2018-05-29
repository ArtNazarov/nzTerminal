# nzTerminal
CRT layout demo
```
var t = new nzTerminal();
t.crtId = 'nzTerminal';
t.sendMessage('// system power off---on--off');
t.sendMessage('05-4-3-2-1-0');
window.term = setInterval( t.render(), 150);
t.attachInput();
```

The '-' char emulates backspace key.
The '#' char emulates enter key.
Chars sends to the buffer.
Some of chars will be processed as a signals.
Virtual screen is document which contains 25 rows and 80 columns, each element is 
char.

What's new
==========

Added user input

