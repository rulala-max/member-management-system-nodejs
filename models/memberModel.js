const db = require('../common/db');
// DB랑 이야기해주는 통역사(db.js)

const loginCheck = async (user_id, user_pw) => {
    try {
        const sql = "select id, userid, name from member where userid = ? and passwd = ?";
        //디비에 보낼 쿼리 문자열임/ 아이디비번이 특정값인 그회원의 pk~가져오기
        const params = [user_id, user_pw];
        //SQL문의 ?에 실제로 넣을 값들을 준비하는 줄, 배열[]형태.
        const result = await db.runSql(sql, params);
        //위에서 만든 sql과 params를 db.js의 runSql 함수에 넘겨서
        // runsql은 마이에스큐엘접속해서 쿼리실해으결과받아옴.
        // 로그인성공시 result배열에는 [{ pkid: ssy, user_id: 'ssy', name: '신서영' }]
        return result[0];
        // 배열[]의 첫요소 {}
        // 컨트롤러는 이걸 받아서 성공실패 구분함.
    } catch (error) {
        throw "sql error: " + error;
    }
}//(user_id, user_pw) >컨트롤러가 전달해줄 값(사용자가 로그인폼에입력한것이 여기로)
// async:어웨이트사용 > 응답올때까지 기다릴수있게 비동기처리하는것

const getIdCount = async (user_id) => {
    try {
        const sql = "select count(id) as cnt from member where userid = ?"
        //member 테이블에서 user_id가 이 값인 행이 몇 개인지 묻는 에스큐엘]
        //as cnt는 결과 칼럼 이름을 cnt로 정하는것.
        const params = [user_id]
        //user_id = "apple"이면 params = ["apple"], 실제 ?에 들어갈 값을 배열로 준비
        const result = await db.runSql(sql, params);
        // 위에ㅓ서 만든 에스큐엘,파람즈를 디비에 실행시키고 결과기다림.
        //[{ cnt: 1 }]처럼 돌려줌
        return result[0].cnt
        //첫번째행의 cnt값, 즉 0또는 1 돌려줌 > 컨트롤러에서 (cnt == 0)등활용
    } catch (error) {
        throw "sql error" + error;
    }
}

const insertMember = async (user_id, user_pw, name) => {
    try {
        const sql = 'insert into member(userid, passwd, name) values (?, ?, ?)';
        //새 줄을 멤버 테이블에 추가
        const params = [user_id, user_pw, name]
        // 쿼리 ???에 들어갈 값들을 순서대로 담은 배열
        const result = await db.runSql(sql, params);
         // 실제로 디비에 새회원 추가하는 쿼리 날리고 어웨이트로 기다리면 응답들어옴
    } catch (error) {
        throw "sql error" + error;
    }
}
//새회원을 디ㅣ비에 추가하는 함수. 회원가입 마지막단계에 호출됨

const getTotalCount = async (search_key) => {
    try {
        let sql = "";
        let param = [];

        // 검색어가 있으면 userid/name에 like 검색, 없으면 전체 카운트
        if (search_key != null && search_key !== '') {
            sql = "select count(id) as cnt from member where (userid like ? or name like ?)";
            param = ['%' + search_key + '%', '%' + search_key + '%'];
        } else {
            sql = "select count(id) as cnt from member";
            // param은 빈배열 그대로 (where 없음)
        }

        const result = await db.runSql(sql, param);

        return result[0].cnt;
    } catch (error) {
        throw "sql error" + error;
    }
}

const getList = async (pageSize, page, search_key) => {
    try {
        let start = (page - 1) * pageSize;
        let sql = "";
        let param = [];

        // 검색어가 있으면 userid/name like 검색, 없으면 전체 목록
        if (search_key != null && search_key !== '') {
            sql = "select id, userid, name, regdate from member where (userid like ? or name like ?) order by id desc limit ?, ?";
            param = ['%' + search_key + '%', '%' + search_key + '%', start, pageSize];
        } else {
            sql = "select id, userid, name, regdate from member order by id desc limit ?, ?";
            param = [start, pageSize];
        }

        const result = await db.runSql(sql, param);

        return result;
    } catch (error) {
        throw "sql error" + error;
    }
}

const getData = async (pkid) => {
    try {
        const sql = "select id, userid, name, regdate from member where id = ?";
        const param = [pkid];

        const result = await db.runSql(sql, param);

        return result[0];
    } catch (error) {
        throw "sql error" + error;
    }
}

const updateMember = async (id, name, passwd) => {
    try {
        let sql = '';
        let param = null;

        if (passwd != null && passwd != '') {
            sql = "update member set name = ?, passwd = ? where id = ?";
            param = [name, passwd, id];
        } else {
            sql = "update member set name = ? where id = ?";
            param = [name, id];
        }
        const result = await db.runSql(sql, param);

        return result[0];
    } catch (error) {
        throw "sql error" + error;
    }
}

const deleteMember = async (id) => {
    try {
        const sql = "delete from member where id = ?";
        const param = [id];

        const result = await db.runSql(sql, param);

        return result[0];
    } catch (error) {
        throw "sql error" + error;
    }
}

module.exports = {
    loginCheck,
    getIdCount,
    insertMember,
    getTotalCount,
    getList,
    getData,
    updateMember,
    deleteMember
}
// 외부에서도 이 함수들을 사용할 수 있게 한다.
