const {Builder, By, until, Key} = require('selenium-webdriver');
var numeral = require('numeral');
const { expect, should, assert, before, after } = require('chai');

describe('DefaultTest', () => {

    var driver;

    beforeEach( function() {
        driver = new Builder().forBrowser('firefox').build();
        driver.get('https://www.youtube.com/');
    });

    afterEach( function() {
        //driver.quit();
    })


    // it('should go to list and player page and compare views and check both same', async() => {

    //     var trendingCountFinal;
    //     var playerCountFinal;

    //     try{
    //         await driver.wait(until.elementLocated(By.xpath('//*[@id="endpoint"]')));
    //         let homePageLinks = await driver.findElements(By.xpath('//*[@id="endpoint"]'));

    //         var newRefTrending;
    //         for(link in homePageLinks) {
    //             newRefTrending = await homePageLinks[link].getAttribute("href");
    //             if (newRefTrending.includes("trending") && await homePageLinks[link].isDisplayed()) {
    //                 await homePageLinks[link].click();
    //                 break;
    //             }
    //         }  
        
    //         await driver.get(await driver.getCurrentUrl());
    //         await driver.wait(until.elementLocated(By.id('metadata-line')));
    //         let metaList = await driver.findElements(By.id('metadata-line'));
    //         let trendingCount = await metaList[0].getText();
            
    //         trendingCountFinal = numConvert(trendingCount);
    //         console.log(trendingCountFinal);

    //         //navigate to player Page
    //         let videoLinks = await driver.findElements(By.id('thumbnail'));
    //         await videoLinks[0].click();
            
    //         await driver.get(await driver.getCurrentUrl());
    //         await driver.wait(until.elementLocated(By.css('.short-view-count')));
    //         let player = await driver.findElements(By.css('.short-view-count'));
    //         let count = await player[0].getAttribute('innerText');
    //         playerCount = count.split(" ")[0];
    //         playerCountFinal = numConvert(playerCount);
    //         console.log(playerCountFinal)

    //         return expect(trendingCountFinal).to.equal(playerCountFinal);
    //     }
        
    //     catch(err){
    //         assert.fail('expected', 'actual', err)
    //         return;
    //     }
    // });

    it('should go to a trending video look for comment with replies and check there are the same amount of replies as shown', async() => {

        var trendingCountFinal;
        var playerCountFinal;

        try{
            await driver.wait(until.elementLocated(By.id('thumbnail')));
            let videoLinks = await driver.findElements(By.id('thumbnail'));
            await videoLinks[0].click();
            
            //navigate to first video player page
            await driver.get(await driver.getCurrentUrl());

            await driver.wait(until.elementLocated(By.xpath('//div[@id="loaded-replies"]//yt-formatted-string[@id="content-text"]')));
            let player = await driver.findElements(By.xpath('//div[@id="loaded-replies"]//yt-formatted-string[@id="content-text"]'));
            
            console.log(player);

            for(x in player){

                console.log(await player[x].getText());
            }

            //await player[0].click();

            // var newRefTrending;
            // for(link in homePageLinks) {
            //     newRefTrending = await homePageLinks[link].getAttribute("href");
            //     if (newRefTrending.includes("trending") && await homePageLinks[link].isDisplayed()) {
            //         await homePageLinks[link].click();
            //         break;
            //     }
            // }  

            //return expect(trendingCountFinal).to.equal(playerCountFinal);
        }
        
        catch(err){
            assert.fail('expected', 'actual', err)
            return;
        }
    });

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
