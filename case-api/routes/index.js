var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var request = require('request');
var settoken = require('../public/javascripts/token_vertify.js');
var ObjectId = require('mongodb').ObjectID;
var rsj = require('rsj');//RSS as JSON when use it we must (npm install rsj) first

// 插入数据源
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("case");
//   var myobj = { title: "Law Street Media", url: "https://lawstreetmedia.com/categories/insights/feed/" };
//   dbo.collection("RssSource").insertOne(myobj, function(err, res) {
//       if (err) throw err;
//       console.log("文档插入成功");
//       db.close();
//   });
// });

// module.exports = router;

// 定时更新数据
async function dataOperate() {
  var conn = null;
  try {
    conn = await MongoClient.connect(url);
    const textRssSource = conn.db("case").collection("RssSource");
    const rssSourceResult = await textRssSource.find().toArray();
    var time;
    rssSourceResult.forEach(e => {
      request(e.url, (err, response, body) => {
        // console.log(response);
        var unit = body.substring(body.indexOf("iod>") + 4, body.indexOf("</sy:updatePeriod>")).replace(/\s+/g, "");
        var num = Number(body.substring(body.indexOf("ncy>") + 4, body.indexOf("</sy:updateFrequency>")).replace(/\s+/g, ""));
        switch (unit) {
          case 'hourly': time = 60 * 60 * 1000 * num; break;
          case 'daily': time = 60 * 60 * 24 * 1000 * num; break;
          case 'weekly': time = 60 * 60 * 24 * 31 * 1000 * num; break;
          case 'yearly': time = 60 * 60 * 24 * 365 * 1000 * num; break;
        }
        var addData = function () {
          rsj.r2j(e.url, async function (json) {
            var objs = JSON.parse(json);
            var connChild = null;
            try {
              connChild = await MongoClient.connect(url);
              const textArticles = connChild.db("case").collection("Articles");
              objs.forEach(async o => {
                const articlesResult = await textArticles.find({ "title": o.title, "link": o.link }).toArray();
                if (articlesResult.length == 0) {
                  o.sourceId = e._id;
                  await textArticles.insertOne(o);
                }
              });
            } catch (err) {
              console.log("错误：" + err.message);
            } finally {
              if (connChild != null) connChild.close();
            }
          });
        }
        addData();
        setInterval(function () {
          addData();
        }, time)
      })
    })
  } catch (err) {
    console.log("错误：" + err.message);
  } finally {
    if (conn != null) conn.close();
  }
}
dataOperate();

module.exports = function (app) {

  // login
  app.post('/api/login', function (req, res, next) {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("case");
      dbo.collection("users").find({ "email": req.body.email }).toArray(function (err, result) {
        if (err) throw err;
        db.close();
        if (result.length != 0 && result[0].password == req.body.password) {
          settoken.setToken(req.body.email, result[0]._id).then((data) => {
            return res.json({ isSuccess: true, data: { "email": req.body.email, token: data }, msg: 'Login successfully!!!' });
          });
        } else {
          return res.json({ isSuccess: false, data: '', msg: 'Email or password error, please try again!!!' });
        }
      });
    });
  });

  app.post('/api/register', async function (req, res) {
    var conn = null;
    try {
      conn = await MongoClient.connect(url);
      const testUsers = conn.db("case").collection("users");
      var result = await testUsers.find({ "email": req.body.email }).toArray();
      if (result.length == 0) {
        await testUsers.insertOne(req.body);
        return res.json({ isSuccess: true, data: '', msg: 'register successfully!!!' });
      } else {
        return res.json({ isSuccess: false, data: '', msg: 'The email has been registered!!!' });
      }
    } catch (err) {
      console.log("错误：" + err.message);
    } finally {
      if (conn != null) conn.close();
    }
  });

  // 随机获取一篇文章
  app.get('/api/articleOne', async function (req, res) {
    var conn = null;
    try {
      conn = await MongoClient.connect(url);
      const testArticles = conn.db("case").collection("Articles");
      var length = await testArticles.countDocuments() - 1;
      var result = await testArticles.find().skip(Math.floor(Math.random() * (length - 0 + 1) + 0)).limit(1).toArray();
      article = {
        title: result[0].title,
        link: result[0].link,
        date: result[0].date,
        author: result[0].author,
        summary: result[0].summary,
        image: result[0].image
      }
      res.send({ isSuccess: true, data: article, msg: '' });
    } catch (err) {
      console.log("错误：" + err.message);
    } finally {
      if (conn != null) conn.close();
    }
  });

// articles list
  app.get("/api/articlesTable", async function (req, res) {
    var conn = null;
    try {
      conn = await MongoClient.connect(url);
      const textArticles = conn.db("case").collection("Articles");
      const textFavorite = conn.db("case").collection("Favorite");
      var whereStr = { title: { $regex: req.query.titleValue } };
      if (req.query.sourceValue) {
        whereStr.sourceId = ObjectId(req.query.sourceValue)
      }
      const total = await textArticles.find(whereStr).count();
      const articlesResult = await textArticles.find(whereStr).skip(req.query.pageIndex * req.query.pageSize).limit(parseInt(req.query.pageSize)).toArray();
      const articles = articlesResult.map(r => {
        return {
          _id: r._id,
          title: r.title,
          link: r.link,
          category: r.categories,
          author: r.author,
          created: r.date,
          source: r.sourceId,
          favorite: false
        };
      });
      const resultF = await textFavorite.find({ userId: req.data._id, articleId: { $in: articles.map(a => a._id.toString()) } }).toArray();
      resultF.forEach(favorites => {
        const thisArticles = articles.find(m => m._id == favorites.articleId);
        thisArticles.favorite = true;
      });
      res.json({ isSuccess: true, data: { total: total, articlesList: articles }, msg: '' });
    } catch (err) {
      console.log("错误：" + err.message);
    } finally {
      if (conn != null) conn.close();
    }
  });

  app.post('/api/favorite', async function (req, res) {
    var conn = null;
    try {
      conn = await MongoClient.connect(url);
      const textFavorite = conn.db("case").collection("Favorite");
      var whereStr = { userId: req.data._id, articleId: req.body.articleId };
      if (req.body.isFavorite) {
        await textFavorite.deleteOne(whereStr);
      } else {
        await textFavorite.insertOne(whereStr);
      }
      res.json({ isSuccess: true, data: '', msg: 'Added successfully!!!' });
    } catch (err) {
      console.log("错误：" + err.message);
    } finally {
      if (conn != null) conn.close();
    }
  });

  // 获取source列表
  app.get('/api/sources', function (req, res) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("case");
      dbo.collection("RssSource").find({}).toArray(function (err, result) {
        if (err) throw err;
        db.close();
        return res.json({ isSuccess: true, data: result, msg: '' });
      });
    });
  });
}