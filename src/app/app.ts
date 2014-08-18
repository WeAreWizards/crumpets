/// <reference path="../types/types.ts"/>


/* @ngInject */
function appConfig($urlRouterProvider: ng.ui.IUrlRouterProvider, $stateProvider: ng.ui.IStateProvider) {
  $urlRouterProvider.otherwise("/home");
}

angular
  .module("crumpets", [
    "templates",
    "crumpets.home",
    "ui.router.state"
  ])
  .config(appConfig);
