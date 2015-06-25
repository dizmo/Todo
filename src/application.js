//= require Main
//= require Storage

/*
Generally you do not need to edit this file. You can start writing
your code in the provided "Main" class.
*/

// Helper object to attach all the events to
var events = {};

// As soon as the dom is loaded, and the dizmo is ready, instantiate the main class
window.document.addEventListener('dizmoready', function() {
    new Todo.Main();
});
