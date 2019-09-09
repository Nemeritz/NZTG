const {Builder, By, until, Key, executeScript} = require('selenium-webdriver');
var numeral = require('numeral');
const { expect, should, assert, before, after } = require('chai');
const {driver, initDriver, numConvert, waitAndFind, openRepliesRecursive, countReplies} = require('../Helper.js');

it('should go to a trending video look for comment with replies and check there are the same amount of replies as shown', async() => {

    try{
        
        let videoLinks = await waitAndFind(driver(), "id", "thumbnail");
        await videoLinks[0].click();
        
        //navigate to first video player page
        await driver().get(await driver().getCurrentUrl());

        //wait for some of page to load and scroll down
        await driver().wait(until.elementLocated(By.xpath('//paper-button[@id="button"][@class="style-scope ytd-button-renderer"]')));
        body = await driver().findElement(By.css('body'));
        await body.sendKeys(Key.PAGE_DOWN);

        //Click View xx Repl
        let player = await waitAndFind(driver(), "xpath", '//paper-button[@id="button"][@class="style-scope ytd-button-renderer"]');

        for(x in player){
            var buttonText = await player[x].getText();
            if (buttonText.includes("View")&& buttonText.includes("repl")) {
                await player[x].click();
                //click open all 'view more replies'
                await openRepliesRecursive(driver(), 0);
                break;
            }
        }

        let replyCountShown = parseInt(buttonText.split(" ")[1]);
        let replyCountCounted = await countReplies(driver());

        return expect(replyCountShown).to.equal(replyCountCounted);
    }
    
    catch(err){
        assert.fail('expected', 'actual', err)
        return;
    }
});