const common = require('../common/common');
//common.js불러옴(그안의 유용한 함수들 바로사용할수있게)
const home = (req, res) => {
    try {   
        const loginUserInfo = common.checkLogin(req, res);    
        //// 커먼의 로그인유무 확인해서 돌려보내는 함수

        if (loginUserInfo != null) {
             // loginUserInfo>로그인 한 사용자 정보가 들어 있다.
            res.render('index', {loginUserInfo});
            // 로그인되어있으면 views/index.html 파일을 화면에 보여줌
        }


    } catch (error) {
        res.status(500).send("500 Error");
    }

}
// 홈이라는 함수 : 홈페이지 보여줄때 실행됨.
// req: 손님이 서버에 요청한 정보 (로그인 세션, 주소 등)
// res: 서버가 손님에게 돌려줄 응답!!! (화면, 메시지 등)
module.exports = {
    home
};