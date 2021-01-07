var express = require('express');
const { promisify } = require("util");
const redis = require("redis");
const client = redis.createClient();
client.on("error", function(error) {
  console.error(error);
});
const redisGet = promisify(client.get).bind(client);
const redisSet = promisify(client.set).bind(client);
const path = require('path');
const fs = require('fs').promises;

var router = express.Router();

router.get('/', async function(req, res) {
  const haveRedis = JSON.parse(await redisGet('imageList'))
  if (haveRedis) {
    res.send({
      message: haveRedis,
      result: 'yes'
    })
  } else {
    const imageList = []
    const files = await fs.readdir('public/images')
  
    files.forEach(e => imageList.push(path.join(`${req.hostname}:8080/images`, e)))
    await redisSet('imageList', JSON.stringify(imageList), 'EX', 50)
    res.send({
      message: imageList,
      result: 'no'
    })
  }
});

module.exports = router;