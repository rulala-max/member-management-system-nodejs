const mysql = require('mysql2');
//mysql2라는 라이브러리를 불러옴.
// Node.js(자바스크립트 서버 코드)랑 
// MySQL DB를 연결해주는 도구 
// 서버가 DB에 접속하려면알아야하는 정보들.
const db = {
    host : '192.168.5.145',
    user : 'user1',
    password : '12345',
    database : 'user1'
};

// const db = {
//     host : '115.68.52.12',
//     user : 'kiwu',
//     password : 'kiwu!@',
//     database : 'dbkiwu'
// };

const pool = mysql.createPool(db);
const dbPool = pool.promise();

// 풀은 뭐냐면? DB 연결을 한 번만 만드는 게 아니라 여러 개
// 를 미리 만들어놓고 필요할 때 빌려 쓰는 묶음
// mysql2는 콜백 방식도 지원하는데, 그러면 코드가 복잡해짐 >>
// .promise()를 쓰면 async/await 스타일로 깔끔하게 쓸 수 있게 바꿔줌,
const runSql = (async(sql, params = null) => {
     // sql: "어떤 쿼리 날릴지" \"SELECT * FROM member WHERE pkid = ?" 이런 거)\
    //params: 쿼리 안의 ?에 들어갈 값들 (예: [3])
    //dbCon은 지금 내가 빌려온 DB 연결 1개를 담아둘 변수.
    //result는 DB가 나한테 돌려준 결과를 담을 변수.
    let dbCon;
    let result;

    try {
        dbCon = await dbPool.getConnection();
        //연결 빌릴 때까지 잠깐 기다리고, 빌려오면 dbCon에 담아
        if(params == null) {
            result = await dbCon.query(sql);
            //그냥 SQL만 실행.
        } else {
            result = await dbCon.query(sql, params);
            //SQL 안에 있는 ?를 params 값으로 채워서 실행
            // 이유:사용자가 이상한 걸 넣어도 그냥 값으로 처리되기 때문에 헤킹방어
             //mysql2는 query의 결과를 [rows, fields] 이런 식으로준다.
        // rows = 실제 데이터 (우리가 원하는 것)/fields = 그 데이터의 정보(메타데이터)
        }

        return result[0];
        // result[0]은 실제 DB에서 가져온 행들(db가 준것중에 필요한것만 꺼내서 돌려주기)
    } catch(error) {
        throw new Error(error);
    } finally {
        if (dbCon) dbCon.release();
        //try/catch가 끝난 후 무조건 실행되는 부분
        //dbCon.release()는 아까 빌려온 연결을 다시 풀에 돌려놓는것
    }
});
//SQL문을 실제로 DB에 날리고 결과를 받아오는 역할의 함수.

module.exports = {
    runSql,
    db
}
//runSql과 db를 밖에서 쓸 수 있게 내보내기.
//사용자가 브라우저에서 /member/login 같은 주소로 요청을 보냄
// >>routers/member.js가  로그인 처리 가야해 하고 컨트롤러에
// >>컨트롤러가 모델에게 아이디비번맞는지 확인시킴
// >>모델안에서 db.runSql(...)을 호출>>db.js쓰임
// 결과가 다시 모델>컨트롤러>화면으로 