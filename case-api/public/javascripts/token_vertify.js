var jwt = require('jsonwebtoken');
var signkey = 'mes_qdhd_mobile_case';

//设置token
// exp：Expiration time，过期时间
// iat：Issued at，发行时间
exports.setToken = function (email, userid) {
  return new Promise((resolve, reject) => {
    const token = 'Bearer ' + jwt.sign({
      email: email,
      _id: userid
    }, signkey, { expiresIn: 60 * 60 * 24 * 3 });
    resolve(token);
  })
}

//验证token
exports.verToken = function (token) {
  // return new Promise((resolve, reject) => {
  //   jwt.verify(token, signkey, (error, decoded) => {
  //     if (error) {
  //       reject(error)
  //     } else {
  //       resolve(decoded);
  //       console.log(decoded);
  //     }
  //   });
  // })
  return new Promise((resolve,reject)=>{
    var info = jwt.verify(token.split(' ')[1],signkey);
    resolve(info);
  })
}