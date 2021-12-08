const express = require('express');
const router = express.Router();
const { query } = require('../modules/db');
const { sign, verifyMiddleWare } = require('../modules/jwt');
const bcrypt = require('bcryptjs');

router.get('/onlinefriend', verifyMiddleWare, async(req, res, next) => {
  const { id } = req.decoded;
  const on_friend = await query(`SELECT * from users,friends where user_connected = 1 and user_id=followee and follower = '${id}' ORDER BY user_name ASC;`);
  res.json({on_friend})
});
router.get('/offlinefriend', verifyMiddleWare, async(req, res, next) => {
  const { id } = req.decoded;
  const off_friend = await query(`SELECT * from users,friends where user_connected = 0 and user_id=followee and follower = '${id}' ORDER BY user_name DESC;`);
  res.json({off_friend})
});
router.post('/signIn', async (req, res, next) => {
  console.log("------------ENTER signin-----------------");
  const { id, password } = req.body;
  const queryResult = await query(`SELECT * from users where user_id = '${id}';`);
  console.log(queryResult);
  if (queryResult.length > 0 && bcrypt.compareSync(password,queryResult[0].user_pw)) {
    await query(`UPDATE users SET user_connected = 1 WHERE user_id = '${id}';`);
    const jwt = sign({
      id,
      name: queryResult[0].user_name,
      connected: queryResult[0].user_connected
    });
    res.cookie('token', jwt, {
      httpOnly: true,
      expires: new Date( Date.now() + 60 * 60 * 1000 * 24 * 7) // 7일 후 만료
    }).json({
      success: true,
      id,
      name: queryResult[0].user_name,
      connected: queryResult[0].user_connected
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Incorrect id or password'
    });
  }
});

router.get('/whoAmI', verifyMiddleWare, async (req, res, next) => {
  const { id, name , connected} = req.decoded;

  if (id) {
    res.json({
      success: true,
      id,
      name,
      connected
    });
  } else {
    res.json({
      success: false,
      errorMesage: 'Authentication is required'
    });
  }
});

