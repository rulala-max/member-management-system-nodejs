const express = require('express');
// 웹서버도구 불러옴
const router = express.Router();
// 라우터 객체만듦
const controller = require('../controllers/memberController');
// 회원관리일 실제 처리할 컨트롤러 불러옴
router.get("/login", controller.login);
///member/login주소로 GET 요청이 들어오면 >>ontroller.login 실행
router.post("/login", controller.loginProc);
// 포스트:폼제출시 쓰는방식, 주소로 포스트요청오면 저 함수실행
router.get("/logout", controller.logout);
router.get("/join", controller.join);
router.post("/check_user_id", controller.chechUserId);
router.post("/join", controller.joinProc);
// CRUD(조회/수정/삭제): 
// /(목록), /view(상세),
//  /modify(수정 폼 GET & 저장 POST), /delete(삭제)
router.get('/', controller.list);
router.get('/view', controller.view);
router.get('/modify', controller.modify);
router.post('/modify', controller.modifyProc);
router.get('/delete', controller.deleteProc);

module.exports = {
    router    
    //배열형태. 여러개 넣을수있는데 우리는 하나만 쓰겠다...모듈로 만들값들 넣는 곳.
    // // router 넘겨줬고 이걸 app.js에서 받음(Routing 방법 부분)
}