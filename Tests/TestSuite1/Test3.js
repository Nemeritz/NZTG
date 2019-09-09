const {By, Key} = require('selenium-webdriver');
var numeral = require('numeral');
const { expect, assert} = require('chai');
const {driver, waitAndFind} = require('../Helper.js');

it('should go to a trending video and see if the profile pic of the videos uploader is the same as the one in their channel', async() => {

    var imageSrcPlayer;
    var imageUserPage;

    try{
        let videoLinks = await waitAndFind(driver(), "id", "thumbnail");
        await videoLinks[0].click();
        
        //navigate to first video player page
        await driver().get(await driver().getCurrentUrl());

        body = await driver().findElement(By.css('body'));
        await body.sendKeys(Key.PAGE_DOWN);

        //find user profile of uploader of video
        await driver().wait(async function() {
            let images = await driver().findElements(By.css('a.ytd-video-owner-renderer')); 
            for (image in images) {
                var channelUrl = await images[image].getAttribute("href");
                var srcs = await images[image].findElements(By.xpath(".//yt-img-shadow//img"));
                imageSrcPlayer = await srcs[0].getAttribute("src");

                if (channelUrl != null && (channelUrl.includes("user") || channelUrl.includes("channel"))) {
                    console.log(channelUrl);
                    await images[image].click();
                    await driver().get(driver().getCurrentUrl());
                    return true;
                }
            }
            return false;
        }, 20000);

        //fetch image src from user/channel page
        let avatarElement = await waitAndFind(driver(), "id", "avatar");
        var img = await avatarElement[0].findElements(By.xpath('.//*'));
        imageUserPage = await img[0].getAttribute("src");
        
        return expect(imageUserPage.split("=")[0]).to.equal(imageSrcPlayer.split("=")[0]);
    }
    
    catch(err){
        assert.fail('expected', 'actual', err)
        return;
    }
});