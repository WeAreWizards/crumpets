/// <reference path="../../types/types.ts"/>


class HomeController implements core.IHomeController {
  greeting: string;

  /* @ngInject */
  constructor(private $location: ng.ILocationService) {
    this.greeting = $location.search().greeting || "";

  }
}

angular
  .module("home.index", [])
  .controller("HomeController", HomeController);
