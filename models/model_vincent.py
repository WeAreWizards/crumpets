
class Mortgage(object):
    """
    Down payment and rate are a %, length a number of year
    http://www.thisismoney.co.uk/money/mortgageshome/article-1687576/What-mortgage-rates.html
    http://www.moneysupermarket.com/mortgages/different-types-of-mortgages/
    """
    def __init__(self, rate, length):
        self.rate = rate
        # TODO: not sure if we need length in years at all, could convert directly to months
        self.length = length
        self.length_in_months = self.length * 12

    def _calculate_monthly_payment(self, loan_amount):
        monthly_interest_rate = self.rate / 100.0 / 12.0
        monthly_payment = loan_amount * (
            monthly_interest_rate / (1 - (1 + monthly_interest_rate) ** -self.length_in_months)
        )
        return monthly_payment

    def calculate_mortgage_costs(self, loan_amount, staying_length):
        return int(
            self._calculate_monthly_payment(loan_amount) * staying_length * 12
        )


class Home(object):
    def __init__(self, price, down_payment, length_stay, price_growth_rate, monthly_utilities, maintenance_rate):
        self.price = price
        self.down_payment = down_payment
        self.length_stay = length_stay
        self.price_growth_rate = price_growth_rate
        self.monthly_utilities = monthly_utilities
        self.maintenance_rate = maintenance_rate
        self.stamp_duty = self._calculate_stamp_duty()

    @property
    def down_payment_amount(self):
        return (self.price * self.down_payment) / 100

    @property
    def loan_amount(self):
        return self.price - self.down_payment_amount

    def _calculate_stamp_duty(self):
        """
        https://www.moneyadviceservice.org.uk/en/tools/house-buying/stamp-duty-calculator

        no need for elif really since I return
        """
        if self.price <= 125000:
            return 0
        elif self.price <= 250000:
            return 1
        elif self.price <= 500000:
            return 3
        elif self.price <= 1000000:
            return 4
        elif self.price <= 2000000:
            return 5
        else:
            return 7

    def calculate_initial_cost(self):
        return ((self.price * self.down_payment) + (self.price * self.stamp_duty)) / 100

    def calculate_utilities_cost(self, inflation_rate):
        number_months = self.length_stay * 12
        sum_cost = 0
        base_cost = self.monthly_utilities
        for i in range(1, number_months + 1):
            if i % 12 == 0:
                base_cost += (base_cost * inflation_rate) / 100

            sum_cost += base_cost
        return int(sum_cost)

    def calculate_maintenance_cost(self, inflation_rate):
        maintenance_cost = 0
        base_maintenance = (self.price * self.maintenance_rate) / 100
        for _ in range(0, self.length_stay):
            maintenance_cost += base_maintenance + (base_maintenance * inflation_rate) / 100

        return maintenance_cost

    def calculate_down_payment_invested(self, investment_return_rate):
        """
        Money 'lost' from not investing the down payment
        """
        money_in_account = self.down_payment_amount
        for _ in range(0, self.length_stay):
            money_in_account += (money_in_account * investment_return_rate) / 100

        return money_in_account

    def calculate_net_proceeds(self, mortgage):
        """
        Money gained from selling the house
        """
        house_price_when_leaving = self.price
        for _ in range(0, self.length_stay):
            house_price_when_leaving += (house_price_when_leaving * self.price_growth_rate) / 100

        mortgage_left = int((mortgage.length - self.length_stay) * 12 * mortgage._calculate_monthly_payment(self.loan_amount))

        # http://hoa.org.uk/advice/guides-for-homeowners/i-am-selling/how-much-should-i-pay-the-estate-agent/
        real_estate_fee = (house_price_when_leaving * 0.018)
        real_estate_fee += real_estate_fee / 0.02  # VAT 20%

        return house_price_when_leaving - mortgage_left - real_estate_fee


class Rent(object):
    def __init__(self, growth_rate):
        self.growth_rate = growth_rate

    def calculate_equivalent_renting(self, buying_cost, length_stay):
        """
        TODO: add rent growth rate in there somehow
        """
        monthly_rent = buying_cost / (length_stay * 12)
        return monthly_rent


def calculate_buying(home, mortgage, inflation_rate, investment_return_rate):
    initial_cost = home.calculate_initial_cost()

    mortgage_costs = mortgage.calculate_mortgage_costs(home.loan_amount, home.length_stay)
    utilities_costs = home.calculate_utilities_cost(inflation_rate)
    maintenance_costs = home.calculate_maintenance_cost(inflation_rate)
    recurring_costs = mortgage_costs + utilities_costs + maintenance_costs

    opportunity_costs = home.calculate_down_payment_invested(investment_return_rate)
    net_proceeds = home.calculate_net_proceeds(mortgage)

    return int(initial_cost), int(recurring_costs), int(opportunity_costs), int(net_proceeds)


if __name__ == "__main__":
    mortgage = Mortgage(5, 25)
    home = Home(100000, 20, 10, 3, 150, 1)
    rent = Rent(2.5)

    # Inflation: 2.5%
    # http://www.mortgageintroducer.com/mortgages/250432/5/Industry_in_depth/Inflation_falls_to_1.6pc.htm
    initial_cost, recurring_cost, opportunity_costs, net_proceeds = calculate_buying(home, mortgage, 2.5, 4)

    print "Mortgage:", mortgage.__dict__
    print "Home:", home.__dict__
    print 'Initial cost:', initial_cost
    print 'Recurring costs:', recurring_cost
    print 'Opportunity costs:', opportunity_costs
    print 'Net proceeds:', net_proceeds
    total = initial_cost + recurring_cost + opportunity_costs + net_proceeds
    print 'Total:', total

    equivalent_rent = rent.calculate_equivalent_renting(total, home.length_stay)

    print 'Rent if you find for %d or below (everything included)' % equivalent_rent