const common = require('../common/common');
const model = require('../models/memberModel');
// 회원(로그인아웃,회원가입,아이디중복체크)관련 요청동작관리하는 두뇌
// 라우터에서 주소나오면 여기함수가 실행됨
const pageSize = 10;

const login = (req, res) => {
    try {
        res.render('member/login');
    } catch {
        res.status(500).send("500 Error");
    }
}
// 로그인페이지 화면에 띄워줌, member/login으로 들어오면 로그인창 띄워줌

const loginProc = async (req, res) => {
    try {
        let { username, password } = req.body;
        //req.body는 로그인 폼에서 입력한 값들, 그중에 두개만 꺼내옴
        //xss 들어 있을 수 있어 xss 필터링 한다.
        // false=HTML태그 허용 안 함
        username = common.reqeustFilter(username, 50, false);
        // 50자 이상 들어갈 수 없다고 막음(sql에 그렇게 정해둬서). html 사용 불가
        password = common.reqeustFilter(password, 50, false);

        const result = await model.loginCheck(username, password);
        // 모델안 함수 /db가서 해당 아이디,비번맞는 회원있는지 확인해주는 함수

        if (result != null) {
            //로그인 처리 --> 세션 저장
            req.session.user = {
                pkid: result.pkid,
                user_id: result.user_id,
                name: result.name
            }
            // 로그인한 사람정보 저장
            common.alertAndGo(res, '로그인 성공', '/');
            // 로그인 알람, /홈으로 이동.

        } else {
            // 아이디 또는 비번 틀린 경우
            //res.send('<script>alert("아이디 또는 비번이 틀립니다."); location.href="/member/login";</script>');
            common.alertAndGo(res, '아이디 또는 비번이 틀립니다.', '/member/login');  // common.js의 공통모듈 사용해서 alert 띄움

        }
    } catch (error) {
        res.status(500).send("500 Error: " + error);
    }
}

const logout = async (req, res) => {
    //req.session.destroy()는 로그인 상태(세션)를 없애는 명령어
    req.session.destroy((error) => {
        if (error) {
            console.log("세션 삭제 실패ㅋ")
        }
        common.alertAndGo(res, "", '/');
        // 로그아웃성공하면 홈으로 이동
    })
}

const chechUserId = async (req, res) => {
    try {
        let { user_id } = req.body;
        // let user_id = req.body.user_id;를 짧게 쓴버전
        // req는 요청객체,사용자가서버로 보낸값들 다 들어있음.
        // 정보들이 req객체안에 담겨서 컨드롤러로 들어옴
        // req.body는 폼으로 보낸 데이터들이 담기는 곳 약속어. <form method="POST">로 보낸 값
        user_id = common.reqeustFilter(user_id, 50, false);
        let cnt = await model.getIdCount(user_id);
        //model.getIdCount(user_id)> DB에서 같은 아이디가 몇 개인지 세기
        // 0이면: 아직 없는 아이디 → 사용 가능 (res.send("true"))
        if (cnt == 0) {
            // 가입 가능
            res.send("true");
        } else {   // 아니면 가입 불가
            res.send("false");
        }
    } catch (error) {
        res.status(500).send("500 Error:" + error);
    }
}
// 회원가입할때 아이디가 이미 존재하는지 검사하는 함수


const join = (req, res) => {
    try {
        res.render('member/join');
    } catch (error) {
        res.status(500).send("500 Error:" + error);
    }
    // /member/join 주소로 들어오면
    //views/member/join.html 화면을 띄워주는 함수
}

const joinProc = async (req, res) => {
    try {
        let { user_id, user_pw, name } = req.body;   // join.html의 div 아이디들

        user_id = common.reqeustFilter(user_id, 50, false);
        user_pw = common.reqeustFilter(user_pw, 50, false);
        name = common.reqeustFilter(name, 50, false);

        // 중복체크. 이유 : 해커들은 여기로 바로 들어올수가 있으니까
        let cnt = await model.getIdCount(user_id);   // user_id 개수

        if (cnt == 0) {

            await model.insertMember(user_id, user_pw, name);
            common.alertAndGo(res, '회원가입 완료', '/member/login');

        } else {
            // 해킹일때
            common.alertAndGo(res, '잘못된 접근입니다', '/member/join');
        }

    } catch (error) {
        res.status(500).send("500 Error:" + error);
    }
}
// 폼 제출시에 회원가입처리해줌

const list = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if (loginUserInfo != null) {
            let { page, search_key } = req.query;

            page = common.reqeustFilter(page, 0, false, 1);
            // 검색어 없을 때(undefined)도 ''로 처리해서 에러 안 나게 함
            search_key = common.reqeustFilter(search_key ?? '', -1, false, '');

            let totalRecord = await model.getTotalCount(search_key);
            let list = await model.getList(pageSize, page, search_key);

            res.render('member/index', { pageSize, page, totalRecord, loginUserInfo, list, search_key });
        }
    } catch (error) {
        res.status(500).send('500 Error:' + error);
    }
});
const view = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if (loginUserInfo != null) {
            let { page, id, search_key } = req.query;

            page       = common.reqeustFilter(page, 0, false, 1);
            id         = common.reqeustFilter(id, 0, false);
            search_key = common.reqeustFilter(search_key ?? '', -1, false, '');

            let viewData = await model.getData(id);

            res.render('member/view', { loginUserInfo, viewData, page, search_key });
        }
    } catch (error) {
        res.status(500).send('500 Error:' + error);
    }
});
const modify = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if (loginUserInfo != null) {
            let { page, id, search_key } = req.query;

            page       = common.reqeustFilter(page, 0, false, 1);
            id         = common.reqeustFilter(id, 0, false);
            search_key = common.reqeustFilter(search_key ?? '', -1, false, '');

            let viewData = await model.getData(id);

            res.render('member/modify', { loginUserInfo, viewData, page, search_key });
        }
    } catch (error) {
        res.status(500).send('500 Error:' + error);
    }
});


// 회원 수정(폼 진입)
const modifyProc = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if (loginUserInfo != null) {
            let { page, id, passwd, name, search_key } = req.body;   // search_key 추가

            page       = common.reqeustFilter(page, 0, false, 1);
            id         = common.reqeustFilter(id, 0, false);
            name       = common.reqeustFilter(name, 50, false);
            passwd     = common.reqeustFilter(passwd, 50, false, '');
            search_key = common.reqeustFilter(search_key ?? '', -1, false, '');

            await model.updateMember(id, name, passwd);

            // 수정 후: 검색 상태 유지한 목록으로 이동
            let url = '/member/?page=' + page;
            if (search_key !== '') {
                url += '&search_key=' + encodeURIComponent(search_key);
            }

            common.alertAndGo(res, '수정되었습니다.', url);
        }
    } catch (error) {
        res.status(500).send('500 Error:' + error);
    }
});

// 회원 수정(저장 처리)
const deleteProc = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if (loginUserInfo != null) {
            let { id } = req.query;

            id = common.reqeustFilter(id, 0, false);

            await model.deleteMember(id);

            //  삭제 후: 1페이지로
            common.alertAndGo(res, '삭제되었습니다.', '/member/?page=1');
        }
    } catch (error) {
        res.status(500).send('500 Error:' + error);
    }
});

// 회원 삭제

module.exports = {
    login,
    loginProc,
    logout,
    join,
    chechUserId,
    joinProc,
    list,
    view,
    modify,
    modifyProc,
    deleteProc
}
