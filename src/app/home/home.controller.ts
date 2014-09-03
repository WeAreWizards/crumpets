/// <reference path="../../types/types.ts" />

/**
 * Manual testing checklist:
 * - Does every input field alter a parameter in the URL?
 * - Are all inputs validated? E.g. down_payment < price.
 * - Is every input parameter used in some calculation?
 *    - alternatively: does every input change the result?
 * - Rendering on common screen sizes?
 */

interface IMonthlyRate {
  initial: number;
  followup: number;
}

interface IPresentableResult {
  rent_equivalent: number;
  buy_recurring_costs: number;
  buy_opportunity_costs: number;
  buy_transaction_costs: number;
  buy_cost: number;
  buy_proceeds: number;
}

interface IRentSplit {
  recurring_costs: number;
  opportunity_costs: number;
  monthly: number;
}

class HomeController {
  // TODO(tom): move to camelCase.
  price: number;
  down_payment: number;
  initial_rate: number;
  fixed_years: number;
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
    this.fixed_years = $location.search().fy || 5;
    this.current_rent = $location.search().cr || 1100;
    this.expected_stay_duration = $location.search().esd || 6;
    this.followup_rate = $location.search().fr || 8;
    this.price_growth_rate = $location.search().pgr || 2;
    this.rent_growth_rate = $location.search().rgr || 5;
    this.inflation_rate = $location.search().inr || 2.6;
    this.roi = $location.search().roi || 1;
    this.yearly_maintenance = $location.search().ym || 1200;
    this.mortgage_duration_years = $location.search().mdy || 25;
  }

  /**
   * How much will we pay for the mortgage rates over the expected_stay_duration?
   */
  buy_mortgage_total_recurring_sum(monthly_rates: IMonthlyRate,
                                   fixed_years: number,
                                   expected_stay_duration: number): number {
    // sum together the money to be paid for the years the user is staying.
    var sum = 0;
    for (var i = 0; i < expected_stay_duration * 12; i++) {
      if (i < fixed_years * 12) {
        sum += monthly_rates.initial;
      } else {
        sum += monthly_rates.followup;
      }
    }
    return sum;
  }

  /**
   * How much rent could we afford to break even after we stayed the
   * number of years.
   *
   * The basic idea is to sum together the costs of renting and buying
   * over the intended duration of stay. To that we need to add
   * various fixed costs, subtract opportunity costs such as the
   * return-on-invesment for the down payment.
   */
  presentable_result() : IPresentableResult {
    // TODO(tom): We probably want to cache this calculation with a $watch handler.
    // TODO(tom): Add fixed cost to price or assume that people have the money?
    var monthly_rates = this.monthly_rates(
      this.price - this.down_payment,
      this.fixed_years * 12,
      this.initial_rate / 12.0 / 100.0,
      this.followup_rate / 12.0 / 100.0,
      this.mortgage_duration_years * 12
    );

    // total mortgage payments over expected_stay_duration
    var mortgage_total = this.buy_mortgage_total_recurring_sum(
      monthly_rates, this.fixed_years, this.expected_stay_duration);

    // How much would we have made on our down payment?
    var buy_opportunity_costs = (
      this.down_payment * Math.pow(1 + this.roi / 100.0, this.expected_stay_duration)
        - this.down_payment);

    var buy_recurring_costs = mortgage_total + this.buy_upkeep_total(
      this.yearly_maintenance, this.inflation_rate, this.expected_stay_duration);

    // £2000 for surveyor + solicitor + other fluff.
    // NB don't remove 1.0 * because javascript is a monkey language.
    var buy_transaction_costs : number = this.stamp_duty(this.price) / 100.0 * this.price  + 2000 + 1.0 * this.down_payment;

    var final_sale_price = this.price * Math.pow(
      1 + this.price_growth_rate / 100.0,
      this.expected_stay_duration);

    var principal_to_return = this.principal_to_return(
      this.price - this.down_payment,
      this.fixed_years * 12,
      this.initial_rate / 12.0 / 100.0,
      this.followup_rate / 12.0 / 100.0,
      this.expected_stay_duration * 12,
      this.mortgage_duration_years * 12
    );

    // NB that we have to return the principal left to the bank after
    // we're moving out.
    var estate_agent_fees = 0.018 * final_sale_price;

    // NB that we count "profit" as negative
    var buy_proceeds =  principal_to_return + estate_agent_fees - final_sale_price;

    var buy_cost = (
      buy_recurring_costs
        + buy_transaction_costs
        + buy_opportunity_costs
        + buy_proceeds);

    var rent_split = this.rent_per_month_from_total(
      buy_cost, this.expected_stay_duration, this.rent_growth_rate, this.roi);

    var current_rent_total = this.current_rent_total(
      this.current_rent, this.rent_growth_rate, this.expected_stay_duration);

    return {
      rent_equivalent: rent_split.monthly,
      rent_opportunity_costs: rent_split.opportunity_costs,
      rent_recurring_costs: rent_split.recurring_costs,
      buy_recurring_costs: buy_recurring_costs,
      buy_opportunity_costs: buy_opportunity_costs,
      buy_transaction_costs: buy_transaction_costs,
      buy_cost: buy_cost,
      buy_proceeds: buy_proceeds,
      save_vs_current_rent: current_rent_total - buy_cost
    };
  }

  /**
   * How much would we be paying if we continued paying our normal rent for expected_stay_duration?
   */
  current_rent_total(current_rent: number, rent_growth_rate: number, expected_stay_duration: number): number {
    var sum = 0;
    for (var i = 0; i < expected_stay_duration; i++) {
      sum += current_rent * 12 * Math.pow(1 + rent_growth_rate / 100.0, i);
    }
    return sum;
  }

  /**
   * Assume that the yearly costs increase with inflation.
   */
  buy_upkeep_total(initial_yearly: number, inflation_rate: number, expected_stay_duration: number): number {
    var sum = 0;
    for (var i = 0; i < expected_stay_duration; i++) {
      sum += initial_yearly * Math.pow(1 + inflation_rate / 100.0, i);
    }
    return sum;
  }

  /**
   * Given a total sum how much rent would that be per month (includes
   * expected rent increases).
   */
  rent_per_month_from_total(total: number, years: number, rent_increase: number, roi: number): IRentSplit {
    // We know how much the total costs will be for a house and we
    // need to solve for the rent equivalent. Rent usually increases
    // once a year so  we need to solve
    // rent + 1.05 * rent + 1.05 ** 2 * rent + .... == total
    // rent (1 + 1.05 + 1.05**2 + ...) == total
    var recurring = 0;
    var opportunity = 0;
    for (var i = 0; i < years; i++) {
      recurring += Math.pow(1 + rent_increase / 100.0, i);
      opportunity += recurring * (Math.pow(1 + roi / 100.0, i) - 1);
    }

    // TODO(tom): deposit + deposit * roi after moving out + estate agent fees

    // monthly * (recurring + opportunity) * 12 == total
    // monthly * recurring * 12 + monthly * opportunity * 12 == total
    var monthly = total / 12 / (recurring + opportunity);

    return {
      monthly: monthly,
      recurring_costs: monthly * recurring * 12,
      opportunity_costs: monthly * opportunity * 12
    }
  }

  crumpet_equivalent(): number {
    return 10;
  }

  update_url() {
    this.$location.search("p", this.price);
    this.$location.search("dp", this.down_payment);
    this.$location.search("ir", this.initial_rate);
    this.$location.search("fy", this.fixed_years);
    this.$location.search("cr", this.current_rent);
    this.$location.search("esd", this.expected_stay_duration);
    this.$location.search("fr", this.followup_rate);
    this.$location.search("pgr", this.price_growth_rate);
    this.$location.search("rgr", this.rent_growth_rate);
    this.$location.search("inr", this.inflation_rate);
    this.$location.search("roi", this.roi);
    this.$location.search("ym", this.yearly_maintenance);
    this.$location.search("mdy", this.mortgage_duration_years);
    this.redraw();
  }

  // draw sparklines
  redraw() {
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

  /**
   * Monthly rate for given repayment rate, principal and number of
   * repayment periods.
   */
  monthly_rate(principal: number, r: number, t: number): number {
    return principal * r * Math.pow(r + 1, t) / (Math.pow(r + 1, t) - 1);
  }

  /**
   * Calculate how much is left of the principal after paying the
   * monthly rate A for t months.
   */
  principal_left(principal: number, r: number, A: number, t: number): number {
    var s: number = 0;
    for (var i = 0; i < t; i++) {
      s += Math.pow(1 + r, i);
    }
    return principal * Math.pow(1 + r, t) - A * s;
  }

  /**
   * How much principal do we have to return to the bank after selling on after N years?
   */
  principal_to_return(
    principal: number,
    fixed_months: number,
    initial_rate: number,
    followup_rate: number,
    expected_stay_duration: number,
    total_duration_month: number): number {

      var A_initial = this.monthly_rate(principal, initial_rate, total_duration_month);
      var left = this.principal_left(principal, initial_rate, A_initial, fixed_months);
      var A_followup = this.monthly_rate(left, followup_rate, total_duration_month - fixed_months);

      // If the expected_stay_duration is shorter than the fixed term
      // we can calculate the principal left from the fixed
      // rate. Otherwise we need to use the followup term.
      if (expected_stay_duration - fixed_months <= 0) {
        return this.principal_left(principal, initial_rate, A_initial, expected_stay_duration);
      }

      return this.principal_left(
        left,
        followup_rate,
        A_followup,
        expected_stay_duration - fixed_months
      );
  }

  /**
   * How much are we paying for the first fixed_months, how much after?
   */
  monthly_rates(
    principal: number,
    fixed_months: number,
    initial_rate: number,
    followup_rate: number,
    total_duration_month: number): IMonthlyRate {

      var A_initial = this.monthly_rate(principal, initial_rate, total_duration_month);
      var left = this.principal_left(principal, initial_rate, A_initial, fixed_months);
      var A_followup = this.monthly_rate(left, followup_rate, total_duration_month - fixed_months);

      return {initial: A_initial, followup: A_followup};
  }

  stamp_duty(price: number): number {
    // from Vincent's model
    // https://www.moneyadviceservice.org.uk/en/tools/house-buying/stamp-duty-calculator

    // let's hope there are no trillion dollar flats ...
    var steps = [125000, 250000, 500000, 1000000, 2000000, 1e12];
    var duty =  [0,      1,      3,      4,       5,       7];

    for (var i = 0; i < steps.length; i++) {
      if (price <= steps[i]) {
        return duty[i];
      }
    }
  }
}

