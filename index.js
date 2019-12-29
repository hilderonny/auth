var express = require('express');
var jsonwebtoken = require('jsonwebtoken');
var bcryptjs = require('bcryptjs');
var fs = require('fs');

var _tokensecret, _db;

async function login(request, response) {
    if (!request.body.username) return response.status(400).json({ error: 'Username required' });
    if (!request.body.password) return response.status(400).json({ error: 'Password required' });
    var existingusers = await _db.query('select id, username, password from user where username = ?;', [request.body.username]);
    if (existingusers.length < 1) return response.status(403).json({ error: 'Login failed' });
    var user = existingusers[0];
    if (!bcryptjs.compareSync(request.body.password, user.password)) return response.status(403).json({ error: 'Login failed' });
    var result = {
        id: user.id,
        token: jsonwebtoken.sign({
            id: user.id,
            time: Date.now()
        }, _tokensecret, {
            expiresIn: '24h'
        }),
        username: user.username
    };
    response.json(result);
}

async function register(request, response) {
    if (!request.body.username) return response.status(400).json({ error: 'Username required' });
    if (!request.body.password) return response.status(400).json({ error: 'Password required' });
    var existingusers = await _db.query('select username from user where username = ?;', [request.body.username]);
    if (existingusers.length > 0) return response.status(400).json({ error: 'Username already taken' });
    var id = Date.now().toString();
    await _db.query('insert into user (id, username, password) values (?, ?, ?);', [
        id,
        request.body.username,
        bcryptjs.hashSync(request.body.password)
    ]);
    var createduser = {
        id: id,
        token: jsonwebtoken.sign({
            id: id,
            time: Date.now()
        }, _tokensecret, {
            expiresIn: '24h'
        }),
        username: request.body.username
    };
    response.json(createduser);
}

var auth = function (request, response, next) {
    const token = request.header('x-access-token');
    if (!token) return response.status(401).json({ error: 'Token is missing' });
    jsonwebtoken.verify(token, _tokensecret, async function (error, tokenuser) {
        if (error) return response.status(401).json({ error: 'Token cannot be validated' });
        var existingusers = await _db.query('select id, username from user where id = ?;', [tokenuser.id]);
        if (existingusers.length < 1) return response.status(401).json({ error: 'User not found' });
        request.user = existingusers[0];
        next();
    });
};

auth.init = async function(app, db, tokensecret) {

    _tokensecret = tokensecret;
    _db = db;

    var schema = JSON.parse(fs.readFileSync('./dbschema.json'));
    await _db.init(schema);

    app.post('/api/auth/login', login);
    app.post('/api/auth/register', register);

    app.use('/static/auth', express.static(__dirname + '/public'));

};

module.exports = auth;