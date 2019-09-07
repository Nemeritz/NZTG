const {Builder, By, until, Key, executeScript} = require('selenium-webdriver');
var numeral = require('numeral');
const { expect, should, assert, before, after } = require('chai');

describe('DefaultTest', () => {

    var driver;

    beforeEach( function() {
        driver = new Builder().forBrowser('firefox').build();
        driver.get('https://www.youtube.com/');
    });

    afterEach( function() {
       driver.quit();
    })


    it('should go to list and player page and compare views and check both same', async() => {

        var trendingCountFinal;
        var playerCountFinal;

        try{
            await driver.wait(until.elementLocated(By.xpath('//*[@id="endpoint"]')));
            let homePageLinks = await driver.findElements(By.xpath('//*[@id="endpoint"]'));

            var newRefTrending;
            for(link in homePageLinks) {
                newRefTrending = await homePageLinks[link].getAttribute("href");
                if (newRefTrending.includes("trending") && await homePageLinks[link].isDisplayed()) {
                    await homePageLinks[link].click();
                    break;
                }
            }  
        
            await driver.get(await driver.getCurrentUrl());
            await driver.wait(until.elementLocated(By.id('metadata-line')));
            let metaList = await driver.findElements(By.id('metadata-line'));
            let trendingCount = await metaList[0].getText();
            
            trendingCountFinal = numConvert(trendingCount);
            console.log(trendingCountFinal);

            //navigate to player Page
            let videoLinks = await driver.findElements(By.id('thumbnail'));
            await videoLinks[0].click();
            
            await driver.get(await driver.getCurrentUrl());
            await driver.wait(until.elementLocated(By.css('.short-view-count')));
            let player = await driver.findElements(By.css('.short-view-count'));
            let count = await player[0].getAttribute('innerText');
            playerCount = count.split(" ")[0];
            playerCountFinal = numConvert(playerCount);
            console.log(playerCountFinal)

            return expect(trendingCountFinal).to.equal(playerCountFinal);
        }
        
        catch(err){
            assert.fail('expected', 'actual', err)
            return;
        }
    });

    it('should go to a trending video look for comment with replies and check there are the same amount of replies as shown', async() => {

        try{
            await driver.wait(until.elementLocated(By.id('thumbnail')));
            let videoLinks = await driver.findElements(By.id('thumbnail'));
            await videoLinks[0].click();
            
            //navigate to first video player page
            await driver.get(await driver.getCurrentUrl());

            await driver.wait(until.elementLocated(By.xpath('//paper-button[@id="button"][@class="style-scope ytd-button-renderer"]')));
            body = await driver.findElement(By.css('body'));
            await body.sendKeys(Key.PAGE_DOWN);
            await driver.wait(until.elementLocated(By.xpath('//paper-button[@id="button"][@class="style-scope ytd-button-renderer"]')));

            let player = await driver.findElements(By.xpath('//paper-button[@id="button"][@class="style-scope ytd-button-renderer"]'));

            for(x in player){
                var buttonText = await player[x].getText();
                console.log(buttonText);
                if (buttonText.includes("View")&& buttonText.includes("repl")) {
                    await player[x].click();
                    await openRepliesRecursive(driver, 0);
                    break;
                }
            }

            let replyCountShown = parseInt(buttonText.split(" ")[1]);
            let replyCountCounted = await countReplies(driver);
            
            console.log(replyCountCounted);
            console.log(replyCountShown);

            return expect(replyCountShown).to.equal(replyCountCounted);
        }
        
        catch(err){
            assert.fail('expected', 'actual', err)
            return;
        }
    });

    
    it('should go to a trending video and see if the profile pic of the videos uploader is the same as the one in their channel', async() => {

        var imageSrcPlayer;
        var imageUserPage;

        try{
            await driver.wait(until.elementLocated(By.id('thumbnail')));
            let videoLinks = await driver.findElements(By.id('thumbnail'));
            await videoLinks[0].click();
            
            //navigate to first video player page
            await driver.get(await driver.getCurrentUrl());

            body = await driver.findElement(By.css('body'));
            await body.sendKeys(Key.PAGE_DOWN);

            await driver.wait(until.elementLocated(By.css('a.ytd-video-owner-renderer')));

            await driver.wait(async function() {
                let images = await driver.findElements(By.css('a.ytd-video-owner-renderer')); 
                for (image in images) {
                    var src = await images[image].getAttribute("href");
                    var src1 = await images[image].findElements(By.xpath(".//*"));
                    var src2 = await src1[0].findElements(By.xpath(".//*"));
                    imageSrcPlayer = await src2[0].getAttribute("src");

                    if (src != null && (src.includes("user") || src.include("channel"))) {
                        await images[image].click();
                        await driver.get(driver.getCurrentUrl());
                        return true;
                    }
                }
                return false;
            }, 20000);

            await driver.wait(until.elementLocated(By.id('channel-header-container')));
            var avatarElement = await driver.findElements(By.id('avatar'));
            var img = await avatarElement[0].findElements(By.xpath('.//*'));
            imageUserPage = await img[0].getAttribute("src");
            
            return expect(imageUserPage.split("=")[0]).to.equal(imageSrcPlayer.split("=")[0]);
        }
        
        catch(err){
            assert.fail('expected', 'actual', err)
            return;
        }
    });

});



async function openRepliesRecursive(driver, originalCommentCount) {

    await driver.wait(async function() {
        let newReplies = await countReplies(driver);
        return newReplies > originalCommentCount;
    }, 20000);

    body = await driver.findElement(By.css('body'));
    await body.sendKeys(Key.PAGE_DOWN);

    let replies = await driver.findElements(By.xpath('//*[contains(text(), "replies")]'));

    for(x in replies){
        var buttonText = await replies[x].getText();
        if (buttonText.includes("Show more replies")) {
            replyButton = await replies[x].findElements(By.xpath('./..'));
            await driver.executeScript("arguments[0].click();", replyButton[0]);
            await openRepliesRecursive(driver, await countReplies(driver));
            break;
        }
    }

   return;
}

async function countReplies(driver) {
    comments = await driver.findElements(By.css(".ytd-comment-replies-renderer"));
            
    var commentCount = 0;
    for (comment in comments) {
        if(await comments[comment].getAttribute("is-reply") != null && await comments[comment].isDisplayed()) {
            commentCount++;
        }
    }
    console.log("Num Comments: " + commentCount);
    return commentCount;
}

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
