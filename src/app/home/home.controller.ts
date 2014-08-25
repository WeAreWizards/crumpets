/// <reference path="../../types/types.ts" />
/// <reference path="./mortgage.ts" />

class HomeController implements core.IHomeController {
  price: number;
  rent: number;
  expected_price_increase: number;
  expected_rent_increase: number;
  mortgage_rate: number;
  mortgage;

  /* @ngInject */
  constructor(private $scope: ng.IScope, private $location: ng.ILocationService, mortgage) {
    // We want copy-pastable URLs so we're storing all the default
    // values immediately as URL params. We then synchronise page and
    // URL every time any value changes. Using short names to avoid
    // uber-long URLs.
    var self = this;

    this.price = $location.search().p || 250000;
    this.rent = $location.search().r || 1400;
    this.expected_rent_increase = $location.search().ri || 5.0;
    this.expected_price_increase = $location.search().p || 4.0;
    this.mortgage_rate = $location.search().mr || 4.0;

    // remember injected mortgage module
    this.mortgage = mortgage;

    var update_function = () => {
      $location.search("p", this.price);
      $location.search("r", this.rent);
      $location.search("pi", this.expected_price_increase);
      $location.search("ri", this.expected_rent_increase);
      $location.search("mr", this.mortgage_rate);
      this.redraw();
    };

    $scope.$watch(function() { return self.price; }, update_function);
  }

  redraw() {
    var A_initial, A_followup = this.mortgage.progression(245000, 5, 0.037 / 12, 0.07 / 12, 12 * 25);
    console.log(A_initial, A_followup);
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
}

angular
  .module("home.index", [
    "mortgage"
  ])
  .controller("HomeController", HomeController);
