// http://esprima.org/doc/index.html
function BooleanFlag(element, event) {
  // Literal used with a non-setter function (assumption: setter starts with the "set" prefix):
  this.refresh(true);

  // Literal used with a function whose name may have a double-negative interpretation:
  this.setHidden(false);

  // Two different literals in a single function call:
  element.stop(true, false);

  // Multiple literals in a single function invocation:
  event.initKeyEvent("keypress", true, true, null, null,
    false, false, false, false, 9, 0);

  // Ambiguous Boolean literal as the last argument:
  return BooleanFlag(obj, false);
}


function TooManyArguments(a1, a2, a3, a4) {}
TooManyArguments.prototype.refresh = function (sometimes, maybe, always, wednesdays) {};


function duplicateFoot () {
  var appendages = 5;
  var bones = 200;
  this.parse(appendages, bones);
}

var duplicateHand = function () {
  var appendages = 6;
  var bones = 100;
  this.parse(appendages, bones);
}

if (false === true) {
    console.log("The sky is falling!");
}
