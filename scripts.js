const CHINESE_WORD_TO_NUMBER = {
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '日': 7,
}

const CLASS_MAP = {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    'F': 5,
    '5': 6,
    '6': 7,
    '7': 8,
    '8': 9,
    '9': 10,
    'A': 11,
    'B': 12,
    'C': 13,
    'D': 14
}

function doRowspan() {
    for(let i = 1; i <= 5; ++i) {
        $("#curriculum").rowspan(i)
    }
}

async function setSubmitButtonDisabled(isDisabled) {
    $(".form-submit").prop('disabled', isDisabled)
}

async function login() {
    let data = {
        account: $("#account").val(),
        password: $("#password").val()
    }
    const LOGIN_URL = 'https://chayi-university-system-api.herokuapp.com/login'
    let webpid1 = ""
    $("#status").text("登入中...")
    $.ajax({
        url: LOGIN_URL,
        type: "POST",
        dataType: "json",
        async: true,
        data: data,
    }).done(async function (response) {
        webpid1 = response.result.webpid1
        if (webpid1.length == 0) {
            return
        }
        $("#status").text("正在生成你的課表...")
        courses = await getCourse(webpid1)

    }).fail(async function (data, textStatus, xhr) {
        if (data.status == 401) {
            $("#status").text("帳號或密碼錯誤")
        } else {
            $("#status").text("無法預期的錯誤")
        }
        await setSubmitButtonDisabled(false)
    })
    
}

async function getCourse(webpid1) {
    const COURSE_URL = 'https://chayi-university-system-api.herokuapp.com/course'
    let data = {
        webpid1: webpid1
    }

    $.ajax({
        url: COURSE_URL,
        type: "POST",
        data: data,
        async: true,
    }).done(async function (response) {
        await resetTable()

        createCurriculum(response.result["所有課程"])
        .then($("#curriculum").rowspanizer())
        
        $("#curriculum").show()
        $("#status").text("生成成功！")
        await setSubmitButtonDisabled(false)
    }).fail(async function (data, textStatus, xhr) {
        $("#status").text("無法預期的錯誤")
        await setSubmitButtonDisabled(false)
    }) 

}

async function resetTable() {
    var cloneTable = $("#curriculum").clone()
    $("#curriculum").remove()
    cloneTable.html(`
        <tbody>
            <tr>
                <th>節\\日</th>
                <th>星期一</th>
                <th>星期二</th>
                <th>星期三</th>
                <th>星期四</th>
                <th>星期五</th>
            </tr>
            <tr>
                <td>第 1 節<br>08:10 ~ 09:00</td>
            </tr>
            <tr>
                <td>第 2 節<br>09:10 ~ 10:00</td>
            </tr>
            <tr>
                <td>第 3 節<br>10:10 ~ 11:00</td>
            </tr>
            <tr>
                <td>第 4 節<br>11:10 ~ 12:00</td>
            </tr>
            <tr>
                <td>第 F 節<br>12:10 ~ 13:00</td>
            </tr>
            <tr>
                <td>第 5 節<br>13:20 ~ 14:10</td>
            </tr>
            <tr>
                <td>第 6 節<br>14:20 ~ 15:10</td>
            </tr>
            <tr>
                <td>第 7 節<br>15:20 ~ 16:10</td>
            </tr>
            <tr>
                <td>第 8 節<br>16:20 ~ 17:10</td>
            </tr>
            <tr>
                <td>第 9 節<br>17:20 ~ 18:10</td>
            </tr>
            <tr>
                <td>第 A 節<br>18:30 ~ 19:15</td>
            </tr>
            <tr>
                <td>第 B 節<br>19:20 ~ 20:05</td>
            </tr>
            <tr>
                <td>第 C 節<br>20:10 ~ 21:55</td>
            </tr>
            <tr>
                <td>第 D 節<br>21:00 ~ 21:45</td>
            </tr>
        </tbody>
    `)
    $(".table-div").append(cloneTable)
    let rows = $("#curriculum > tbody > tr").get().slice(1)

    rows.forEach(row => {
        for (let i = 0; i < 5; ++i) {
            $(row).find("td:last").after("<td></td>")
        }
    })

    $("#curriculum").show()

}

function createCurriculum(courses) {
    return new Promise((resolve, reject) => {
        let rows = $("#curriculum > tbody > tr").get()
        
        courses.forEach(course => {
            let courseName = course["課程名稱"]
            let coursesTime = course["上課時間"]
            let courseClassroom = course["上課教室"]
            let courseTeacher = course["授課老師"]
            coursesTime.forEach(courseTime => {

                let day = CHINESE_WORD_TO_NUMBER[courseTime["星期"]]
                let startClass
                let endClass

                if (courseTime["開始節次"] == 'Z') {
                    startClass = 1
                    endClass = 8
                } else {
                    startClass = CLASS_MAP[courseTime["開始節次"]]
                    endClass = CLASS_MAP[courseTime["結束節次"]]
                }

                for (let i = startClass; i <= endClass; ++i) {
                    tds = $(rows[i]).children('td')
                    $(tds[day]).append(`<div class="course-name">【${courseName}】</div>`)
                    $(tds[day]).append('<br>')
                    $(tds[day]).append(`<div class="course-classroom">${courseClassroom}</div>`)
                    $(tds[day]).append(`<div class="course-teacher">教授: ${courseTeacher}</div>`)

                    $(tds[day]).addClass('used-td')
                }


            })
        })

        resolve(1)
    })
    

}

async function generate() {
    await setSubmitButtonDisabled(true)
    await login()
    
}




