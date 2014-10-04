describe('Unit: House service', function () {
    var houseService;

    beforeEach(module('home.house'));
    beforeEach(inject(function (House) {
        houseService = House;
    }));

    it('should get the proper stamp duty amount', function () {
        var values = [
            {price: 100000, stampDuty: 0},
            {price: 200000, stampDuty: 200000 * 0.01},
            {price: 400000, stampDuty: 400000 * 0.03},
            {price: 600000, stampDuty: 600000 * 0.04},
            {price: 1600000, stampDuty: 1600000 * 0.05},
            {price: 2600000, stampDuty: 2600000 * 0.07},
        ];

        for (var i = 0; i < values.length; i++) {
            expect(houseService.getStampDutyAmount(values[i].price)).to.equal(Math.round(values[i].stampDuty));
        }
    });

    it('should calculate the recurring opportunity costs correctly (sinking fund)', function () {
        var data = {
            mortgage: {
                downPayment: 0,
                initialRate: 1,
                followupRate: 0,
                fixedDuration: 1,
                totalDuration: 1
            },
            roi: 1,
            expectedStayDuration: 1,
            yearlyMaintenance: 0,
            inflationRate: 0,
            housePrice: 100,
            housePriceGrowthRate: 1,
        }
        var costs = houseService.getCosts(data);
        // The following is calculated using a sinking fund seeded
        // with 2000 pounds which we used for transactions costs. The
        // down payment for 1 year installments for 100 pounds and 0
        // down payment are 8 pounds
        expect(costs.opportunityCosts).to.equal(20.533146291310004);
    });
});
