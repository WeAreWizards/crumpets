/// <reference path="../../types/types.ts"/>


class Rent implements app.IRentService {
  /**
   * How much would we be paying if we continued paying our normal rent for expectedStayDuration?
   */
  private getDurationTotalSum(
    currentRent: number, rentGrowthRate: number, expectedStayDuration: number
  ) {
    var sum = 0;
    for (var i = 0; i < expectedStayDuration; i++) {
      sum += currentRent * 12 * Math.pow(1 + rentGrowthRate / 100.0, i);
    }
    return Math.round(sum);
  }

  /**
   * Given a total sum how much rent would that be per month (includes
   * expected rent increases).
   */
  private getRentPerMonthFromTotal(
    total: number, rentGrowthRate: number, expectedStayDuration: number, roi: number
  ) {
    // We know how much the total costs will be for a house and we
    // need to solve for the rent equivalent. Rent usually increases
    // once a year so  we need to solve
    //
    // rent + 1.05 * rent + 1.05 ** 2 * rent + .... == total
    // <=> rent (1 + 1.05 + 1.05**2 + ...) == total
    var recurring = 0;
    var opportunity = 0;
    for (var i = 0; i < expectedStayDuration; i++) {
      recurring += Math.pow(1 + rentGrowthRate / 100.0, i);
      opportunity += recurring * (Math.pow(1 + roi / 100.0, i) - 1);
    }

    // monthly * (recurring + opportunity) * 12 == total
    // monthly * recurring * 12 + monthly * opportunity * 12 == total
    var monthly = total / 12 / (recurring + opportunity);

    // Assuming the deposit is 6 weeks.
    var deposit = Math.round(monthly * 1.5);

    return {
      amount: Math.round(monthly),
      recurringCosts: Math.round(monthly * recurring * 12),
      opportunityCosts: Math.round(monthly * opportunity * 12),
      deposit: deposit,
      depositReturn: -deposit
    };
  }

  /*
   * Gets the amounts for the model result
   */
  getRentAmounts(houseTotalCost, data) {
    return {
      equivalent: this.getRentPerMonthFromTotal(
        houseTotalCost,
        data.rentGrowthRate,
        data.expectedStayDuration,
        data.roi
      ),
      currentTotal: this.getDurationTotalSum(
        data.currentRent,
        data.rentGrowthRate,
        data.expectedStayDuration
      )
    };
  }
}

angular
  .module("home.rent", [])
  .service("Rent", Rent);
