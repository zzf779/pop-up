var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var serveFavicon = require('serve-favicon');
var bodyParser = require('body-parser');
var vertoken = require('./public/javascripts/token_vertify.js');
var expressJwt = require('express-jwt');

// 加载路由文件
// var indexRouter = require('./routes/index');
// var loginRouter = require('./routes/login');
// var usersRouter = require('./routes/users');

var routes = require('./routes/index');

// 生产一个express的实例
var app = express();

// view engine setup
/*
设置 views 文件夹为存放视图文件的目录,
即存放模板文件的地方,__dirname 为全局变量,
存储当前正在执行的脚本所在的目录。
 */
app.set('views', path.join(__dirname, 'views'));
//设置模板引擎为ejs
app.set('view engine', 'ejs');



// 加载日志中间件
app.use(logger('dev'));
// 加载解析json的中间件
app.use(bodyParser.json());
// 加载解析urlencoded请求体的中间件。  post请求
app.use(bodyParser.urlencoded({ extended: false }));
// 加载解析cookie的中间件
app.use(cookieParser());
// 设置public文件夹为放置静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

// 解析token获取用户信息
app.use(function (req, res, next) {
  var token = req.headers['authorization'];
  if (token == undefined) {
    return next();
  } else {
    vertoken.verToken(token).then((data) => {
      req.data = data;
      return next();
    }).catch((error) => {
      return next();
    })
  }
});

//验证token是否过期并规定哪些路由不用验证
app.use(expressJwt({
  secret: 'mes_qdhd_mobile_case',
  algorithms: ['HS256'],
  credentialsRequired: true
}).unless({
  path: ['/api/login']//除了这个地址，其他的URL都需要验证
}));

routes(app);

app.use(express.static(path.join(__dirname, 'public')));

// 路由控制器。
// app.use('/', indexRouter);
// app.use('/login', loginRouter);
// app.use('/users', usersRouter);

//当token失效返回提示信息
app.use(function(err, req, res, next) {
  if (err.status == 401) {
    return res.status(401).send('token失效');
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//把app导出。  别的地方就可以通过 require("app") 获取到这个对象
module.exports = app;
