/// <reference path="../../types/types.ts"/>


class HomeController implements core.IHomeController {
  price: number;
  rent: number;
  expected_price_increase: number;
  expected_rent_increase: number;
  mortgage_rate: number;

  /* @ngInject */
  constructor(private $scope: ng.IScope, private $location: ng.ILocationService) {
    var self = this;
    this.price = $location.search().p || 250000;
    this.rent = $location.search().r || 1400;
    this.expected_rent_increase = $location.search().ri || 5.0;
    this.expected_price_increase = $location.search().p || 4.0;
    this.mortgage_rate = $location.search().mr || 4.0;

    var update_function = function() {
      $location.search("p", self.price);
      $location.search("r", self.rent);
      $location.search("pi", self.expected_price_increase);
      $location.search("ri", self.expected_rent_increase);
      $location.search("mr", self.mortgage_rate);
    }

    $scope.$watch(function() { return self.price; }, update_function);
  }
}

angular
  .module("home.index", [])
  .controller("HomeController", HomeController);
