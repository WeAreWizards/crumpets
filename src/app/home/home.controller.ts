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

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $location: ng.ILocationService
  ) {
    // We want copy-pastable URLs so we're storing all the default
    // values immediately as URL params. We then synchronise page and
    // URL every time any value changes. Using short names to avoid
    // uber-long URLs.
    var self = this;

    this.price = $location.search().p || 250000;
    this.down_payment = $location.search().dp || 50000;
    this.initial_rate = $location.search().ir || 0.04;
    this.duration_fixed = $location.search().df || 5;
    this.current_rent = $location.search().cr || 1100;
    this.expected_stay_duration = $location.search().esd || 6;
    this.followup_rate = $location.search().fr || 8;
    this.price_growth_rate = $location.search().pgr || 0.05;
    this.rent_growth_rate = $location.search().rgr || 0.05;
    this.inflation_rate = $location.search().ir || 0.026;
    this.roi = $location.search().roi || 0.01;
    this.yearly_maintenance = $location.search().ym || 1200;

    var update_function = () => {
      this.redraw();
    };

    $scope.$watch(function() { return self.price; }, update_function);
  }

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
