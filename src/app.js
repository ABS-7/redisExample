const express = require('express');
const redis = require('redis');

let app = express();

app.set("views", "src/views");
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    app.get('redisConnectionObject').hgetall('colors', (err, reply) => {
        //console.log(reply, err);
        const data = {
            red: reply.red,
            yellow: reply.yellow,
            green: reply.green,
            blue: reply.blue
        }
        res.render('home', { data: data });
    });
});

app.get('/color/:colorName', (req, res) => {
    const client = app.get('redisConnectionObject');
    client.hincrby('colors', req.params.colorName, 1, function (err, reply) {
        //console.log('>', reply, err);
        client.hgetall('colors', (err, reply) => {
            //console.log('=>>>', reply, err);
            const data = {
                red: reply.red,
                yellow: reply.yellow,
                green: reply.green,
                blue: reply.blue
            }
            res.render('home', { data: data });
        });
    });
})

const server = app.listen(3000, (error) => {
    if (error) console.log(error);
    else console.log("server is listening on " + server.address().address + '/' + server.address().port + '...');

    const redisURL = 'redis://127.0.0.1:6379';
    const client = redis.createClient(redisURL);
    app.set('redisConnectionObject', client);

    client.hmset('colors', {
        'red': 0,
        'yellow': 0,
        'green': 0,
        'blue': 0
    });
});