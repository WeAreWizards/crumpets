/// <reference path="../../types/types.ts" />

class HomeController {
  price: number;
  down_payment: number;
  initial_rate: number;
  duration_fixed: number;
  current_rent: number;
  expected_stay_duration: number;
  followup_rate: number;
  price_growth_rate: number;
  rent_growth_rate: number;
  inflation_rate: number;
  roi: number;
  yearly_maintenance: number;
  mortgage_duration_years: number;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $location: ng.ILocationService
  ) {
    // We want copy-pastable URLs so we're storing all the default
    // values immediately as URL params. We then synchronise page and
    // URL every time any value changes. Using short names to avoid
    // uber-long URLs.

    this.price = $location.search().p || 250000;
    this.down_payment = $location.search().dp || 50000;
    this.initial_rate = $location.search().ir || 4;
    this.duration_fixed = $location.search().df || 5;
    this.current_rent = $location.search().cr || 1100;
    this.expected_stay_duration = $location.search().esd || 6;
    this.followup_rate = $location.search().fr || 8;
    this.price_growth_rate = $location.search().pgr || 5;
    this.rent_growth_rate = $location.search().rgr || 5;
    this.inflation_rate = $location.search().inr || 2.6;
    this.roi = $location.search().roi || 1;
    this.yearly_maintenance = $location.search().ym || 1200;
    this.mortgage_duration_years = $location.search().mdy || 25;

    var update_function = () => {
      $location.search("p", this.price);
      $location.search("dp", this.down_payment);
      $location.search("ir", this.initial_rate);
      $location.search("df", this.duration_fixed);
      $location.search("cr", this.current_rent);
      $location.search("esd", this.expected_stay_duration);
      $location.search("fr", this.followup_rate);
      $location.search("pgr", this.price_growth_rate);
      $location.search("rgr", this.rent_growth_rate);
      $location.search("inr", this.inflation_rate);
      $location.search("roi", this.roi);
      $location.search("ym", this.yearly_maintenance);
      $location.search("mdy", this.mortgage_duration_years);
      this.redraw();
    };

    $scope.$watch(() => {
      return this.price + this.down_payment + this.initial_rate + this.duration_fixed + this.current_rent + this.expected_stay_duration + this.followup_rate + this.price_growth_rate + this.rent_growth_rate + this.inflation_rate + this.roi + this.yearly_maintenance + this.mortgage_duration_years;
    }, update_function);
  }

  // Output functions

  /**
   * How much rent could we afford to break even after we stayed the
   * number of years.
   */
  rent_equivalent() : number {
    // Hoe mu
    return 100;
  }

  save_vs_rent() : number {
    return 100;
  }

  crumpet_equivalent(): number {
    return 10;
  }

  // draw sparklines
  redraw() {
    console.log(this.progression);
    var price = d3.select("#price");
    price
      .selectAll("div")
      .data(d3.range(20))
      .enter()
      .append("div")
      .style("width", "10px")
      .style("float", "left")
      .style("background", "#a00")
      .style("height", function(d, i) {return "" + d + "px"; });
  }

  // Mortgage functions
  monthly_rate(principal: number, r: number, t: number): number {
    return principal * r * Math.pow(r + 1, t) / (Math.pow(r + 1, t) - 1);
  }

  principal_left(principal: number, r: number, A: number, t: number): number {
    var s: number = 0;
    for (var i = 0; i < t; i++) {
      s += Math.pow(1 + r, i);
    }
    return principal * Math.pow(1 + r, t) - A * s;
  }

  progression(
    principal: number,
    fixed_years: number,
    initial_rate: number,
    followup_rate: number,
    total_duration_month: number): number[]
  {
    var A_initial = this.monthly_rate(principal, initial_rate, total_duration_month);
    var left = this.principal_left(principal, initial_rate, A_initial, fixed_years);
    var A_followup = this.monthly_rate(left, followup_rate, total_duration_month - fixed_years);

    return [A_initial, A_followup];
  }

}

angular
  .module("home.index", [
  ])
  .controller("HomeController", HomeController);
