const { quitDriver, initDriver } = require('./Helper.js');

function importTest(name, path) {
    describe(name, function () {
        beforeEach( function() {
            initDriver();
        });

        afterEach( function() {
            quitDriver();
        })

        require(path);

    });
}

describe('TestSuite1', async () => {

    await importTest("Test1", './TestSuite1/Test1');

    await importTest("Test2", './TestSuite1/Test2');

    await importTest("Test3", './TestSuite1/Test3');

    await importTest("Test4", './TestSuite1/Test4');
});
