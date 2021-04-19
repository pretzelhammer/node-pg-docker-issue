const { Pool } = require('pg');

const connectionString = 'postgres://postgres@localhost:5432/postgres';

const pool = new Pool({
    connectionString,
});

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
    pool.end();
});
