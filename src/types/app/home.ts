/// <reference path="../libs/angular.d.ts"/>

declare module app {

  interface IHomeController {
    price: number;
    rent: number;
    expected_price_increase: number;
    expected_rent_increase: number;
    mortgage_rate: number;
  }

  interface IMortgageFactory {
    principal: number;
    fixedYears: number;
    initialRate: number;
    followupRate: number;
    totalDurationMonths: number;

    create(
      principal: number,
      fixedYears: number,
      initialRate: number,
      followupRate: number,
      totalDurationMonths: number
    ): IMortgageFactory;
    principalLeft(initialMonthlyRate: number): number;
    calculateMonthlyRate(principal: number, rate: number, duration: number): number;
    calculateProgression(): number[];
  }
}