/**
 * Change inputs to add prefix or postfix (e.g. £ or %) while still
 * parsing the input as a number.
 *
 * NB that this only works in combination with `ng-model-options="{
 * updateOn: 'blur' }"`
 */
function MakeFormatter(prefix, postfix) {
  var m_regex = new RegExp("^" + prefix + "([0-9]+)" + postfix + "$");
  return function(): ng.IDirective {
    return {
      restrict: "A",
      require: "ngModel",
      link: function(scope: ng.IScope,
                     instanceElement: any,
                     instanceAttributes: ng.IAttributes,
                     controller: any) {

        function format(value) {
          return prefix + value + postfix;
        }

        function parse(value) {
          var m = m_regex.exec(value);
          var value;
          if (m == null) {
            value = parseFloat(value) || 0;
            controller.$setViewValue(prefix + value + postfix);
            controller.$render();
          } else {
            value = parseFloat(m[1]);
          }
          return value;
        }
        controller.$formatters.push(format);
        controller.$parsers.push(parse);
      }
    };
  }
}

angular
  .module("home.index", [])
  .controller("HomeController", HomeController)
  .directive("poundPrefixer", MakeFormatter("£ ", ""))
  .directive("percentPostfixer", MakeFormatter("", " %"))
  .directive("yearPostfixer", MakeFormatter("", " years"));
