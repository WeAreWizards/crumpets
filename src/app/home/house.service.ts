/// <reference path="../../types/types.ts"/>


class House implements app.IHouseService {
  /* @ngInject */
  constructor(private Mortgage: app.IMortgageService) {}

  private getStampDutyAmount(housePrice: number): number {
    // https://www.moneyadviceservice.org.uk/en/tools/house-buying/stamp-duty-calculator
    // let's hope there are no trillion dollar flats ...
    var steps = [125000, 250000, 500000, 1000000, 2000000, 1e12];
    var duty =  [0,      1,      3,      4,       5,       7];

    var stampDuty = 0;
    for (var i = 0; i < steps.length; i++) {
      if (housePrice <= steps[i]) {
        stampDuty = duty[i];
        break;
      }
    }

    return Math.round(stampDuty / 100.0 * housePrice);
  }

  /**
   * Assume that the yearly costs increase with inflation.
   */
  private getUpkeepTotal(
    yearlyMaintenance: number, inflationRate: number, expectedStayDuration: number
  ): number {
    var sum = 0;
    for (var i = 0; i < expectedStayDuration; i++) {
      sum += yearlyMaintenance * Math.pow(1 + inflationRate / 100.0, i);
    }
    return Math.round(sum);
  }

  /**
   * Calculates all the various costs given the input data
   */
  getCosts(data) {
    // How much would we have made on our down payment?
    var opportunityCosts = (
      data.mortgage.downPayment
      * Math.pow(1 + data.roi / 100.0, data.expectedStayDuration)
      - data.mortgage.downPayment
    );

    // Gets the amount we will pay for the time we stay and the amount
    // we will need to return
    var mortgageAmounts = this.Mortgage.getAmounts(
      data.mortgage, data.housePrice, data.expectedStayDuration
    );

    // What are we paying every month/year: mortgage + maintenance
    var recurringCosts = (
      this.getUpkeepTotal(data.yearlyMaintenance, data.inflationRate, data.expectedStayDuration)
      + mortgageAmounts.totalPaid
    );

    // £2000 for surveyor + solicitor + other fluff.
    // NB don't remove 1.0 * because javascript is a monkey language.
    var transactionCosts = (
      this.getStampDutyAmount(data.housePrice)
      + 2000
      +  1.0 * data.mortgage.downPayment
    );

    // How much will the house be worth after expectedStayDuration years
    var finalSalePrice = data.housePrice * Math.pow(
        1 + data.housePriceGrowthRate / 100.0, data.expectedStayDuration
    );
    // NB that we have to return the principal left to the bank after
    // we're moving out.
    var estateAgentFees = 0.018 * finalSalePrice;

    // NB that we count "profit" as negative
    var proceeds = (
      estateAgentFees
      - finalSalePrice
      + mortgageAmounts.principalToReturn
    );

    var totalCost = recurringCosts + transactionCosts + opportunityCosts + proceeds;

    return {
      opportunityCosts: opportunityCosts,
      recurringCosts: recurringCosts,
      transactionCosts: transactionCosts,
      proceeds: proceeds,
      totalCost: totalCost
    };
  }
}

angular
  .module("home.house", [
    "home.mortgage"
  ])
  .service("House", House);
