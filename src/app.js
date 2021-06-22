const express = require('express');
const redis = require('redis');
const http = require('http');
const socketIO = require('socket.io');
//const redisAdp = require('socket.io-redis');

let app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer);
//io.adapter(redisAdp({ host: 'localhost', port: 6379 }));

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
        res.render('home2', { data: data });
    });
});

// app.get('/color/:colorName', (req, res) => {
//     const client = app.get('redisConnectionObject');
//     client.hincrby('colors', req.params.colorName, 1, function (err, reply) {
//         //console.log('>', reply, err);
//         client.hgetall('colors', (err, reply) => {
//             //console.log('=>>>', reply, err);
//             const data = {
//                 red: reply.red,
//                 yellow: reply.yellow,
//                 green: reply.green,
//                 blue: reply.blue
//             }
//             res.render('home', { data: data });
//         });
//     });
// })

io.on('connection', async (socket) => {
    console.log("new User with socket connection is connected ===>: ", socket.id);

    const count = io.engine.clientsCount;
    const client = app.get('redisConnectionObject');

    client.set("onlineUser", count);

    io.sockets.emit('fetchUserCounts', count);
    socket.emit('getUserID', socket.id);

    client.hgetall('colors', (err, reply) => {
        const data = reply.red + "/" + reply.yellow + "/" + reply.green + "/" + reply.blue;
        io.sockets.emit('fetchCounts', data);
    });

    socket.on('incCount', (colorName) => {
        client.hincrby('colors', colorName, 1, function (err, reply) {
            client.hgetall('colors', (err, reply) => {
                const data = reply.red + "/" + reply.yellow + "/" + reply.green + "/" + reply.blue;
                io.sockets.emit('fetchCounts', data);
            });
        });
    });
    socket.on('disconnect', () => console.log(socket.id + " disconnected"));

})



const server = httpServer.listen(3000, (error) => {
    if (error) console.log(error);
    else console.log("server is listening on " + server.address().address + '/' + server.address().port + '...');

    const redisURL = 'redis://127.0.0.1:6379';
    const client = redis.createClient(redisURL);
    app.set('redisConnectionObject', client);

    // client.hmset('colors', {
    //     'red': 0,
    //     'yellow': 0,
    //     'green': 0,
    //     'blue': 0
    // });
});

