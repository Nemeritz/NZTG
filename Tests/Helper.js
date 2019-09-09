var numeral = require('numeral');
const {Builder, By, until, Key} = require('selenium-webdriver');

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

    /*Combines wait and find of driver so don't have to type line twice*/
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

    /*Recursively open view more replies button in test 2*/
    openRepliesRecursive: async function(globalDriver, originalCommentCount) {

        await globalDriver.wait(async function() {
            let newReplies = await module.exports.countReplies(globalDriver);
            return newReplies > originalCommentCount;
        }, 20000);

        body = await globalDriver.findElement(By.css('body'));
        await body.sendKeys(Key.PAGE_DOWN);

        let replies = await globalDriver.findElements(By.xpath('//*[contains(text(), "replies")]'));

        for(reply in replies){
            var buttonText = await replies[reply].getText();
            if (buttonText.includes("Show more replies")) {
                replyButton = await replies[reply].findElements(By.xpath('./..'));
                await globalDriver.executeScript("arguments[0].click();", replyButton[0]);
                await module.exports.openRepliesRecursive(globalDriver, await module.exports.countReplies(globalDriver));
                break;
            }
        }
    return;
    },

    /*Count the number of replies on the page for test 2*/
    countReplies: async function(globalDriver) {
        comments = await module.exports.waitAndFind(globalDriver, "css", ".ytd-comment-replies-renderer");
        var commentCount = 0;
        for (comment in comments) {
            try {
                if(await comments[comment].getAttribute("is-reply") != null && await comments[comment].isDisplayed()) {
                    commentCount++;
                }
            }
            catch(err) {
                console.log("STALE");
                commentCount = commentCount;
            }
        }
        return commentCount;
    },

    /*Convert number from shortened string format to int*/
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
