/// <reference path="../typings/tsd.d.ts" />
require("should");

/*
 This is the BDD interface of mocha.
 We use 'should.js' for assertions.
  */
describe("dummy module", function () {

  describe("sub", function() {
    it("should do addition", function () {
      (2 + 5).should.equal(7);
    });
  });

  it("has multiplication", function() {
    (2 * 22).should.equal(44);
  });

  it("can do something", function (done) {
    setTimeout(
      () => {
        (2 - 10).should.be.below(0);
        done();
      },
      10
    );
  });
});
