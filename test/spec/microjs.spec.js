/**
 * @file
 *
 * ### Responsibilities
 * - unit test microjs.js
 *
 * Scaffolded with generator-microjs v0.1.2
 *
 * @author Nathan <>
 */
'use strict';

/*global microjs*/
describe('microjs.js', function () {
  var sandbox;

  beforeEach(function () {
    // create a sandbox
    sandbox = sinon.sandbox.create();

    // stub some methods
  });

  afterEach(function () {
    // restore the environment as it was before
    sandbox.restore();
  });

  it('should have a working test harness', function () {
    // arrange
    // act
    // assert
    expect(true).to.not.equal(false);
  });

  it('should exist', function () {
    // arrange
    // act
    // assert
    expect(typeof microjs).to.equal('function');
  });

  it('should return nothing', function () {
    // arrange
    // act
    var result = microjs();
    // assert
    expect(result).to.equal(undefined);
  });

});