const {Builder, By, until, Key} = require('selenium-webdriver');
var numeral = require('numeral');
const { expect, should, assert } = require('chai');

describe('DefaultTest', () => {
    it('should go to list and player page and compare views and check both same', async() => {
	
	var trendingCountFinal;
	var playerCountFinal;

	try{
        const driver = await new Builder().forBrowser('firefox').build();

        await driver.get('https://www.youtube.com/');
	await driver.wait(until.elementLocated(By.id("metadata-line")));
	let homePageLinks = await driver.findElements(By.id("endpoint"));
        let hrefHome = await homePageLinks;

	var newRefTrending;
	for(link in hrefHome) {
		
	    newRefTrending = await hrefHome[link].getAttribute("href");
            if (newRefTrending.includes("trending")) {
		break;
	    }
	}

        
	await driver.get(newRefTrending);
        await driver.wait(until.elementLocated(By.id("metadata-line")));
        let metaList = await driver.findElements(By.id("metadata-line"));
        let trendingCount = await metaList[0].getText();
        
        trendingCountFinal = numConvert(trendingCount);

        //navigate to 
	let videoLinks = await driver.findElements(By.id("thumbnail"));
        let hrefPlayer = await videoLinks[0];
        let newRefPlayer = await hrefPlayer.getAttribute("href");
        await driver.get(newRefPlayer);

        await driver.wait(until.elementLocated(By.css(".short-view-count")));
        let player = await driver.findElements(By.css(".short-view-count"));
        let count = await player[0].getAttribute("innerText");
        playerCount = count.split(" ")[0];

        playerCountFinal = numConvert(playerCount);

        // expect( function() {
        //     (trendingCountFinal).to.equal(playerCountFinal - 1)
        // }).to.throw( Error );
        //assert.fail(trendingCountFinal, playerCountFinal, "Does not equal");

        //expect(trendingCountFinal, "faileDDD").to.equal(playerCountFinal)
	expect(trendingCountFinal).to.equal(playerCountFinal-1);
	}

	catch(err){
		assert.fail('expected', 'actual', err)
		//return;
	}
    });

//    after(async () => driver.quit());
//    catch(error) {
//        console.log(error);
//    }


});



function numConvert(n) {
 	numResult = n.split("\n")[0].split(" ")[0];
        var multiplier = 1;
        switch(numResult.substr(-1)) {
            case "K": 
                multiplier = 1000;
                break;
            case "M":
                multiplier = 1000000;
                break;
            case "B":
                multiplier = 1000000000;
                break;
            default:
                multiplier = 1;
        }

    numResult = numeral(numResult).value() * multiplier;

    return numResult;
}
