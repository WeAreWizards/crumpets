/// <reference path="../../types/types.ts" />

/**
 * Manual testing checklist:
 * - Does every input field alter a parameter in the URL?
 * - Are all inputs validated? E.g. down_payment < price.
 * - Is every input parameter used in some calculation?
 *    - alternatively: does every input change the result?
 * - Rendering on common screen sizes?
 */

class HomeController {
  data: app.IFormData;
  result: app.IResult;

  /* @ngInject */
  constructor(private Rent: app.IRentService, private House: app.IHouseService) {
    // Some defaults hardcoded here for now (set as value in template maybe?)
    this.data = {
      housePrice: 250000,
      expectedStayDuration: 6,
      housePriceGrowthRate: 2,
      yearlyMaintenance: 1200,
      currentRent: 1100,
      rentGrowthRate: 5,
      inflationRate: 2.6,
      roi: 1,
      mortgage: {
        downPayment: 50000,
        initialRate: 4,
        followupRate: 8,
        fixedDuration: 5,
        totalDuration: 25
      }
    };

    // Compute right away
    this.compute();

  }

  /**
   * How much rent could we afford to break even after we stayed the
   * number of years.
   *
   * The basic idea is to sum together the costs of renting and buying
   * over the intended duration of stay. To that we need to add
   * various fixed costs, subtract opportunity costs such as the
   * return-on-investment for the down payment.
   */
  compute() {
    var houseData = this.House.getCosts(this.data);
    var rentData = this.Rent.getRentAmounts(houseData.totalCost, this.data);
    this.result = {
      house: houseData,
      rent: rentData.equivalent,
      saveVSRent: rentData.currentTotal - houseData.totalCost
    };
  }

  // TODO: move to service
  inCrumpets() {
    return 10;
  }
}

angular
  .module("home.index", [
    "home.rent",
    "home.house"
  ])
  .controller("HomeController", HomeController);
