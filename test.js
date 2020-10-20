const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const keys = require('./keys.json');

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key, ['https://www.googleapis.com/auth/spreadsheets']
);

async function grab() {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://app.leadfuze.com/signin');
    await page.type('input[name=email]', 'james@shalegraal.com');
    await page.type('input[name=pass]', 'Fullmoosepub88*');

    await page.waitFor(2000);
    await page.click('button[type=submit]');

    await page.waitFor(3000);

    await page.goto('https://app.leadfuze.com/lead-search/saved-searches');
    await page.waitFor(3000);
    await page.click('.result-item__show-results-link p');

    await page.waitFor(5000);

    //const aoaNames = name.map(l => [l]);

    //const aoaTitles = title.map(l => [l]);

    // console.log(outdata);
    var nameResult = [];
    var titleResult = [];
    var companyResult = [];
    var websiteResult = [];
    var industryResult = [];
    var locationResult = [];

    const pages = 1032;
    for (let item = 1; item < pages; item++) {
        console.log('Parsing page: ' + item);
        await page.waitFor(3000);
        const name = await page.$$eval('.result-item__name', names => names.map(name => name.textContent));
        const title = await page.$$eval('.result-item__education', titles => titles.map(title => title.textContent));
        const company = await page.$$eval('.result-item__company a', companies => companies.map(company => company.textContent));
        const website = await page.$$eval('.result-item__company a', websites => websites.map(website => website.href));
        const industry = await page.$$eval('.result-item__position', industries => industries.map(industry => industry.textContent));
        //const size = await page.$$eval('.result-header__title', sizes => sizes.map(size => size.textContent));
        const location = await page.$$eval('.result-item__location', locations => locations.map(location => location.textContent));

        await page.waitFor(5000);
        await page.click('.pagination__arr.next');
        //result.push(name);
        //console.log(result);
        Array.prototype.push.apply(nameResult, name);
        Array.prototype.push.apply(titleResult, title);
        Array.prototype.push.apply(companyResult, company);
        Array.prototype.push.apply(websiteResult, website);
        Array.prototype.push.apply(industryResult, industry);
        Array.prototype.push.apply(locationResult, location);
    }
    /*
        console.log(nameResult);
        console.log(titleResult);
        console.log(companyResult);
        console.log(websiteResult);
        console.log(industryResult);
        console.log(locationResult);
        */
    const aoaName = nameResult.map(l => [l]);
    const aoaTitle = titleResult.map(l => [l]);
    const aoaCompany = companyResult.map(l => [l]);
    const aoaWebsite = websiteResult.map(l => [l]);
    const aoaIndustry = industryResult.map(l => [l]);
    const aoaLocation = locationResult.map(l => [l]);

    return [aoaName, aoaTitle, aoaCompany, aoaWebsite, aoaIndustry, aoaLocation];
};


gsrun(client);

async function gsrun(cl) {
    const gsapi = google.sheets({ version: 'v4', auth: cl });

    const allData = await grab();
    console.log(allData);

    const updateName = {
        spreadsheetId: '1AhAUJ7UoNTy_OL8eIEl0CFZPSpU5EkmkbC6oYZJxIXU',
        range: 'A2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: allData[0] }
    };
    const updateTitle = {
        spreadsheetId: '1AhAUJ7UoNTy_OL8eIEl0CFZPSpU5EkmkbC6oYZJxIXU',
        range: 'B2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: allData[1] }
    };
    const updateCompany = {
        spreadsheetId: '1AhAUJ7UoNTy_OL8eIEl0CFZPSpU5EkmkbC6oYZJxIXU',
        range: 'C2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: allData[2] }
    };
    const updateWebsite = {
        spreadsheetId: '1AhAUJ7UoNTy_OL8eIEl0CFZPSpU5EkmkbC6oYZJxIXU',
        range: 'D2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: allData[3] }
    };
    const updateIndustry = {
        spreadsheetId: '1AhAUJ7UoNTy_OL8eIEl0CFZPSpU5EkmkbC6oYZJxIXU',
        range: 'E2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: allData[4] }
    };
    const updateLocation = {
        spreadsheetId: '1AhAUJ7UoNTy_OL8eIEl0CFZPSpU5EkmkbC6oYZJxIXU',
        range: 'F2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: allData[5] }
    };

    await gsapi.spreadsheets.values.update(updateName);
    await gsapi.spreadsheets.values.update(updateTitle);
    await gsapi.spreadsheets.values.update(updateCompany);
    await gsapi.spreadsheets.values.update(updateWebsite);
    await gsapi.spreadsheets.values.update(updateIndustry);
    await gsapi.spreadsheets.values.update(updateLocation);
    // await gsapi.spreadsheets.values.update(updateOptions2);

};