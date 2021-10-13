// Importing thing we need
const db = require("../db/connection");
// Services

// This service create new table
const creatTable = async() => {
    // Query
    const createTableQuery = `CREATE TABLE jobs (
        id            INTEGER        PRIMARY KEY AUTOINCREMENT,
        company_image VARCHAR (1000),
        company_name  VARCHAR (1000),
        job_position  VARCHAR (1000),
        job_location  VARCHAR (1000),
        job_salary    VARCHAR (1000),
        job_tags      VARCHAR (1000),
        apply_url     VARCHAR (1000),
        time          VARCHAR (1000) 
    );`;
    // Executing query
    db.serialize(function() {
        db.run(createTableQuery, function(err) {
            if (err) throw err;
            return "Created";
        });
    });
};
// This service delete table
const deleteTable = async() => {
    // Query
    const deleteTableQuery = "DROP TABLE IF EXISTS jobs;";
    // Executing query
    db.serialize(function() {
        db.run(deleteTableQuery, function(err) {
            if (err) throw err;
            return "Deleted";
        });
    });
};
// This service insert data into table
const insertData = async(value) => {
    // Creating placeholders
    let placeHolders = value.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    // Query
    let insertDataQuery =
        "INSERT INTO jobs (company_image, company_name, job_position, job_location,job_salary,job_tags,apply_url,time) VALUES " +
        placeHolders;
    let jobs = [];
    value.forEach((arr) => {
        arr.forEach((item) => {
            jobs.push(item);
        });
    });
    // Executing query
    db.serialize(function() {
        db.run(insertDataQuery, jobs, function(err) {
            if (err) throw err;
            return "Added";
        });
    });
};

// This service get data from db
const getJobs = async() => {
    const getDataQuery = "SELECT * FROM jobs";
    // Executing query
    const data = await new Promise((resolve, reject) => {
        db.all(getDataQuery, function(err, row) {
            if (err) throw err;
            resolve(row);
        });
    });
    return data;
};
// Exporting services
module.exports = {
    creatTable,
    deleteTable,
    insertData,
    getJobs,
};