router.get('/friends', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  console.log('enter friends');
  if (id) {
    const friends = (await query(`SELECT user_id, user_name, user_connected FROM users where user_id in (SELECT followee FROM friends WHERE follower in (SELECT user_id FROM users WHERE user_id = '${id}'))`));
    res.json({
      success: true,
      friends
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

router.post('/addFriends', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { friend_id } = req.body;
  console.log("접속id: ", id);
  console.log("친구id: ", friend_id);
  if (id) {
    if (friend_id) {
      const friends_array = await query(`SELECT * FROM friends WHERE (follower, 
        followee) in (SELECT u1.user_id, u2.user_id from users u1, users u2 WHERE u1.user_id = '${id}' and u2.user_id = '${friend_id}');`);
      console.log('쿼리결과: ', friends_array)
      if (friends_array.length > 0) {
        res.json({
          success: false,
          errorMessage: 'already exists!'
        }); 
      } else {
        await query(`INSERT INTO friends(follower, followee) (SELECT u1.user_id, u2.user_id from users u1, users u2 WHERE u1.user_id = '${id}' and u2.user_id = '${friend_id}');`);

        res.json({
          success: true,
        });
      }
    } else {
      res.json({
        success: false,
        errorMessage: 'no friend_id'
      });
    }
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

router.post('/removeFriends', verifyMiddleWare, async (req, res, next) => {
  console.log('enter remove Friend!');
  const { id } = req.decoded;
  console.log(id);
  const { friend_id } = req.body;
  console.log(friend_id);
  if (id) {
    if (friend_id) {
      const friends_array = await query(`SELECT * FROM friends WHERE (follower, 
        followee) in (SELECT u1.user_id, u2.user_id from users u1, users u2 WHERE u1.user_id = '${id}' and u2.user_id = '${friend_id}');`);
      console.log(friends_array);
      if (friends_array.length === 0) {
        res.json({
          success: false,
          errorMessage: 'Not exists id!'
        });
      } else {
        await query(`DELETE FROM friends where (follower, followee) in (SELECT u1.user_id, u2.user_id from users u1, users u2 WHERE u1.user_id = '${id}' and u2.user_id = '${friend_id}');`);

        res.json({
          success: true,
        });
      }
    } else {
      res.json({
        success: false,
        errorMessage: 'no friend_id'
      });
    }
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

router.get('/signOut', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  await query(`UPDATE users SET user_connected = 0 WHERE user_id = '${id}'`);

  if (id) {
    res.clearCookie('token').json({
      success: true
    })
  } else {
    res.json({
      success: false,
      errorMessage: 'Jwt not exists'
    })
  }
});

router.post('/signUp', async (req, res, next) => {
  let { id, password, name, user_type} = req.body;
  const id_regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}$/; // 4~20자리의 문자 및 숫자 1개 이상씩 사용한 정규식
  const name_regex = /^[가-힣a-zA-z]{3,20}$/;

  // 아이디 유효성 검사 통과 x
  if (!id_regex.test(id)) {
    res.json({
      success: false,
      errorMessage: 'Unvalid id'
    });
  } else if (!name_regex.test(name)) {
    res.json({
      success: false,
      errorMessage: 'Unvalid name'
    });
  } else { // 통과 O
    // 중복 확인
    const queryResult = await query(`SELECT * from users where user_id = '${id}'`);
    if (queryResult.length > 0) {
      res.json({
        success: false,
        errorMessage: 'Duplicate id'
      });
    } else {
      usertypenum = 0;
      if (user_type === "general") {
        usertypenum = 1;
      }
      else if (user_type === "student") {
        usertypenum = 2;
      }
      else if (user_type === "teacher") {
        usertypenum = 3;
      }
      else if (user_type === "company") {
        usertypenum = 4;
      }
      password=bcrypt.hashSync(password);
      await query(`INSERT INTO users(user_id, user_pw, user_name, user_connected, user_type) VALUES('${id}', '${password}', '${name}', 0, '${usertypenum}')`);

      res.json({
        success: true,
        name: name,
        connected:1
      });
    }
  }
});
router.get('/onlineuser', verifyMiddleWare, async(req, res, next) => {
  const { id } = req.decoded;
  const queryResult = await query(`SELECT * from users where user_connected = 1 and user_id <> '${id}'`);
  console.log(queryResult[4]);
  res.json({queryResult})
});

router.get('/onlineuser2', verifyMiddleWare, async(req, res, next) => {
  const { id } = req.decoded;
  const queryResult2 = await query(`SELECT * from users where user_connected = 0 and user_id <> '${id}'`);
  res.json({queryResult2})
});


router.post('/idDuplicateCheck', async (req, res, next) => {
  const { id, password, name, usertype } = req.body;
  const queryResult = await query(`SELECT * from users where user_id = '${id}'`);
  if (queryResult.length > 0) {
    res.json({
      success: false,
      errorMessage: '중복된 아이디입니다.'
    });
  } 
  else {
    res.json({
      success: true
    });
  }
});

router.get('/SetProfile', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  
  const queryResult = await query(`SELECT * from users where user_id = '${id}'`);
  res.json({
    queryResult
  });


});

router.post('/EditStatusMsg', verifyMiddleWare, async (req, res, next) => {
  console.log(req.body);

  const { id } = req.decoded;
  const { statusmsg } = req.body;
  await query(`UPDATE users SET user_status='${statusmsg}' where user_id='${id}'`);
  const name_regex = /^.{0,20}$/;
  if (!name_regex.test(statusmsg)) {
    res.json({
      success: false,
      errorMessage: '상태메세지는 20자 이하여야합니다'
    });
  }
  else{
    await query(`UPDATE users SET user_status='${statusmsg}' where user_id='${id}'`);
    res.json({
      success: true
    });
  }
});


router.get('/withdrawal', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  
  await query(`DELETE from users where user_id='${id}' `);
  res.json({
    success: true
  });
});

router.get('/place', verifyMiddleWare, async(req, res, next) => {
  const { id } = req.decoded;
  console.log(id);
  const queryResult = await query(`SELECT distinct building, floor, SSID from users where not building is null and not floor is null and not SSID is null order by building asc, floor asc, SSID asc;`);
  res.json({queryResult})
});

router.post('/uploadFile',verifyMiddleWare, async(req, res, next) => {
  console.log("~~~~~~~~~~~~~~~~~~`");
  const { id } = req.decoded;
  data=req.body.csvcontents;
  
  const lat=data.split(",")[0];
  const lon=data.split(",")[1];
  const building=data.split(",")[2];
  const floor=data.split(",")[3];
  const SSID=data.split(",")[4];
  const IP=data.split(",")[5];
  await query(`UPDATE users SET lat='${lat}', lon='${lon}', building='${building}', floor='${floor}', SSID='${SSID}', IP='${IP}' where user_id='${id}'`);
  console.log("query finish");
});


router.post('/searchfriend', verifyMiddleWare, async (req, res, next) => {
  console.log("========search friend======");
  const { findstring }=req.body;
  const { id } = req.decoded;
  console.log(findstring);
  const newstring=decodeURI(findstring);
  console.log(newstring);
  const searchresult = await query(`SELECT DISTINCT user_id, user_name, user_status FROM users WHERE user_id <> '${id}' and (user_id LIKE '%${newstring}%' OR user_name LIKE '%${newstring}%') ORDER BY user_name ASC;`);
  console.log(searchresult);
  res.json({
    success : true,
    searchresult: searchresult,
    newstring: newstring
  });
}); 


router.post('/encoding', verifyMiddleWare, async (req, res, next) => {
  console.log("========encoding======");
  const { para }=req.body;
  console.log(para[4]);
  const newpara=decodeURI(para[4]);
  res.json({
    newpara: newpara
  });
}); 


router.get('/nearme1', verifyMiddleWare, async(req, res, next) => {
  const { id } = req.decoded;
  const queryResult3 = await query(`SELECT A.user_id, A.user_name, A.user_status, A.user_type, (6371*acos(cos(radians(A.lat))*cos(radians(B.lat))*cos(radians(B.lon) -radians(A.lon))+sin(radians(A.lat))*sin(radians(B.lat)))) as distance FROM users A, users B WHERE B.user_id in (SELECT user_id from users where user_id = '${id}') and A.user_id in (SELECT user_id from users where user_connected = 1 and user_id <> '${id}') HAVING distance<0.5 ORDER BY distance`);
  console.log("——————ENTER surround————————");
  console.log(queryResult3)
  console.log("——————QUIT surround————————");
  res.json({queryResult3})
});

router.get('/nearme2', verifyMiddleWare, async(req, res, next) => {
  const { id } = req.decoded;
  const queryResult4 = await query(`SELECT A.user_id, A.user_name, A.user_status, A.user_type, (6371*acos(cos(radians(A.lat))*cos(radians(B.lat))*cos(radians(B.lon) -radians(A.lon))+sin(radians(A.lat))*sin(radians(B.lat)))) as distance FROM users A, users B WHERE B.user_id in (SELECT user_id from users where user_id = '${id}') and A.user_id in (SELECT user_id from users where user_connected = 0 and user_id <> '${id}') HAVING distance<0.5 ORDER BY distance`);
  console.log("——————ENTER surround————————");
  console.log(queryResult4)
  console.log("——————QUIT surround————————");
  res.json({queryResult4})
});


module.exports = router;


