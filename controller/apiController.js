// Importing thing we need
const puppeteer = require("puppeteer");
const jwt = require("jsonwebtoken");
const { parse } = require("node-html-parser");
const service = require("../service/apiService");

// Functions

//   This function extract tags
const getTags = (data) => {
    const tagAraay = parse(data);
    const tags = [];
    for (let i = 0; i < tagAraay.querySelectorAll(".tag").length; i++) {
        tags.push(tagAraay.querySelectorAll(".tag")[i].textContent);
    }
    return tags;
};
// This function extract location
const getLocation = (data) => {
    const location = parse(data);
    try {
        if (
            location.querySelector(".location").innerHTML != null &&
            location.querySelector(".location").innerHTML != "null"
        ) {
            return location.querySelector(".location").innerHTML;
        }
    } catch (e) {
        return "N / A";
    }
};
// This function extract salary
const getSalary = (data) => {
    const salary = parse(data);
    try {
        if (
            salary.querySelector(".location").innerHTML != null &&
            salary.querySelector(".location").innerHTML != "null"
        ) {
            return salary.querySelectorAll(".location")[1].innerHTML;
        }
    } catch (e) {
        return "N / A";
    }
};
// This function extract URL
const getUrl = (data) => {
    const url = parse(data);
    try {
        if (url.firstChild.firstChild.attributes.href) {
            return `https://remoteok.io${url.firstChild.firstChild.attributes.href}`;
        } else {
            return "N / A";
        }
    } catch (e) {
        return "N / A";
    }
};
// This function extract time
const getTime = (data) => {
    const time = parse(data);
    try {
        if (time.firstChild.firstChild.firstChild.getAttribute("datetime")) {
            return time.firstChild.firstChild.firstChild.getAttribute("datetime");
        } else {
            return "N / A";
        }
    } catch (e) {
        return "N / A";
    }
};

// Controllers

// This controller send HTML to client
const sendHTML = async(req, res) => {
    res.send("Welcome to Get Remote Job");
};
// This controller scraped jobs data from https://remoteok.io/ and send to client
const createJobs = async(req, res) => {
    // Extracting token
    const token = req.query.token;
    // Verifying token
    jwt.verify(
        token,
        process.env.PASSWORD,
        async function(err, decoded) {
            if (err) return;
            else {
                // Lanuching browser
                const browser = await puppeteer
                    .launch({
                        headless: true,
                        args: [
                            "--window-size=1920,1080",
                            "--no-sandbox",
                            "--disable-setuid-sandbox",
                        ],
                        defaultViewport: null,
                    })
                    .catch(async(e) => {
                        res.send({
                            status: 204,
                            work: "Incompelete",
                        });
                    });
                // Trying to generate jobs data
                try {
                    // Job data array
                    const jobsData = [];
                    // Opening new page
                    const page = await browser.newPage();
                    // Going to given URL
                    await page.goto("https://remoteok.io/");
                    // Wait for selector
                    page.waitForSelector(".job").then(async() => {
                        // Getting data
                        const data = await page.evaluate(() =>
                            Array.from(
                                document.querySelectorAll(".job"),
                                (element) => element.innerHTML
                            )
                        );
                        //   Insrting data into jobsData
                        data.forEach((element) => {
                            const root = parse(element);
                            if (
                                root.querySelector(".logo").getAttribute("data-src") !=
                                undefined &&
                                root.querySelector("[itemprop=name]").textContent != null &&
                                root.querySelector("[itemprop=title]").textContent != null &&
                                root.querySelector(".source").innerHTML
                            ) {
                                jobsData.push({
                                    companyImage: root
                                        .querySelector(".logo")
                                        .getAttribute("data-src"),
                                    companyName: root.querySelector("[itemprop=name]").textContent,
                                    jobPosition: root.querySelector("[itemprop=title]").textContent,
                                    jobLocation: getLocation(
                                        root.querySelector(".company_and_position").innerHTML
                                    ),
                                    jobSalary: getSalary(
                                        root.querySelector(".company_and_position").innerHTML
                                    ),
                                    jobTags: getTags(root.querySelector(".tags").innerHTML),
                                    applyUrl: getUrl(root.querySelector(".source")),
                                    time: getTime(root.querySelector(".time")),
                                });
                            }
                        });
                        browser.close();
                        res.send({
                            status: 200,
                            work: "Done",
                            jobsData: JSON.stringify(jobsData),
                        });
                    });
                } catch (e) {
                    browser.close();
                    res.send({
                        status: 204,
                        work: "Incompelete",
                    });
                }
            }
        }
    );
};
// This controller send data to client
const getJobs = async(req, res) => {
    // Calling get data service
    const data = await service.getJobs();
    if (data) {
        res.send({
            status: 200,
            jobsList: data,
        });
    }
};
// Exporting functions
module.exports = { sendHTML, createJobs, getJobs };