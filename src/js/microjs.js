/**
 * @file microjs is micro-library.
 * Scaffolded with generator-microjs
 * @author Nathan <>
 */

function microjs() {
  // TODO: implement your micro framework or library.
  
  this.hello = 'hello';
  this.world = 'world';
}

microjs.prototype.toString = function toString() {
    return this.hello + ', ' + this.world + '!';
};
