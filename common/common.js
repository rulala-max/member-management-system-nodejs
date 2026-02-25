const xss = require('xss');
// xxs라는 외부 라이브러리를 가져온것.xxs해킹 막아주는것
const path = require('path');
const fs = require('fs');

const dateFormat = (date, pattern = 'yyyy-mm-dd hh:ii:ss') => {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    pattern = pattern.replace(/yyyy/g, date.getFullYear());
    pattern = pattern.replace(/mm/g, month);
    pattern = pattern.replace(/dd/g, day);
    pattern = pattern.replace(/hh/g, hour);
    pattern = pattern.replace(/ii/g, minute);
    pattern = pattern.replace(/ss/g, second);

    return pattern;
}

const checkLogin = (req, res, isMust = true) => {
    let loginUserInfo = req.session.user;
    // req.session.user에는 로그인한 사용자 정보들어있음(로그인성공시 넣어쥼)
    if (loginUserInfo == null) {
        // 아무것도 없으면 = 로그인안했으면 로그인화면으로 보내면서 알림띄움,
        // 널 리턴 >> 더이상진행못하게 막음
        if (isMust) {
            alertAndGo(res, "로그인 필요합니다.", "/member/login");
        }
        return null;
    }

    return loginUserInfo;
    // 로그인되어있으면 그 사용자 정보 돌려줌
};

// member컨트롤러에서 사용
const alertAndGo = (res, msg, url) => {    // alert 띄울때 쓰는 공통 모듈
    res.render('common/alert', { msg, url });    // views 폴더 아래 common폴더 아래 alert.html 
                                // 띄울메세지, 이동할 화면 경로
}
// 브라우저에 띄울 알림창, 이동페이지 렌더해줌. 
const isNumber = (n) => {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
};
// n이 숫자처럼 생겼는지 확인하는 함수.
                                                // 생략 가능 여부
const reqeustFilter = (data, type, isHtml, defaultvalue = null) => {
    switch (type) {
        case 0:
            //0으로 넘기면 무조건 숫자로 받겠다
        // 숫자만 받아야하는 값 (패이지번호등)
            if (data != undefined) {
                let checkVal = data.replaceAll(',', '');
                if (!isNumber(checkVal)) {
                    throw "parameter is not number Error";
                }
            }
            break;
        case -1:
            if (!isHtml) {
                data = xss(data);
            }
             // isHtml이 false면, xss()로 위험한 태그 제거
//                 HTML 태그 막겠다? → 깨끗하게 씻기
                // HTML 태그 허용하겠다? → 그대로 두자 (관리자 전용 같은 곳)
            break;
        default:
            if (type < data.length) {
                throw "input length is too long";
            }
            
            if (!isHtml) {
                data = xss(data);
            }
            break;
    }

    if (data == null || data == '') {
        if (defaultvalue != null) {
            data = defaultvalue;
        } else {
            throw "input parameter not allow null";
        }
    }
    // 마지막안전장치, 값이 비었을때(널이나 ?)
    // 기본값있으면 그거넣고 기본값도 없으면 값없으면 안된다는 에럳던짐

    return data;
}
// /사용자가 입력한 값이 위험하거나 이상한지 검사하고,
//  괜찮은 값만 통과시키는 필터d역할하는 함수. 폼에서 받은 값들
// 이걸 거쳐서 깨끗하게 만들어서 쓰기

const pageNavigation = (printSize, page, pageSize, totalcount, url, params) => {
    let html = '';

    let totalPage = parseInt(totalcount / pageSize);
    //totalpage = 총 몇 페이지인지 계산/
    //  totalcount = 전체 글 개수,pageSize=한페이지에 몇개 보여줄지
    if (totalcount % pageSize != 0) {
        totalPage++;
    }

    if (totalPage > 0 && page <= totalPage) {
        start = parseInt((page - 1) / printSize) * printSize + 1;
        end = start + (printSize - 1);

        if (end > totalPage) end = totalPage;
        console.log(totalcount, totalPage, end)

        html += '<div class="d-flex justify-content-center">';
        html += '   <nav aria-label="page-navigation">';
        html += '       <ul class="pagination">';

        if (start > printSize) {
            let prevPage = start - 1;

            html += '<li class="page-item">';
            html += '   <a class="page-link" href="' + url + '?page=' + prevPage + params + '">&laquo;</a>';
            html += '</li>';
        } else {
            html += '<li class="page-item disabled">';
            html += '   <a class="page-link" href="#" tabindex="-1" aria-disabled="true">&laquo;</a>';
            html += '</li>';
        }

        let cnt = 1;
        for (let i = start; i <= end; i++) {
            if (page == i) {
                html += '<li class="page-item active" aria-current="page">';
                html += '   <a class="page-link" href="' + url + '?page=' + i + params + '">' + i + '</a>';
                html += '</li>';
            } else {
                html += '<li class="page-item">';
                html += '   <a class="page-link" href="' + url + '?page=' + i + params + '">' + i + '</a>';
                html += '</li>';
            }
            if (++cnt > printSize) break;
        }

        if (totalPage - start >= printSize) {
            let nextPage = start + printSize;

            html += '<li class="page-item">';
            html += '   <a class="page-link" href="' + url + '?page=' + nextPage + params + '">&raquo;</a>';
            html += '</li>';
        } else {
            html += '<li class="page-item disabled">';
            html += '   <a class="page-link" href="#" tabindex="-1" aria-disabled="true">&raquo;</a>';
            html += '</li>';
        }

        html += '       </ul>';
        html += '   </nav>';
        html += '</dev>';
    }

    return html;
}

const fileFilter = (req, file, callbackfunciton) => {
    const filetypes = /.jpg|.png|.gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (extname) {
        return callbackfunciton(null, true);
    } else {
        callbackfunciton('Error: Image Only!');
    }
}

const fileDelete = (file) => {
    try {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
    } catch (error) {
        throw "fileDelete Error";
    }
}

const getFileEXtension = (filename) => {
    return '.' + filename.split('.').pop();
}

const fileMove = (oldFilePath, newFilePath) => {
    try {
        if (fs.existsSync(oldFilePath)) {
            fs.renameSync(oldFilePath, newFilePath);
        }
    } catch (error) {
        throw "fileMove Error";
    }
}

module.exports = {
    checkLogin,
    alertAndGo,
    reqeustFilter,
    dateFormat,
    pageNavigation,
    fileFilter,
    fileDelete,
    getFileEXtension,
    fileMove
}
// 다른 파일에서도 이 함수들 쓸 수 있게 내보내기
// 컨트롤러에서 const common = require('../common/common');