var numeral = require('numeral');
const {By, until, Key} = require('selenium-webdriver');
const {countReplies} = require('./Helper.js');

module.exports = {
    waitAndFind: async function(driver, method, arg) {
        var byObject;
        switch (method) {
            case "id": byObject = By.id(arg);
                break;
            case "css": byObject = By.css(arg);
                break;
            case "xpath": byObject = By.xpath(arg);
        }

        await driver.wait(until.elementLocated(byObject));
        return await driver.findElements(byObject);
    },

    openRepliesRecursive: async function(driver, originalCommentCount) {

        await driver.wait(async function() {
            let newReplies = await module.exports.countReplies(driver);
            return newReplies > originalCommentCount;
        }, 20000);

        body = await driver.findElement(By.css('body'));
        await body.sendKeys(Key.PAGE_DOWN);

        let replies = await driver.findElements(By.xpath('//*[contains(text(), "replies")]'));

        for(reply in replies){
            var buttonText = await replies[reply].getText();
            if (buttonText.includes("Show more replies")) {
                replyButton = await replies[reply].findElements(By.xpath('./..'));
                await driver.executeScript("arguments[0].click();", replyButton[0]);
                await module.exports.openRepliesRecursive(driver, await module.exports.countReplies(driver));
                break;
            }
        }
    return;
    },

    countReplies: async function(driver) {
        comments = await driver.findElements(By.css(".ytd-comment-replies-renderer"));
                
        var commentCount = 0;
        for (comment in comments) {
            if(await comments[comment].getAttribute("is-reply") != null && await comments[comment].isDisplayed()) {
                commentCount++;
            }
        }
        return commentCount;
    },

    numConvert: function(n) {
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
}
