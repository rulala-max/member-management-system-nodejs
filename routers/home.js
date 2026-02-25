const express = require('express');
const router = express.Router();
// 라우터 객체(그냥 표지판) 만드는것. 이 안에 이주소로 겟요청오면 이 함수 실행해라등 규칙담기
//app.js에서 그냥 표지판을 실제길(서버)에 세움(라우터를 서버에 등록)
const controller = require('../controllers/homeController');


router.get('/', controller.home);
// 겟(주소창에 치고 들어오는것.) /로 들어오면 app.js에서 보고
// /로 시작하니까 홈라우터로 넘김
// 홈컨트롤러.홈 호출 > 로그인체크 > 통과하면 res.render('index')로 index.html 화면 보여줌
module.exports = {
    router
};
// 밖에서도 쓸수있게