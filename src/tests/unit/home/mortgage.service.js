describe('Unit: Mortgage service', function () {
    var mortgageService;
    var mortgageData;

    beforeEach(module('home.mortgage'));
    beforeEach(inject(function (Mortgage) {
        mortgageService = Mortgage;
        mortgageData = {
            downPayment: 50000,
            initialRate: 4,
            followupRate: 8,
            fixedDuration: 5,
            totalDuration: 25
        };
    }));

    it('should transform data', function () {
        var expectedData = {
            downPayment: 50000,
            initialRate: 4 / 12.0 / 100.0,
            followupRate: 8 / 12.0 / 100.0,
            fixedDuration: 5 * 12,
            totalDuration: 25 * 12
        };
        expect(mortgageService.transformData(mortgageData)).to.deep.equal(expectedData);
    });
});
