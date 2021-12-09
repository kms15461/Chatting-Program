const express = require('express');
const router = express.Router();
const { query } = require('../modules/db');
const { verifyMiddleWare } = require('../modules/jwt');
const cryptr = require('../modules/jwt');

router.get('/list', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;

  if (id) {
    const chatList = (await query(`SELECT @uid:=user_id from users where user_id = '${id}';
      WITH b AS (SELECT if(senderid = @uid, receiverid, senderid) AS id, content, sendtime FROM message WHERE senderid = @uid OR receiverid = @uid)
      SELECT u.user_id, u.user_name, b.content, b.sendtime ,u.user_connected FROM b, users u WHERE u.user_connected=1 and sendtime IN (SELECT max(sendtime) FROM b GROUP BY id) and (u.user_id = b.id) ORDER BY b.sendtime ASC;`))[1];
    const chatList2 = (await query(`SELECT @uid:=user_id from users where user_id = '${id}';
      WITH b AS (SELECT if(senderid = @uid, receiverid, senderid) AS id, content, sendtime FROM message WHERE senderid = @uid OR receiverid = @uid)
      SELECT u.user_id, u.user_name, b.content, b.sendtime ,u.user_connected FROM b, users u WHERE u.user_connected=0 and sendtime IN (SELECT max(sendtime) FROM b GROUP BY id) and (u.user_id = b.id) ORDER BY b.sendtime ASC;`))[1];
    chatList.forEach(function(chatlist) { chatlist.content=cryptr.cryption.decrypt(chatlist.content); })
    chatList2.forEach(function(chatlist) { chatlist.content=cryptr.cryption.decrypt(chatlist.content); })
    res.json({
      success: true,
      chatList,
      chatList2
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

router.get('/chatData/:targetId', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { targetId }= req.params;

  if (id) {
    await query(`UPDATE message set noticed=1 where (receiverid = '${id}') and (noticed = 0);`);
    const chatDatas = await query(`SELECT content as message, a.f_i as from_id, a.t_i as to_id, sendtime as created_at, noticed, expire_time
      FROM message, (SELECT f.user_id as f_i, t.user_id as t_i FROM users f, users t WHERE (f.user_id = '${id}' and t.user_id = '${targetId}') OR (t.user_id = '${id}' and f.user_id = '${targetId}')) a 
      WHERE (senderid = a.f_i and receiverid = a.t_i) ORDER BY sendtime ASC;`);

    chatDatas.forEach(function(chatlist) { chatlist.message=cryptr.cryption.decrypt(chatlist.message); });
    const senderloc=await query(`select lat, lon from users where user_id='${id}'`);
    const senderlat=Number(senderloc[0].lat);
    const senderlon=Number(senderloc[0].lon);
    const receiverloc=await query(`select lat, lon from users where user_id='${targetId}';`);
    const receiverlat=Number(receiverloc[0].lat);
    const receiverlon=Number(receiverloc[0].lon);
    Math.radians = function(degrees) {
      return degrees * Math.PI / 180;
    };
    const distance=(6371*Math.acos(Math.cos(Math.radians(senderlat))*Math.cos(Math.radians(receiverlat))*Math.cos(Math.radians(receiverlon) -Math.radians(senderlon))+Math.sin(Math.radians(senderlat))*Math.sin(Math.radians(receiverlat))));
    const far =  distance> 0.5;

    const targetname=await query(`select user_name from users where user_id='${targetId}';`);
    const target_name=targetname[0].user_name;

    res.json({
      success1: true,
      far: far,
      chatDatas,
      target_name
    });
  } else {
    res.json({
      success1: false,
      errorMessage1: 'Authentication is required'
    });
  }
});

router.post('/', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { name, description } = req.body;
  
  if (id) {
    const result = await query(`SELECT * FROM chatrooms where name = '${name}'`);
    if (result.length > 0) {
      res.json({
        success: false,
        errorMessage: 'Duplicate name'
      });
    } else {
      await query(`INSERT INTO chatrooms(name, description) VALUES('${name}', '${description}')`);

      res.json({
        success: true
      });
    }
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});


module.exports = router;
