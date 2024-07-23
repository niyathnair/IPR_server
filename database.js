const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: '1234',
    host: 'localhost',
    port: 5432,
    database: 'ipr_login_sys',
});

const createTbQry = `
CREATE TABLE IF NOT EXISTS register (
    user_id serial PRIMARY KEY,
    handle VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    task_id serial PRIMARY KEY,
    handle VARCHAR(50) REFERENCES register(handle),
    name VARCHAR(100) NOT NULL,
    briefDescription TEXT NOT NULL,
    detailedDescription TEXT NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    students INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS managers (
    employee_id SERIAL PRIMARY KEY,
    handle VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

`;

pool.query(createTbQry)
    .then(res => console.log("Tables are successfully created"))
    .catch(err => console.error(err));

module.exports = pool;
