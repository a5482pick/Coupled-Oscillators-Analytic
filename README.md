The motion for two oscillators coupled by three springs is modelled.  The CSS is written to create a direct reduction in size of the webpage components as the window size is reduced.  (This is in contrast to repository 'Oscillators-CSS-Resizing', where a reduction in browser size may create both resizing and restructuring of the page's items and components.)  The canvas animation continues to play when the window is resized.  To begin, run Oscillator.html from a directory that contains all 8 files.

EDIT 3rd July 2017: 

A major code refactoring, to remove global scope declarations. &nbsp; Each _.js_ file is now a self-contained unit using only local variables and passed parameters.

Additionally, animation was apparently no longer smooth in Chrome. &nbsp; Reducing 'ratioHeight' to 0.075 appears to have rectified this problem. &nbsp; (This problem could also be rectified by reducing the browser's window size.)
