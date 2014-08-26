/// <reference path="../../../types/types.ts"/>

class Mortgage implements app.IMortgageFactory {
  principal;
  fixedYears;
  initialRate;
  followupRate;
  totalDurationMonths;

  // Needed to appease ng-strict-di
  static $inject = [];

  create(principal, fixedYears, initialRate, followupRate, totalDurationMonths) {
    this.principal = principal;
    this.fixedYears = fixedYears;
    this.initialRate = initialRate;
    this.followupRate = followupRate;
    this.totalDurationMonths = totalDurationMonths;

    return this;
  }

  principalLeft(initialMonthlyRate) {
    var s: number = 0;
    for (var i = 0; i < this.fixedYears; i++) {
      s += Math.pow(1 + this.initialRate, i);
    }
    return this.principal * Math.pow(1 + this.initialRate, this.fixedYears) - initialMonthlyRate * s;
  }

  calculateMonthlyRate(principal, rate, duration) {
    return principal
      * rate
      * Math.pow(rate + 1, duration)
      / (Math.pow(rate + 1, duration) - 1);
  }

  calculateProgression() {
    var initialMonthlyRate = this.calculateMonthlyRate(
      this.principal, this.initialRate, this.totalDurationMonths
    );
    var principalLeft = this.principalLeft(initialMonthlyRate);
    var followUpMonthlyRate = this.calculateMonthlyRate(
      principalLeft, this.followupRate, this.totalDurationMonths - this.fixedYears * 12
    );
    return [Math.round(initialMonthlyRate), Math.round(followUpMonthlyRate)];
  }
}

angular
  .module("home.mortgage", [])
  .service("Mortgage", Mortgage);
