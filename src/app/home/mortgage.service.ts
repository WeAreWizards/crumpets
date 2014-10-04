/// <reference path="../../types/types.ts"/>


interface IMonthlyMortgageAmounts {
  initial: number;
  followup: number;
}


class Mortgage implements app.IMortgageService {
  private transformData(data: app.IMortgageData): app.IMortgageData {
    // Transform the human-readable data to sth thats usable in a
    // computer calculation.
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
    // sum together the money to be paid for the years the user is
    // staying.
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

    // Our unit of calculation in all other function is months, so we
    // need to adjust expectedStayDuration accordingly. It's kinda bad
    // to do this here because it's going to be really hard to catch
    // errors. Unfortunately there don't seem to be unit-like types in
    // typescript? TODO(tom): check for types for numbers other than
    // 'number'.
    expectedStayDuration = expectedStayDuration * 12;

    return {
      totalPaid: this.getDurationTotalSum(data, monthlyAmounts, expectedStayDuration),
      principalToReturn: this.getPrincipalToReturn(data, monthlyAmounts, housePrice, expectedStayDuration)
    };
  }

  /**
   * Calculating the opportunity costs for the mortgage
   *
   * This is a slightly complex function as the opportunity cost is a
   * sinking fund that starts out with the initial costs (down payment
   * + solicitor + stamp duty etc.), then accrues a hypothetical
   * monthly payment from the customer *and* the interested paid
   * according to the ROI.
   */
  getOpportunityCosts(
    data: app.IMortgageData, housePrice: number,
    expectedStayDuration: number, initialCosts: number, roi: number): number {

    data = this.transformData(data);
    // see comment in getAmounts about calculating expectedStayDuration in moths.
    expectedStayDuration = expectedStayDuration * 12;
    roi = roi / 100;

    var monthlyAmounts = this.getMonthlyAmounts(data, housePrice);
    var sinkingFund = initialCosts;
    var plainFund = initialCosts;

    for (var i = 0; i < expectedStayDuration; i++) {
      if (i < data.fixedDuration) {
        sinkingFund = monthlyAmounts.initial + sinkingFund * (1 + roi / 12);
        plainFund += monthlyAmounts.initial;
      } else {
        sinkingFund = monthlyAmounts.followup + sinkingFund * (1 + roi / 12);
        plainFund += monthlyAmounts.followup;
      }
    }

    return sinkingFund - plainFund;
  }
}


angular
  .module("home.mortgage", [])
  .service("Mortgage", Mortgage);
