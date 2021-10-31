// Importing thing we need
const cron = require("node-cron");
const axios = require("axios");
const service = require("../service/apiService");
// Calling job
cron.schedule("*/4 * * * *", async() => {
    console.log("running a task every four minute");
    try {
        // Fetching jobs data
        const response = await axios.get(
            `${process.env.HOST}/api/createjobs?token=${process.env.TOKEN}`
        );
        const data = response.data;
        if (data.status == 200) {
            // Parsing jobsData
            const jobs = JSON.parse(data.jobsData);
            // Putting jobsData into array
            const value = [];
            jobs.forEach((item) => {
                value.push([
                    item.companyImage,
                    item.companyName,
                    item.jobPosition,
                    item.jobLocation,
                    item.jobSalary,
                    item.jobTags,
                    item.applyUrl,
                    item.time,
                ]);
            });
            // Calling delete table service
            await service.deleteTable();
            // Calling create table service
            await service.creatTable();
            // Calling insert data into table service
            await service.insertData(value);
        }
    } catch (error) {
        console.error(error);
    }
});