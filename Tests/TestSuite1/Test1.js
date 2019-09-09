const {Builder, By, until, Key, executeScript} = require('selenium-webdriver');
var numeral = require('numeral');
const { expect, should, assert, before, after } = require('chai');
const {driver, initdriver, numConvert, waitAndFind, openRepliesRecursive, countReplies} = require('../Helper.js');


it('should go to list and player page and compare views and check both same', async() => {

    var trendingCountFinal;
    var playerCountFinal;

    try{

        //find trending button and click
        let homePageLinks = await waitAndFind(driver(), "xpath", '//*[@id="endpoint"]');

        var newRefTrending;
        for(link in homePageLinks) {
            newRefTrending = await homePageLinks[link].getAttribute("href");
            if (newRefTrending.includes("trending") && await homePageLinks[link].isDisplayed()) {
                await homePageLinks[link].click();
                break;
            }
        }  
    
        //find No1 trending video and get view count
        await driver().get(await driver().getCurrentUrl());

        let metaList = await waitAndFind(driver(), "id", "metadata-line");
        let trendingCount = await metaList[0].getText();
        
        trendingCountFinal = numConvert(trendingCount);

        //navigate to player Page
        let videoLinks = await driver().findElements(By.id('thumbnail'));
        await videoLinks[0].click();
        await driver().get(await driver().getCurrentUrl());

        //find count from player page
        let player = await waitAndFind(driver(), "css", ".short-view-count");
        let count = await player[0].getAttribute('innerText');
        playerCount = count.split(" ")[0];
        playerCountFinal = numConvert(playerCount);

        return expect(trendingCountFinal).to.equal(playerCountFinal);
    }
    
    catch(err){
        assert.fail('expected', 'actual', err)
        return;
    }
});