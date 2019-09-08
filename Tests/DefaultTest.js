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
            //find trending button and click
            let homePageLinks = await waitAndFind(driver, "xpath", '//*[@id="endpoint"]');

            var newRefTrending;
            for(link in homePageLinks) {
                newRefTrending = await homePageLinks[link].getAttribute("href");
                if (newRefTrending.includes("trending") && await homePageLinks[link].isDisplayed()) {
                    await homePageLinks[link].click();
                    break;
                }
            }  
        
            //find No1 trending video and get view count
            await driver.get(await driver.getCurrentUrl());

            let metaList = await waitAndFind(driver, "id", "metadata-line");
            let trendingCount = await metaList[0].getText();
            
            trendingCountFinal = numConvert(trendingCount);

            //navigate to player Page
            let videoLinks = await driver.findElements(By.id('thumbnail'));
            await videoLinks[0].click();
            await driver.get(await driver.getCurrentUrl());

            //find count from player page
            let player = await waitAndFind(driver, "css", ".short-view-count");
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

    it('should go to a trending video look for comment with replies and check there are the same amount of replies as shown', async() => {

        try{
            let videoLinks = await waitAndFind(driver, "id", "thumbnail");
            await videoLinks[0].click();
            
            //navigate to first video player page
            await driver.get(await driver.getCurrentUrl());

            //wait for some of page to load and scroll down
            await driver.wait(until.elementLocated(By.xpath('//paper-button[@id="button"][@class="style-scope ytd-button-renderer"]')));
            body = await driver.findElement(By.css('body'));
            await body.sendKeys(Key.PAGE_DOWN);

            //Click View xx Repl
            let player = await waitAndFind(driver, "xpath", '//paper-button[@id="button"][@class="style-scope ytd-button-renderer"]');

            for(x in player){
                var buttonText = await player[x].getText();
                if (buttonText.includes("View")&& buttonText.includes("repl")) {
                    await player[x].click();
                    //click open all 'view more replies'
                    await openRepliesRecursive(driver, 0);
                    break;
                }
            }

            let replyCountShown = parseInt(buttonText.split(" ")[1]);
            let replyCountCounted = await countReplies(driver);

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
            let videoLinks = await waitAndFind(driver, "id", "thumbnail");
            await videoLinks[0].click();
            
            //navigate to first video player page
            await driver.get(await driver.getCurrentUrl());

            body = await driver.findElement(By.css('body'));
            await body.sendKeys(Key.PAGE_DOWN);

            //find user profile of uploader of video
            await driver.wait(async function() {
                let images = await driver.findElements(By.css('a.ytd-video-owner-renderer')); 
                for (image in images) {
                    var channelUrl = await images[image].getAttribute("href");
                    var srcs = await images[image].findElements(By.xpath(".//yt-img-shadow//img"));
                    imageSrcPlayer = await srcs[0].getAttribute("src");

                    if (channelUrl != null && (channelUrl.includes("user") || channelUrl.includes("channel"))) {
                        await images[image].click();
                        await driver.get(driver.getCurrentUrl());
                        return true;
                    }
                }
                return false;
            }, 20000);

            //fetch image src from user/channel page
            let avatarElement = await waitAndFind(driver, "id", "avatar");
            var img = await avatarElement[0].findElements(By.xpath('.//*'));
            imageUserPage = await img[0].getAttribute("src");
            
            return expect(imageUserPage.split("=")[0]).to.equal(imageSrcPlayer.split("=")[0]);
        }
        
        catch(err){
            assert.fail('expected', 'actual', err)
            return;
        }
    });


    it('search for youtube and sort by sort by view count and first video show despacito', async() => {


        try{
            //search with keyword being "youtube"
            let searchBox = await waitAndFind(driver, "xpath", '//input[@id="search"]');
            await searchBox[0].sendKeys("Youtube", Key.ENTER);

            //click filter and filter by view count
            let filterButton = await waitAndFind(driver, "xpath", '//yt-formatted-string[contains(text(), "Filter")]');
            await filterButton[0].click();

            var previousUrl = await driver.getCurrentUrl();

            ViewFilterButton = await waitAndFind(driver, "xpath", '//yt-formatted-string[contains(text(), "View count")]');
            await ViewFilterButton[0].click();

            //wait for new search filter to apply and load
            await driver.wait(async function() {
                let newUrl = await driver.getCurrentUrl();
                return newUrl != previousUrl;
            }, 20000);

            await driver.get(driver.getCurrentUrl());

            let videos = await waitAndFind(driver, "id", "video-title");
            let topVideo = await videos[0].getText();
            
            expect(topVideo).to.equal("Luis Fonsi - Despacito ft. Daddy Yankee");
        }
        
        catch(err){
            assert.fail('expected', 'actual', err)
            return;
        }
    });
});


async function waitAndFind(driver, method, arg) {
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
}

async function openRepliesRecursive(driver, originalCommentCount) {

    await driver.wait(async function() {
        let newReplies = await countReplies(driver);
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
