/// <reference path="../../types/types.ts"/>


interface IMonthlyMortgageAmounts {
  initial: number;
  followup: number;
}
x

class Mortgage implements app.IMortgageService {
  private transformData(data: app.IMortgageData): app.IMortgageData {
    return {
      fixedDuration: data.fixedDuration * 12,
      totalDuration: data.totalDuration * 12,
      initialRate: data.initialRate / 12.0 / 100.0,
      followupRate: data.followupRate / 12.0 / 100.0,
      downPayment: data.downPayment
    };
  }

  /**
   * Monthly rate for given repayment rate, principal and number of
   * repayment periods.
   */
  private calculateMonthlyRate(principal: number, rate: number, duration: number): number {
    var amount = principal
      * rate
      * Math.pow(rate + 1, duration)
      / (Math.pow(rate + 1, duration) - 1);

    return Math.round(amount);
  }

  /**
   * Calculate how much is left of the principal after paying the
   * monthly rate initialMonthlyAmount for fixedMonths months.
   */
  private calculatePrincipalLeft(
    principal: number, initialRate: number, initialMonthlyAmount: number, fixedMonths: number
  ) {
    var s = 0;
    for (var i = 0; i < fixedMonths; i++) {
      s += Math.pow(1 + initialRate, i);
    }
    return Math.round(principal * Math.pow(1 + initialRate, fixedMonths) - initialMonthlyAmount * s);
  }

  /**
   * How much are we paying for the first fixed months, how much after?
   */
  private getMonthlyAmounts(data: app.IMortgageData, housePrice: number): IMonthlyMortgageAmounts {
    var principal = housePrice - data.downPayment;

    var initialAmount = this.calculateMonthlyRate(
      principal, data.initialRate, data.totalDuration
    );
    var principalLeft = this.calculatePrincipalLeft(
      principal, data.initialRate, initialAmount, data.fixedDuration
    );
    var followupAmount = this.calculateMonthlyRate(
      principalLeft, data.followupRate, data.totalDuration - data.fixedDuration
    );

    return {initial: initialAmount, followup: followupAmount};
  }

  /**
   * How much will we pay for the mortgage rates over the expectedStayDuration?
   */
  private getDurationTotalSum(
    data: app.IMortgageData, monthlyAmounts: IMonthlyMortgageAmounts, expectedStayDuration: number
  ): number {
    // sum together the money to be paid for the years the user is staying.
    var sum = 0;
    for (var i = 0; i < expectedStayDuration; i++) {
      if (i < data.fixedDuration) {
        sum += monthlyAmounts.initial;
      } else {
        sum += monthlyAmounts.followup;
      }
    }
    return sum;
  }

  /*
   * Gets the amount from the mortgage we need to pay back after leaving
   */
  private getPrincipalToReturn(
    data: app.IMortgageData,
    monthlyAmounts: IMonthlyMortgageAmounts,
    housePrice: number,
    expectedStayDuration: number
  ): number {
    var principal = housePrice - data.downPayment;

    if (expectedStayDuration - data.fixedDuration <= 0) {
      return this.calculatePrincipalLeft(
        principal, data.initialRate, monthlyAmounts.initial, expectedStayDuration
      );
    }

    // If the expected_stay_duration is shorter than the fixed term
    // we can calculate the principal left from the fixed
    // rate. Otherwise we need to use the followup term.
    return this.calculatePrincipalLeft(
      this.calculatePrincipalLeft(principal, data.initialRate, monthlyAmounts.initial, data.fixedDuration),
      data.followupRate,
      monthlyAmounts.followup,
      expectedStayDuration - data.fixedDuration
    );
  }

  /*
   * Gets the amounts needed to calculate house costs
   */
  getAmounts(data, housePrice, expectedStayDuration) {
    data = this.transformData(data);
    var monthlyAmounts = this.getMonthlyAmounts(data, housePrice);
    // We want that in months
    expectedStayDuration = expectedStayDuration * 12;

    return {
      totalPaid: this.getDurationTotalSum(data, monthlyAmounts, expectedStayDuration),
      principalToReturn: this.getPrincipalToReturn(data, monthlyAmounts, housePrice, expectedStayDuration)
    };
  }
}


angular
  .module("home.mortgage", [])
  .service("Mortgage", Mortgage);
