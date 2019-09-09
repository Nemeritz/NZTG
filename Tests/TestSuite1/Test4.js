const {Key} = require('selenium-webdriver');
const { expect, assert } = require('chai');
const { driver, waitAndFind} = require('../Helper.js');

it('search for youtube and sort by sort by view count and first video show despacito', async() => {
    

    try{
        //search with keyword being "youtube"
        let searchBox = await waitAndFind(driver(), "xpath", '//input[@id="search"]');
        await searchBox[0].sendKeys("Youtube", Key.ENTER);

        //click filter and filter by view count
        let filterButton = await waitAndFind(driver(), "xpath", '//yt-formatted-string[contains(text(), "Filter")]');
        await filterButton[0].click();

        var previousUrl = await driver().getCurrentUrl();

        ViewFilterButton = await waitAndFind(driver(), "xpath", '//yt-formatted-string[contains(text(), "View count")]');
        await ViewFilterButton[0].click();

        //wait for new search filter to apply and load
        await driver().wait(async function() {
            let newUrl = await driver().getCurrentUrl();
            return newUrl != previousUrl;
        }, 20000);

        await driver().get(driver().getCurrentUrl());

        let videos = await waitAndFind(driver(), "id", "video-title");
        let topVideo = await videos[0].getText();
        
        expect(topVideo).to.equal("Luis Fonsi - Despacito ft. Daddy Yankee");
    }
    
    catch(err){
        assert.fail('expected', 'actual', err)
        return;
    }
});