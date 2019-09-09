var numeral = require('numeral');
const {Builder, By, until, Key} = require('selenium-webdriver');
const {countReplies} = require('./Helper.js');

    var globalDriver;

module.exports = {

    driver: function () {return globalDriver;},

    initDriver: function() {
        globalDriver = new Builder().forBrowser('firefox').build();
        globalDriver.get('https://www.youtube.com/');
        return globalDriver;
    },

    quitDriver: function() {
        globalDriver.quit();
        return;
    },

    waitAndFind: async function(globalDriver, method, arg) {
        var byObject;
        switch (method) {
            case "id": byObject = By.id(arg);
                break;
            case "css": byObject = By.css(arg);
                break;
            case "xpath": byObject = By.xpath(arg);
        }

        await globalDriver.wait(until.elementLocated(byObject));
        return await globalDriver.findElements(byObject);
    },

    openRepliesRecursive: async function(globalDriver, originalCommentCount) {

        console.log(1);

        await globalDriver.wait(async function() {
            let newReplies = await module.exports.countReplies(globalDriver);
            return newReplies > originalCommentCount;
        }, 20000);

        console.log(2);

        body = await globalDriver.findElement(By.css('body'));
        await body.sendKeys(Key.PAGE_DOWN);

        console.log(3);

        let replies = await globalDriver.findElements(By.xpath('//*[contains(text(), "replies")]'));

        console.log(4);

        for(reply in replies){
            var buttonText = await replies[reply].getText();
            console.log(5);
            if (buttonText.includes("Show more replies")) {
                console.log(6);
                replyButton = await replies[reply].findElements(By.xpath('./..'));
                console.log(7);
                await globalDriver.executeScript("arguments[0].click();", replyButton[0]);
                console.log(8);
                await module.exports.openRepliesRecursive(globalDriver, await module.exports.countReplies(globalDriver));
                break;
            }
        }
        console.log(5);
    return;
    },

    countReplies: async function(globalDriver) {
        console.log(9);
        comments = await module.exports.waitAndFind(globalDriver, "css", ".ytd-comment-replies-renderer");
        console.log(10);
        var commentCount = 0;
        for (comment in comments) {
            console.log(11);
            try {
                if(await comments[comment].getAttribute("is-reply") != null && await comments[comment].isDisplayed()) {
                    commentCount++;
                    console.log(12);
                }
            }
            catch(err) {
                console.log(err);
            }
        }
        console.log(13);
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
