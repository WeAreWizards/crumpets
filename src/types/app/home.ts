/// <reference path="../libs/angular.d.ts"/>

declare module app {

  // The data we get in the form
  interface IFormData {
    housePrice: number;
    expectedStayDuration: number;
    housePriceGrowthRate: number;
    yearlyMaintenance: number;
    mortgage: IMortgageData;
    currentRent: number;
    rentGrowthRate: number;
    inflationRate: number;
    roi: number;
  }

  // Result of the model
  interface IResult {
    house: IHouseData;
    rent: IEquivalentRentData;
    saveVSRent: number; // TODO: better name
  }

  interface IMortgageData {
    downPayment: number;
    initialRate: number;
    followupRate: number;
    fixedDuration: number;
    totalDuration: number;
  }

  interface IMortgageResults {
    totalPaid: number;
    principalToReturn: number;
  }

  interface IEquivalentRentData {
    recurringCosts: number;
    opportunityCosts: number;
    amount: number;
  }

  interface IRentResults {
    equivalent: IEquivalentRentData;
    currentTotal: number;
  }

  interface IHouseData {
    opportunityCosts: number;
    recurringCosts: number;
    transactionCosts: number;
    proceeds: number;
    totalCost: number;
  }

  interface IHouseService {
    getCosts(data: IFormData): IHouseData;
  }

  interface IMortgageService {
    getAmounts(data: IMortgageData, housePrice: number, expectedStayDuration: number): IMortgageResults;
    getOpportunityCosts(data: IMortgageData, housePrice: number, expectedStayDuration: number,
                        initialCosts: number, roi: number): number;

  }

  interface IRentService {
    getRentAmounts(houseTotalCost: number, data: IFormData): IRentResults;
  }

}
