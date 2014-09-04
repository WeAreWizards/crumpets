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
});
