

const mysql = require('mysql');
const connection = mysql.createPool({
    host: 'localhost',
    port    : pw,
    user: 'root',
    password: 'H331Ke', // 이전에 입력했던 비밀번호
    database: 'test', // 이전에 입력했던 데이터베이스 명
    multipleStatements: true,
    connectionLimit: 1000,
});

exports.query = query => new Promise((resolve, reject) => {
    connection.getConnection((err, connection) => {
        if (err) {
            return reject(err);
        }

        return connection.query(query, (err2, rows) => {
            connection.release();
            if (err2) {
                return reject(err2);
            }
            return resolve(rows);
        })
    });
});