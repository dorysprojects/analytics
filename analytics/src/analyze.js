const swup = new Swup();
content = "";
if (document.getElementById("file")) {
    var file = document.getElementById("file");
    file.addEventListener("change", getFile);

}

function getFile() {
    var fr = new FileReader();
    fr.onload = function () {
        content = this.result;
        changePage();
    }
    fr.readAsText(this.files[0]);
}

async function samplefile() {
    var text = await fetch('./sample.txt');
    content = (await text.text());
    changePage();
}

function changePage() {
    // var url = (window.screen.width > 768) ? '/analyze.html' : 'analyze_mobile.html'
    swup.loadPage({
        url: './analyze.html', // route of request (defaults to current url)
        method: 'GET', // method of request (defaults to "GET")
        data: "", // data passed into XMLHttpRequest send method
        customTransition: '' // name of your transition used for adding custom class to html element and choosing custom animation in swupjs (as setting data-swup-transition attribute on link)
    });
}

document.addEventListener('swup:contentReplaced', (event) => {
    if (document.querySelector('[chat-title]'))
        analyse();
        //analyse2();
});

var chatname = "";
var environment = 0;
var moreThanAHour = 0;
var messageInADayAll = [];
var callTimeInADay = [];
var callSecondInADay = [];
var members = [];
var maxCallTime = new Array(3).fill(0);
var maxCallDate = "";
var dates = [];
var lines;
var length;
var date;
var message;
var memberMessageList = {};
var dayTime = {
    hour: 0,
    min: 0,
    sec: 0,
    calls: 0
};
var time = {
    hour: 0,
    min: 0,
    sec: 0,
    calls: 0
};
var memberMessageNum = {};
var maxDate = "";
var eachMemberMessages = new Array(500).fill(0);
var eachMemberStickers = new Array(500).fill(0);
var eachMemberPhotos = new Array(500).fill(0);
var maxMessage = 0;
var totalDays = 0;
var totalMessages = 0;
var messageNumAll = 0;
var unsent = 0;

var options = { minimumCount: 30 };

function processlist(cloudlist) {
    var newlist = []
    var maxfontsize = (window.screen.width > 768) ? 80 : 20
    for (i = 0; i < cloudlist.length; i++) {
        var validkey = 1
        for (j = 0; j < members.length; j++) {
            if ((members[j] == cloudlist[i][0]) || members[j].includes(cloudlist[i][0]) || cloudlist[i][0].includes(members[j]) || cloudlist[i][0].includes("貼圖") || cloudlist[i][0].includes("照片") || cloudlist[i][0].includes("上午") || cloudlist[i][0].includes("下午") || cloudlist[i][0].includes("通話") || cloudlist[i][0].includes("未接來電") || cloudlist[i][0].includes("時間")) {
                validkey = 0;
            }
        }
        if (validkey)
            newlist.push(cloudlist[i])
    }
    // console.log(newlist)
    var max = 0;
    for (var i = 0; i < newlist.length; i++) {
        if (newlist[i][1] > max)
            max = newlist[i][1];
    }
    var ratio = max / maxfontsize;
    // console.log(ratio);
    for (var i = 0; i < newlist.length; i++) {
        newlist[i][1] = Math.round(newlist[i][1] / ratio);
    }

    return newlist
}

function getMaxCallTime(time) {
    if (parseInt(time.hour) > parseInt(maxCallTime[0])) {
        maxCallTime[0] = time.hour;
        maxCallTime[1] = time.min;
        maxCallTime[2] = time.sec;
        maxCallDate = dates[dates.length - 1];
    }
    else if (parseInt(time.hour) == parseInt(maxCallTime[0]) && parseInt(time.min) > parseInt(maxCallTime[1])) {
        maxCallTime[0] = time.hour;
        maxCallTime[1] = time.min;
        maxCallTime[2] = time.sec;
        maxCallDate = dates[dates.length - 1];
    }
    else if (parseInt(time.hour) == parseInt(maxCallTime[0]) && parseInt(time.min) == parseInt(maxCallTime[1]) && parseInt(time.sec) > parseInt(maxCallTime[2])) {
        maxCallTime[0] = time.hour;
        maxCallTime[1] = time.min;
        maxCallTime[2] = time.sec;
        maxCallDate = dates[dates.length - 1];
    }
    // console.log([maxCallTime[0], maxCallTime[1], maxCallTime[2]]);

}

function addTime(splited, time) {
    // console.log(splited, maxCallTime);
    if (splited.length == 2) {
        time.sec += parseInt(splited[1]);
        time.min += parseInt(splited[0]);
        if (!moreThanAHour) {
            if (parseInt(splited[0]) > parseInt(maxCallTime[1])) {
                maxCallTime[1] = splited[0];
                maxCallTime[2] = splited[1];
                maxCallDate = dates[dates.length - 1];
            }
            else if (parseInt(splited[0]) == parseInt(maxCallTime[1]) && parseInt(splited[1]) > parseInt(maxCallTime[2])) {
                maxCallTime[1] = splited[0];
                maxCallTime[2] = splited[1];
                maxCallDate = dates[dates.length - 1];
            }
        }
    }
    else if (splited.length == 3) {
        moreThanAHour = 1;
        time.sec += parseInt(splited[2]);
        time.min += parseInt(splited[1]);
        time.hour += parseInt(splited[0]);
        if (parseInt(splited[0]) > parseInt(maxCallTime[0])) {
            maxCallTime[0] = splited[0];
            maxCallTime[1] = splited[1];
            maxCallTime[2] = splited[2];
            maxCallDate = dates[dates.length - 1];
        }
        else if (parseInt(splited[0]) == parseInt(maxCallTime[0]) && parseInt(splited[1]) > parseInt(maxCallTime[1])) {
            maxCallTime[0] = splited[0];
            maxCallTime[1] = splited[1];
            maxCallTime[2] = splited[2];
            maxCallDate = dates[dates.length - 1];
        }
        else if (parseInt(splited[0]) == parseInt(maxCallTime[0]) && parseInt(splited[1]) == parseInt(maxCallTime[1]) && parseInt(splited[2]) > parseInt(maxCallTime[2])) {
            maxCallTime[0] = splited[0];
            maxCallTime[1] = splited[1];
            maxCallTime[2] = splited[2];
            maxCallDate = dates[dates.length - 1];
        }
    }
    time.calls++;
}

function getCallTime(line, time) {
    if (line.split(/(\s+)/)[4] == "通話時間") {
        var splitedAndroid = line.split(/(\s+)/)[6].split(":");
        addTime(splitedAndroid, time);
        if (!environment)
            environment = 1;
    }
    else if (line.split(/(\s+)/)[6] != undefined) {
        if (line.split(/(\s+)/)[6].substring(0, 4) == "通話時間") {
            var beforeSplited = line.split(/(\s+)/)[6].substring(4, line.split(/(\s+)/)[6].length);
            var splitedIOS = beforeSplited.split(":");
            addTime(splitedIOS, time);
            if (!environment)
                environment = 2;
        }
    }
}

function adjustTime(time) {
    time.min += parseInt(time.sec / 60);
    time.hour += parseInt(time.min / 60);
    time.sec = time.sec % 60;
    time.min = time.min % 60;
}

/*
 * Add Code
 */
function monthDayDiff(startDate, endDate) {
    let flag = [1, 3, 5, 7, 8, 10, 12, 4, 6, 9, 11, 2];
    let start = new Date(startDate);
    let end = new Date(endDate);
    let year = end.getFullYear() - start.getFullYear();
    let month = end.getMonth() - start.getMonth();
    let day = end.getDate() - start.getDate();
    if (month < 0) {
        year--;
        month = end.getMonth() + (12 - start.getMonth());
    }
    if (day < 0) {
        month--;
        let index = flag.findIndex((temp) => {
            return temp === start.getMonth() + 1
        });
        let monthLength;
        if (index <= 6) {
            monthLength = 31;
        } else if (index > 6 && index <= 10) {
            monthLength = 30;
        } else {
            monthLength = 28;
        }
        day = end.getDate() + (monthLength - start.getDate());
    }
    
    return `${year}年${month}月${day}天`;
}

var Nowday = '';
var Data = {};
var user1 = '';
var user2 = '';
var user1textList = [];
var user2textList = [];
var user1phoneList = [];
var user2phoneList = []; 
var user1delgalleryList = [];
var user2delgalleryList = [];
var user1delphotoList = [];
var user2delphotoList = [];
var user1changegalleryList = [];
var user2changegalleryList = [];
var user1urlList = [];
var user2urlList = [];
var user1noteList = [];
var user2noteList = [];
var alltextList = {};
var maxphonetime = '';
var maxphonetimedate = '';
var totalTime = '';
var data = '';
var data2 = '';
var NowType = '';
var NowUser = '';
var NowUserTextCtn = 0;
var NowUserNoteCtn = 0;
var FirstDay = '';
var LastDay = '';
var dayList = {};
dayList['text'] = {};
dayList['phone'] = {};
dayList['phonelong'] = {};
dayList['eachword'] = {};
var MaxCtnText = '';
var MaxTextDay = '';
var MaxPhoneDay = '';
var MaxLongPhoneDay = '';
function analyse() {
    lines = content.split("\n");
    length = lines.length;
    chatname = lines[0];
    user1 = chatname.replace('[LINE] 與', '').replace('的聊天記錄', '');
    user1 = user1.substr(0, user1.length-1);
    Data[user1] = {
        '文字' : 0, '貼圖' : 0, '照片' : 0, '連結' : 0, 'dayList' : {},
        '記事本' : 0, '相簿' : 0, '電話' : 0, '刪除相簿照片' : 0,
        '更改相簿名稱' : 0, '刪除相簿' : 0, '收回訊息' : 0,
        '影片' : 0, '語音訊息' : 0, '未接來電' : 0
    };
    
    
    document.getElementById('LoadingProgressBar').style.width = '0%';
    document.getElementById('LoadingProgressBar').innerHTML = '0%';
    for (i = 3; i <= length; i++) {
        document.getElementById('LoadingProgressBar').style.width = (i/length*100) + '%';
        document.getElementById('LoadingProgressBar').innerHTML = (i/length*100) + '%';
        if(lines[i]){
            var Column = lines[i].split("\t");
            var datetime = Column[0];
            if(Column.length === 1){
                if(datetime){
                    var datechk = datetime.split("/");
                    if( datechk.length===3 && (datechk[2].includes("（一）")||datechk[2].includes("（二）")||datechk[2].includes("（三）")||datechk[2].includes("（四）")||datechk[2].includes("（五）")||datechk[2].includes("（六）")||datechk[2].includes("（日）")) ){
                        Nowday = datetime;
                        if(i === 3){
                            FirstDay = Nowday;
                        }else{
                            LastDay = Nowday;
                        }
                    }else{
                        UndoMsg(datetime);
                        continue;
                    }
                }
            }else{
                var user = Column[1];
                var msg = Column[2];
                var type = '';
                var phonetime = '';
                var note = '';
                var text = '';
                var url = '';
                
                if(msg){
                    if(!user2 && user!==user1){
                        user2 = user;
                        Data[user2] = {
                            '文字' : 0, '貼圖' : 0, '照片' : 0, '連結' : 0, 'dayList' : {},
                            '記事本' : 0, '相簿' : 0, '電話' : 0, '刪除相簿照片' : 0,
                            '更改相簿名稱' : 0, '刪除相簿' : 0, '收回訊息' : 0,
                            '影片' : 0, '語音訊息' : 0, '未接來電' : 0
                        };
                    }
                }
                
                if(!msg){
                    if(user.substr(-6, 5) === '已收回訊息'){
                        user = user.substr(0, user.length-6);
                        if(user === '您'){
                            user = (user2) ? user2 : user;
                        }
                        type = '收回訊息';
                    }else if(user.includes('刪除了「') && user.includes('」相簿內的照片')){
                        var tmp = user.split('刪除了「');
                        var tmp2 = tmp[1].split('」相簿內的照片');
                        type = '刪除相簿照片';
                        user = tmp[0];
                        data = tmp2[0];
                    }else if(user.includes('已將「') && user.includes('」的相簿刪除')){
                        var tmp = user.split('已將「');
                        var tmp2 = tmp[1].split('」的相簿刪除');
                        type = '刪除相簿';
                        user = tmp[0];
                        data = tmp2[0];
                    }else if(user.includes('已將相簿名稱由「')){// && user.includes('」改為「⁨')
                        var tmp = user.split('已將相簿名稱由「');
                        var tmp2 = tmp[1].split('」改為「');
                        var tmp3 = tmp2[1].split('」');
                        type = '更改相簿名稱';
                        user = tmp[0];
                        data = tmp2[0];
                        data2 = tmp3[0];
                    }else{
                        if(datetime && user){
                            type = "文字";
                            text = msg = lines[i].split(user)[1];
                        }else if(datetime && !user){
//                            console.log(lines[i]);
                        }else if(!datetime && user){
                            UndoMsg(user);
                            continue;
                        }else if(!datetime && !user){
//                            console.log(lines[i]);
                        }
                    }
                    if(user!== user1 && user!== user2){
                        if(user.charCodeAt(0).toString(16)===user1.charCodeAt(1).toString(16) || user.charCodeAt(1).toString(16)===user1.charCodeAt(0).toString(16)){
                            user = user1;
                        }else if(user.charCodeAt(0).toString(16)===user2.charCodeAt(1).toString(16) || user.charCodeAt(1).toString(16)===user2.charCodeAt(0).toString(16)){
                            user = user2;
                        }
                    }
                }else if(msg.includes("☎ 通話時間")){
                    type = '電話';
                    phonetime = msg.replace('☎ 通話時間', '');
                    var totalTimeTmp = totalTime.split(":");
                    var time = phonetime.split(":");
                    var oldtime = '';
                    var newtime = '';
                    if(totalTime){
                        if(time.length === 3){
                            totalTime = (totalTimeTmp[0]*1+time[0]*1) +':'+ (totalTimeTmp[1]*1+time[1]*1) +':'+ (totalTimeTmp[2]*1+time[2]*1);
                        }else{
                            totalTime = totalTimeTmp[0] +':'+ (totalTimeTmp[1]*1+time[0]*1) +':'+ (totalTimeTmp[2]*1+time[1]*1);
                        }
                    }else{
                        if(time.length === 3){
                            totalTime = phonetime;
                        }else{
                            totalTime = '00:' + phonetime;
                        }
                    }
                    //console.log(totalTime);
                    if(maxphonetime){
                        var time2 = maxphonetime.split(":");
                        if(time2.length === 3){
                            oldtime = new Date(0, 0, time2[0], time2[1], time2[2], 0).getTime();
                        }else{
                            oldtime = new Date(0, 0, 0, time2[0], time2[1], 0).getTime();
                        }
                        if(time.length === 3){
                            newtime = new Date(0, 0, time[0], time[1], time[2], 0).getTime();
                        }else{
                            newtime = new Date(0, 0, 0, time[0], time[1], 0).getTime();
                        }
                        if(newtime > oldtime){
                            maxphonetime = phonetime;
                            maxphonetimedate = Nowday;
                        }
                    }else{
                        maxphonetime = phonetime;
                        maxphonetimedate = Nowday;
                    }
                }else if(msg.substr(0, 5) === '[記事本]'){
                    type = '記事本';
                    note = msg.replace('[記事本]', '');
                }else{
                    msg = msg.substr(0, msg.length-1);
                    switch(msg){
                        case '[相簿] (null)':
                            type = '相簿';
                            break;
                        case '[貼圖]':
                            type = '貼圖';
                            break;
                        case '[照片]':
                            type = '照片';
                            break;
                        case '[影片]':
                            type = '影片';
                            break; 
                        case '[語音訊息]':
                            type = '語音訊息';
                            break; 
                        case '☎ 未接來電':
                            type = '未接來電';
                            break; 
                        default :
                            if(new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/).test(msg)){
                                type = '連結';
                                url = msg;
                            }else{
                                type = '文字';
                                text = msg;
                            }
                            break;
                    }
                }
                
                if(user){
                    if(!Data[user]){
                        UndoMsg(lines[i]);
                        continue;
                    }
                    if(!Data[user]){
                        Data[user] = {};
                    }else{
                        if(Data[user][type]){
                            Data[user][type] += 1;
                        }else{
                            Data[user][type] = 1;
                        }
                        switch(type){
                            case '記事本':
                                note = note.substr(0);
                                NowType = type;
                                NowUser = user;
                                if(user === user1){
                                    NowUserNoteCtn = user1noteList.length; 
                                }else{
                                    NowUserNoteCtn = user2noteList.length; 
                                }
                                
                                if(user === user1){
                                    user1noteList.push(note);
                                }else{
                                    user2noteList.push(note);
                                }
                                break;
                            case '連結':
                                if(user === user1){
                                    user1urlList.push(url);
                                }else{
                                    user2urlList.push(url);
                                }
                                break;
                            case '文字':
                                text = text.substr(0);
                                if(text.substr(0,1)==='"'){
                                    NowType = type;
                                    NowUser = user;
                                    if(user === user1){
                                        NowUserTextCtn = user1textList.length; 
                                    }else{
                                        NowUserTextCtn = user2textList.length; 
                                    }
                                }
                                
                                if(user === user1){
                                    user1textList.push(text);
                                }else{
                                    user2textList.push(text);
                                }
                                
                                if(alltextList[text]){
                                    alltextList[text] += 1;
                                }else{
                                    alltextList[text] = 1;
                                }
                                if(MaxCtnText){
                                    if(alltextList[text] > alltextList[MaxCtnText]){
                                        MaxCtnText = text;
                                    }
                                }else{
                                    MaxCtnText = text;
                                }
                                if(Data[user]['dayList'][Nowday]){
                                    Data[user]['dayList'][Nowday] += 1;
                                }else{
                                    Data[user]['dayList'][Nowday] = 1;
                                }
                                if(dayList['text'][Nowday]){
                                    dayList['text'][Nowday] += 1;
                                }else{
                                    dayList['text'][Nowday] = 1;
                                }
                                if(MaxTextDay){
                                    var MaxTextDayTmp = new Date(MaxTextDay.split("（")[0]);
                                    var NowdayTmp = new Date(Nowday.split("（")[0]);
                                    if(dayList['text'][Nowday] > dayList['text'][MaxTextDay]){
                                        MaxTextDay = Nowday;
                                    }
                                }else{
                                    MaxTextDay = Nowday;
                                }
                                if(dayList['eachword'][text]){
                                    if(dayList['eachword'][text][Nowday]){
                                        dayList['eachword'][text][Nowday] += 1;
                                    }else{
                                        dayList['eachword'][text][Nowday] = 1;
                                    }
                                }else{
                                    dayList['eachword'][text] = {};
                                    dayList['eachword'][text][Nowday] = 1;
                                }
                                break;
                            case '電話':
                                if(user === user1){
                                    user1phoneList.push(phonetime);
                                }else{
                                    user2phoneList.push(phonetime);
                                }
                                if(dayList['phone'][Nowday]){
                                    dayList['phone'][Nowday] += 1;
                                }else{
                                    dayList['phone'][Nowday] = 1;
                                }
                                if(MaxPhoneDay){
                                    var MaxPhoneDayTmp = new Date(MaxPhoneDay.split("（")[0]);
                                    var NowdayTmp = new Date(Nowday.split("（")[0]);
                                    if(dayList['phone'][Nowday] > dayList['phone'][MaxPhoneDay]){
                                        MaxPhoneDay = Nowday;
                                    }
                                }else{
                                    MaxPhoneDay = Nowday;
                                }
                                var time = phonetime.split(":");
                                if(dayList['phonelong'][Nowday]){
                                    var phonelongTmp = dayList['phonelong'][Nowday].split(":");
                                    if(time.length === 3){
                                        var SecTmp = (phonelongTmp[2]*1+time[2]*1)%60;
                                        var MinTmp = parseInt((phonelongTmp[2]*1+time[2]*1)/60);
                                        MinTmp = (MinTmp+phonelongTmp[1]*1+time[1]*1)%60;
                                        var HourTmp = parseInt((MinTmp+phonelongTmp[1]*1+time[1]*1)/60)+phonelongTmp[0]*1+time[0]*1;                                        
                                        dayList['phonelong'][Nowday] = HourTmp +':'+ MinTmp +':'+ SecTmp;
                                    }else{
                                        var SecTmp = (phonelongTmp[2]*1+time[1]*1)%60;
                                        var MinTmp = parseInt((phonelongTmp[2]*1+time[1]*1)/60);
                                        MinTmp = (MinTmp+phonelongTmp[1]*1+time[0]*1)%60;
                                        var HourTmp = parseInt((MinTmp+phonelongTmp[1]*1+time[0]*1)/60)+phonelongTmp[0]*1;   
                                        dayList['phonelong'][Nowday] = HourTmp +':'+ MinTmp +':'+ SecTmp;
                                    }
                                }else{
                                    if(time.length === 3){
                                        dayList['phonelong'][Nowday] = phonetime;
                                    }else{
                                        dayList['phonelong'][Nowday] = '00:' + phonetime;
                                    }
                                }
                                if(MaxLongPhoneDay){
                                    var MaxLongPhoneDayTmp = new Date(MaxLongPhoneDay.split("（")[0]);
                                    var NowdayTmp = new Date(Nowday.split("（")[0]);
                                    var MaxLongPhoneDayTmp2 = dayList['phonelong'][MaxLongPhoneDay].split(":");
                                    var phonelongTmp = dayList['phonelong'][Nowday].split(":");
                                    if( phonelongTmp[0]*1>MaxLongPhoneDayTmp2[0]*1 || (phonelongTmp[0]*1===MaxLongPhoneDayTmp2[0]*1&&phonelongTmp[1]*1>MaxLongPhoneDayTmp2[1]*1) || (phonelongTmp[0]*1===MaxLongPhoneDayTmp2[0]*1&&phonelongTmp[1]*1===MaxLongPhoneDayTmp2[1]*1&&phonelongTmp[2]*1>MaxLongPhoneDayTmp2[2]*1) ){
                                        MaxLongPhoneDay = Nowday;
                                    }
                                }else{
                                    MaxLongPhoneDay = Nowday;
                                }
                                break;
                            case '刪除相簿':
                                if(user === user1){
                                    user1delgalleryList.push(data);
                                }else{
                                    user2delgalleryList.push(data);
                                }
                                break;
                            case '刪除相簿照片':
                                if(user === user1){
                                    user1delphotoList.push(data);
                                }else{
                                    user2delphotoList.push(data);
                                }
                                break;
                            case '更改相簿名稱':
                                if(user === user1){
                                    user1changegalleryList.push(data + '->' + data2);
                                }else{
                                    user2changegalleryList.push(data + '->' + data2);
                                }
                                break;
                            case '相簿':
                            case '貼圖':
                            case '照片':
                            case '收回訊息':
                            case '影片':
                            case '語音訊息':
                            case '未接來電':
                                break;
                            default :
                                console.log(lines[i]);
                                break;
                        }
                    }
                }
            }
        }
    }
    Data[user1]['note'] = user1noteList;
    Data[user2]['note'] = user2noteList;
    Data[user1]['url'] = user1urlList;
    Data[user2]['url'] = user2urlList;
    Data[user1]['text'] = user1textList;
    Data[user2]['text'] = user2textList;
    Data[user1]['phone'] = user1phoneList;
    Data[user2]['phone'] = user2phoneList;
    Data[user1]['delgallery'] = user1delgalleryList;
    Data[user2]['delgallery'] = user2delgalleryList;
    Data[user1]['delphoto'] = user1delphotoList;
    Data[user2]['delphoto'] = user2delphotoList;
    Data[user1]['changegallery'] = user1changegalleryList;
    Data[user2]['changegallery'] = user2changegalleryList;
    
    var totalTimeTmp = totalTime.split(":");
    var Hour = totalTimeTmp[0];
    var Min = totalTimeTmp[1];
    var Sec = totalTimeTmp[2];
    Min = Min*1 + parseInt(totalTimeTmp[2]*1/60);
    Sec = Sec*1%60;
    Hour = Hour*1 + parseInt(Min*1/60);
    Min = Min*1%60;
    var Day = parseInt(Hour*1/24);
    Hour = Hour*1%60;
    var Datetime = Day+'天' + Hour+'時' +  Min+'分' + Sec+'秒';//通話時間
    var FirstDayTmp = new Date(FirstDay.split("（")[0]);
    var LastDayTmp = new Date(LastDay.split("（")[0]);
//    var TineGap = (LastDayTmp - FirstDayTmp) / (1000 * 60 * 60 * 24);//聊天 天數
    var TineGap = monthDayDiff(FirstDayTmp, LastDayTmp);//聊天 幾年幾月幾日
    var MsgTotal = ((Data[user1]['文字']+Data[user1]['貼圖']+Data[user1]['照片']+Data[user1]['連結']+Data[user1]['影片']+Data[user1]['語音訊息'])+(Data[user2]['文字']+Data[user2]['貼圖']+Data[user2]['照片']+Data[user2]['連結']+Data[user2]['影片']+Data[user2]['語音訊息']));//總訊息數
    var TextTotal = Data[user1]['文字']*1+Data[user2]['文字']*1;//文字總數
    var PhoneTotal = Data[user1]['電話']*1+Data[user2]['電話']*1;//總通話數
//    console.log(MaxTextDay, MaxPhoneDay, MaxLongPhoneDay);//單日訊息最多(日期)、單日最多通話(日期)、最多單日通話時間(日期)
//    console.log(dayList['text'][MaxTextDay], dayList['phone'][MaxPhoneDay], dayList['phonelong'][MaxLongPhoneDay]);//單日訊息最多(數量)、單日最多通話(數量)、最多單日通話時間(數量)
//    console.log(maxphonetimedate, maxphonetime);//單次最久通話時間(日期)、單次最久通話時間(數量)
//    console.log(dayList);//每日 訊息數量；電話數量、電話通話時間、各訊息數量
//    console.log(alltextList, MaxCtnText);//各訊息 重複出現次數(文字雲用)，最常用訊息
//    console.log(Data);//使用者1、使用者2 各類型次數
    displayResult();
    
    function UndoMsg(addMsg){
        var OldMsg = '';
        var NewMsg = '';
        switch(NowType){
            case '記事本':
                if(NowUser == user1){
                    OldMsg = user1noteList[NowUserNoteCtn];
                    NewMsg = OldMsg + '\n' + addMsg;
                    user1noteList.splice(NowUserNoteCtn, 1, NewMsg);
                }else{
                    OldMsg = user2noteList[NowUserNoteCtn];
                    NewMsg = OldMsg + '\n' + addMsg;
                    user2noteList.splice(NowUserNoteCtn, 1, NewMsg);
                }
                break;
            case '文字':
                if(NowUser == user1){
                    OldMsg = user1textList[NowUserTextCtn];
                    NewMsg = OldMsg + '\n' + addMsg;
                    user1textList.splice(NowUserTextCtn, 1, NewMsg);
                }else{
                    OldMsg = user2textList[NowUserTextCtn];
                    NewMsg = OldMsg + '\n' + addMsg;
                    user2textList.splice(NowUserTextCtn, 1, NewMsg);
                }
                alltextList[NewMsg] = alltextList[OldMsg];
                delete alltextList[OldMsg];
                break;
        }
    }
    
    function displayResult() {
        const chatTitle = document.querySelector('[chat-title]');
        const member1Name = document.querySelector('[member1-name]');
        const member2Name = document.querySelector('[member2-name]');
        const member1Message = document.querySelector('[member1-message]');
        const member2Message = document.querySelector('[member2-message]');
        const statDay = document.querySelector('[stat-day]');
        const statMessage = document.querySelector('[stat-message]');
        const statCall = document.querySelector('[stat-call]');
        const statCalltime = document.querySelector('[stat-calltime]');
        
        const member1Chart = document.querySelector('[member1-chart]');
        const member1Texts = document.querySelector('[member1-texts]');
        const member1Stickers = document.querySelector('[member1-stickers]');
        const member1Photos = document.querySelector('[member1-photos]');
        const member1Urls = document.querySelector('[member1-urls]');
        const member1Notes = document.querySelector('[member1-notes]');
        const member1Gallerys = document.querySelector('[member1-gallerys]');
        const member1Phones = document.querySelector('[member1-phones]');
        const member1Delphotos = document.querySelector('[member1-delphotos]');
        const member1Changegallerys = document.querySelector('[member1-changegallerys]');
        const member1Delgallerys = document.querySelector('[member1-delgallerys]');
        const member1Revokemsgs = document.querySelector('[member1-revokemsgs]');
        const member1Missedcalls = document.querySelector('[member1-missedcalls]');
        const member1Videos = document.querySelector('[member1-videos]');
        const member1Audios = document.querySelector('[member1-audios]');
        
        const member2Chart = document.querySelector('[member2-chart]');
        const member2Texts = document.querySelector('[member2-texts]');
        const member2Stickers = document.querySelector('[member2-stickers]');
        const member2Photos = document.querySelector('[member2-photos]');
        const member2Urls = document.querySelector('[member2-urls]');
        const member2Notes = document.querySelector('[member2-notes]');
        const member2Gallerys = document.querySelector('[member2-gallerys]');
        const member2Phones = document.querySelector('[member2-phones]');
        const member2Delphotos = document.querySelector('[member2-delphotos]');
        const member2Changegallerys = document.querySelector('[member2-changegallerys]');
        const member2Delgallerys = document.querySelector('[member2-delgallerys]');
        const member2Revokemsgs = document.querySelector('[member2-revokemsgs]');
        const member2Missedcalls = document.querySelector('[member2-missedcalls]');
        const member2Videos = document.querySelector('[member2-videos]');
        const member2Audios = document.querySelector('[member2-audios]');
        
        const maxMessageResult = document.querySelectorAll('[max-message]');
        const maxYear = document.querySelectorAll('[max-year]');
        const maxMonth = document.querySelectorAll('[max-month]');
        const maxDay = document.querySelectorAll('[max-day]');
        const maxCalltime = document.querySelectorAll('[max-calltime]');
        const maxCalltimeyear = document.querySelectorAll('[max-calltime-year]');
        const maxCalltimemonth = document.querySelectorAll('[max-calltime-month]');
        const maxCalltimeday = document.querySelectorAll('[max-calltime-day]');
        
        const maxCallctn = document.querySelectorAll('[max-callctn]');
        const maxCallctnyear = document.querySelectorAll('[max-callctn-year]');
        const maxCallctnmonth = document.querySelectorAll('[max-callctn-month]');
        const maxCallctnday = document.querySelectorAll('[max-callctn-day]');
        
        const maxCalllong = document.querySelectorAll('[max-calllong]');
        const maxCalllongyear = document.querySelectorAll('[max-calllong-year]');
        const maxCalllongmonth = document.querySelectorAll('[max-calllong-month]');
        const maxCalllongday = document.querySelectorAll('[max-calllong-day]');

        var maxIdx = (window.innerWidth) > 768 ? 0 : 1;

        chatTitle.textContent = chatname + ':';
        member1Name.textContent = user1;
        member2Name.textContent = user2;
        member1Message.textContent = (Data[user1]['文字']+Data[user1]['貼圖']+Data[user1]['照片']+Data[user1]['連結']+Data[user1]['影片']+Data[user1]['語音訊息']) + ' 則';
        member2Message.textContent = (Data[user2]['文字']+Data[user2]['貼圖']+Data[user2]['照片']+Data[user2]['連結']+Data[user2]['影片']+Data[user2]['語音訊息'])  + ' 則';
        statDay.textContent = TineGap;
        statMessage.textContent = MsgTotal;
        statCall.textContent = PhoneTotal;
        statCalltime.textContent = Datetime;

        maxlist = MaxTextDay.split(/[/（ ()]+/);//.split('/')
        maxMessageResult[maxIdx].textContent = dayList['text'][MaxTextDay] + ' 則';
        maxYear[maxIdx].textContent = maxlist[0];
        maxMonth[maxIdx].textContent = maxlist[1];
        maxDay[maxIdx].textContent = maxlist[2];

        if (PhoneTotal) {
            maxCalltimeList = MaxLongPhoneDay.split(/[/（ ()]+/);//.split('/')
            var Tmp = dayList['phonelong'][MaxLongPhoneDay].split(':');
            maxCalltime[maxIdx].textContent = Tmp[0] + '時' + Tmp[1] + '分' + Tmp[2] + '秒';
            maxCalltimeyear[maxIdx].textContent = maxCalltimeList[0];
            maxCalltimemonth[maxIdx].textContent = maxCalltimeList[1];
            maxCalltimeday[maxIdx].textContent = maxCalltimeList[2];
            
            var maxCallctnlist = MaxPhoneDay.split(/[/（ ()]+/);//.split('/')
            maxCallctn[maxIdx].textContent = dayList['phone'][MaxPhoneDay] + '次';
            maxCallctnyear[maxIdx].textContent = maxCallctnlist[0];
            maxCallctnmonth[maxIdx].textContent = maxCallctnlist[1];
            maxCallctnday[maxIdx].textContent = maxCallctnlist[2];
            
            var maxCalllongList = maxphonetimedate.split(/[/（ ()]+/);//.split('/')
            var Tmp = maxphonetime.split(':');
            if(Tmp.length === 3){
                maxCalllong[maxIdx].textContent = Tmp[0] + '時' + Tmp[1] + '分' + Tmp[2] + '秒';
            }else{
                maxCalllong[maxIdx].textContent = 0 + '時' + Tmp[0] + '分' + Tmp[1] + '秒';
            }
            maxCalllongyear[maxIdx].textContent = maxCalllongList[0];
            maxCalllongmonth[maxIdx].textContent = maxCalllongList[1];
            maxCalllongday[maxIdx].textContent = maxCalllongList[2];
        }

        member1Chart.textContent = user1;
        member1Texts.textContent = Data[user1]['文字'] + ' 文字';
        member1Stickers.textContent = Data[user1]['貼圖'] + ' 貼圖';
        member1Photos.textContent = Data[user1]['照片'] + ' 照片';
        member1Urls.textContent = Data[user1]['連結'] + ' 連結';
        member1Notes.textContent = Data[user1]['記事本'] + ' 記事本';
        member1Gallerys.textContent = Data[user1]['相簿'] + ' 相簿';
        member1Phones.textContent = Data[user1]['電話'] + ' 電話';
        member1Delphotos.textContent = Data[user1]['刪除相簿照片'] + ' 刪除相簿照片';
        member1Changegallerys.textContent = Data[user1]['更改相簿名稱'] + ' 更改相簿名稱';
        member1Delgallerys.textContent = Data[user1]['刪除相簿'] + ' 刪除相簿';
        member1Revokemsgs.textContent = Data[user1]['收回訊息'] + ' 收回訊息';
        member1Missedcalls.textContent = Data[user1]['未接來電'] + ' 未接來電';
        member1Videos.textContent = Data[user1]['影片'] + ' 影片';
        member1Audios.textContent = Data[user1]['語音訊息'] + ' 語音訊息';
        
        member2Chart.textContent = user2;
        member2Texts.textContent = Data[user2]['文字'] + ' 文字';
        member2Stickers.textContent = Data[user2]['貼圖']+ ' 貼圖';
        member2Photos.textContent = Data[user2]['照片'] + ' 照片';
        member2Urls.textContent = Data[user2]['連結'] + ' 連結';
        member2Notes.textContent = Data[user2]['記事本'] + ' 記事本';
        member2Gallerys.textContent = Data[user2]['相簿'] + ' 相簿';
        member2Phones.textContent = Data[user2]['電話'] + ' 電話';
        member2Delphotos.textContent = Data[user2]['刪除相簿照片'] + ' 刪除相簿照片';
        member2Changegallerys.textContent = Data[user2]['更改相簿名稱'] + ' 更改相簿名稱';
        member2Delgallerys.textContent = Data[user2]['刪除相簿'] + ' 刪除相簿';
        member2Revokemsgs.textContent = Data[user2]['收回訊息'] + ' 收回訊息';
        member2Missedcalls.textContent = Data[user2]['未接來電'] + ' 未接來電';
        member2Videos.textContent = Data[user2]['影片'] + ' 影片';
        member2Audios.textContent = Data[user2]['語音訊息'] + ' 語音訊息';
        
        generateDonut('myCanvas', [Data[user2]['文字'], Data[user1]['文字']], ['#7C7877', '#F0E5DE']);
        generateDonut('memberCanvas1', [Data[user1]['文字'], Data[user1]['貼圖'], Data[user1]['照片']
                                     , Data[user1]['連結'], Data[user1]['記事本'], Data[user1]['相簿']
                                     , Data[user1]['電話'], Data[user1]['刪除相簿照片'], Data[user1]['更改相簿名稱']
                                     , Data[user1]['刪除相簿'], Data[user1]['收回訊息'], Data[user1]['未接來電']
                                     , Data[user1]['影片'], Data[user1]['語音訊息']]
                                     , ['#EB9F9F', '#F0E5DE', '#7C7877', '#FFFF77', '#FF8888', '#FF77FF', '#E91E63'
                                     , '#C2D56A', '#8ABC4B', '#E5EAF1', '#4C709D', '#FFC107', '#4CAF50', '#DD0000']);
        generateDonut('memberCanvas2', [Data[user2]['文字'], Data[user2]['貼圖'], Data[user2]['照片']
                                     , Data[user2]['連結'], Data[user2]['記事本'], Data[user2]['相簿']
                                     , Data[user2]['電話'], Data[user2]['刪除相簿照片'], Data[user2]['更改相簿名稱']
                                     , Data[user2]['刪除相簿'], Data[user2]['收回訊息'], Data[user2]['未接來電']
                                     , Data[user2]['影片'], Data[user2]['語音訊息']]
                                     , ['#EB9F9F', '#F0E5DE', '#7C7877', '#FFFF77', '#FF8888', '#FF77FF', '#E91E63'
                                     , '#C2D56A', '#8ABC4B', '#E5EAF1', '#4C709D', '#FFC107', '#4CAF50', '#DD0000']);
        
        generatePlots();
        function generatePlots() {
            var fontsize = (window.innerWidth > 768) ? 18 : 12;
            var margin = (window.innerWidth > 768) ? 50 : 45;
            var memberMessage = [];
            var TmpText_user1dayList = [];
            for(var key in Data[user1]['dayList']){
                TmpText_user1dayList[TmpText_user1dayList.length] = Data[user1]['dayList'][key];
            }
            memberMessage.push({
                y: TmpText_user1dayList,
                line: { shape: 'spline', width: 3 },
                type: 'scatter',
                name: user1,
                opacity: 0.5,
                font: {
                    size: 30
                }
            });
            var TmpText_user2dayList = [];
            for(var key in Data[user2]['dayList']){
                TmpText_user2dayList[TmpText_user2dayList.length] = Data[user2]['dayList'][key];
            }
            memberMessage.push({
                y: TmpText_user2dayList,
                line: { shape: 'spline', width: 3 },
                type: 'scatter',
                name: user2,
                opacity: 0.5,
                font: {
                    size: 30
                }
            });
            
            var TmpText_dayList = [];
            for(var key in dayList['text']){
                TmpText_dayList[TmpText_dayList.length] = dayList['text'][key];
            }
            var allMessage = {
                y: TmpText_dayList,
                line: { shape: 'spline' },
                type: 'scatter'
            };
            
            var TmpPhonelong_dayList = [];
            for(var key in dayList['phonelong']){
                var TmpTime = dayList['phonelong'][key].split(':');
                TmpTime = (TmpTime[0] * 60 + TmpTime[1]) * 60 + TmpTime[2];
                TmpPhonelong_dayList[TmpPhonelong_dayList.length] = TmpTime;
            }
            var callTime = {
                y: TmpPhonelong_dayList,
                line: { shape: 'spline' },
                type: 'scatter'
            };


            var layout1 = {
                title: '每日訊息數',
                xaxis: {
                    title: '天數'
                },
                yaxis: {
                    title: '訊息數'
                },
                legend: {
                    font: {
                        size: fontsize
                    }
                },
                margin: {
                    t: margin,
                    r: margin,
                    l: margin,
                    b: margin
                }
            };

            var layout2 = {
                title: '各自訊息數',
                xaxis: {
                    title: '天數'
                },
                yaxis: {
                    title: '訊息數'
                },
                legend: {
                    font: {
                        size: fontsize
                    }
                },
                margin: {
                    t: margin,
                    r: margin,
                    l: margin,
                    b: margin
                }
            };

            var layout3 = {
                title: '每日通話秒數',
                xaxis: {
                    title: '天數'
                },
                yaxis: {
                    title: '秒'
                },
                legend: {
                    font: {
                        size: fontsize
                    }
                },
                margin: {
                    t: margin,
                    r: margin,
                    l: margin,
                    b: margin
                }
            };
            
            var allMessagePlot = [allMessage];
            Plotly.newPlot('allMessage', allMessagePlot, layout1, { displayModeBar: false });

            var eachMessagePlot = memberMessage;
            Plotly.newPlot('memberMessage', eachMessagePlot, layout2, { displayModeBar: false });

            var callTimePlot = [callTime];
            Plotly.newPlot('callTime', callTimePlot, layout3, { displayModeBar: false });
        }
        
        CreateWordCloud(alltextList, MaxCtnText);
        function CreateWordCloud(cloudlist, maxTxt){
            function random_hsl_color(min, max) {
                return 'hsl(' +
                    (Math.random() * 360).toFixed() + ',' +
                    (Math.random() * 30 + 70).toFixed() + '%,' +
                    (Math.random() * (max - min) + min).toFixed() + '%)';
            }
            var maxCtn = cloudlist[maxTxt];
            var html = '';
            var obj = (window.innerWidth > 768) ? document.getElementById('wordcloud') : document.getElementById('wordcloud-mobile');
            var obj_oL = obj.offsetLeft;
            var obj_oT = obj.offsetTop;
            var obj_W = obj.parentNode.offsetWidth;
            var obj_H = obj.parentNode.offsetHeight;
            for(var key in cloudlist){
                var item = cloudlist[key];
                var color = random_hsl_color(10, 50);
                var left = Math.floor(Math.random()*obj_W) + obj_oL;
                var top = Math.floor(Math.random()*obj_H) + obj_oT - 10;
                var MaxSize = (window.innerWidth > 768) ? 80 : 40;
                var size = Math.floor(item/maxCtn*MaxSize);
                var transform = Math.floor(Math.random()*90);
                if(size>=1){
                    var style = 'position: absolute;font-weight: bold;color: ' + color + ';left: ' + left + 'px;' + 'top: ' + top + 'px;' + 'font-size: ' + size + 'px;';
                    style += '-moz-transform:rotate(' + transform + 'deg);-webkit-transform:rotate(' + transform + 'deg);-o-transform:rotate(' + transform + 'deg);-ms-transform:rotate(' + transform + 'deg);transform:rotate(' + transform + 'deg);';
                    html += '<span style="' + style + '">' + key + '</span>'; 
                }
            }
            obj.innerHTML = html;
        }
    }
}

function findword() {
    var wordInADay = [];
    var wordNum;
    var splitedMessage = [];
    var searchbox = (window.innerWidth > 768) ? document.querySelector(".searchbox") : document.getElementById("searchbox-mobile");
    var wordtofind = searchbox.value;
    searchbox.value = "";
    var fontsize = (window.innerWidth > 768) ? 18 : 12;
    var margin = (window.innerWidth > 768) ? 50 : 45;
    var TmpEachword = [];
    for(var key in dayList['eachword'][wordtofind]){
        TmpEachword[TmpEachword.length] = dayList['eachword'][wordtofind][key];
    }
    //console.log(TmpEachword);
    var specificWord = {
        y: TmpEachword,
        line: { shape: 'spline' },
        type: 'scatter'
    };
    var wordLayout = {
        title: '每日說 ' + wordtofind + ' 次數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '次數'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };
    var wordPlot = [specificWord];
    wordplot = document.getElementById('findingWord');
    wordplot.className = "message-plot word-plot"; //remove hidden class
    Plotly.newPlot('findingWord', wordPlot, wordLayout, { displayModeBar: false });
}


/*
 * Original Code
 */
function generateDonut(id, valuelist, colorlist) {
    generatePieGraph(id, {
        values: valuelist,
        colors: colorlist,
        animation: true,
        animationSpeed: 5,
        fillTextData: true,
        fillTextColor: 'black',
        fillTextAlign: 1.35,
        fillTextPosition: 'inner',
        doughnutHoleSize: 50,
        doughnutHoleColor: '#F1BBBA',
        offset: 1,
    });
}

function analyse2() {
    lines = content.split("\n");
    length = lines.length;
    date = new RegExp("^([0-9]{4})([./]{1})([0-9]{1,2})([./]{1})([0-9]{1,2})");
    message = new RegExp("^([\u4e00-\u9fa5]{0,2})([0-9]{1,2})[:]{1}([0-9]{1,2})");
    chatname = lines[0].split(" ")[1]

    for (i = 0; i < length; i++) {
        if (date.test(lines[i].substring(0, 10))) {
            if (messageNumAll != 0) { //date
                if (messageNumAll > maxMessage) {
                    maxMessage = messageNumAll;
                    maxDate = dates[dates.length - 1];
                }
                messageInADayAll.push(messageNumAll);
                Object.keys(memberMessageList).forEach(k => memberMessageList[k].push(memberMessageNum[k]));
                Object.keys(memberMessageNum).forEach(k => memberMessageNum[k] = 0);
                messageNumAll = 0;
                adjustTime(dayTime); //call time a day
                getMaxCallTime(dayTime);
                callTimeInADay.push([dayTime.hour, dayTime.min, dayTime.sec]);
                callSecondInADay.push(dayTime.hour * 3600 + dayTime.min * 60 + dayTime.sec);
                Object.keys(dayTime).forEach(v => dayTime[v] = 0);
            }
            dates.push(lines[i]);
            totalDays++;
        }
        if (message.test(lines[i].split(/(\s+)/)[0])) { //message
            //new member
            var membername = lines[i].split(/(\s+)/)[2];
            if(!membername){
                console.log('members' + members);
                console.log('membername' + membername);
                console.log('lines' + lines[i]);
            }
            if (membername && !members.includes(membername) && (!membername.includes("收回訊息") && !membername.includes("邀請") && !membername.includes("加入") && !membername.includes("退出") && !membername.includes("更改了群組圖片") && !membername.includes("通話") && !membername.includes("相簿") && !membername.includes("群組名稱") && !membername.includes("已讓") && !membername.includes("離開"))) {
                console.log(membername)
                members.push(membername);
                memberMessageNum[membername] = 0;
                memberMessageList[membername] = new Array(dates.length - 1).fill(0);
            }
            eachMemberMessages[members.indexOf(membername)]++;
            memberMessageNum[membername]++;
            getCallTime(lines[i], dayTime); //Phone call
            getCallTime(lines[i], time);
            if (membername && (!membername.includes("收回訊息") && !membername.includes("邀請") && !membername.includes("加入") && !membername.includes("退出") && !membername.includes("更改了群組圖片") && !membername.includes("通話") && !membername.includes("相簿") && !membername.includes("群組名稱") && !membername.includes("已讓") && !membername.includes("離開"))) {
                messageNumAll++;
                totalMessages++;
            }
        }
        if (i == length - 1) { //last day
            if (messageNumAll > maxMessage) {
                maxMessage = messageNumAll;
                maxDate = lines[i];
            }
            callTimeInADay.push([dayTime.hour, dayTime.min, dayTime.sec]);
            messageInADayAll.push(messageNumAll);
            Object.keys(memberMessageList).forEach(k => memberMessageList[k].push(memberMessageNum[k]));
            Object.keys(memberMessageNum).forEach(k => memberMessageNum[k] = 0);
        }
        if (lines[i].split(/(\s+)/)[4] != undefined) {
            if (lines[i].split(/(\s+)/)[4].substring(0, 4) == "[貼圖]")
                eachMemberStickers[members.indexOf(lines[i].split(/(\s+)/)[2])]++;
            else if (lines[i].split(/(\s+)/)[4].substring(0, 4) == "[照片]")
                eachMemberPhotos[members.indexOf(lines[i].split(/(\s+)/)[2])]++;
        }
    }
    console.log(totalDays)
    console.log(totalMessages)

    for (i = 0; i < members.length; i++) {
        if (members[i] && !members[i].includes("收回訊息") && !members[i].includes("邀請") && !members[i].includes("加入") && !members[i].includes("退出") && !members[i].includes("更改了群組圖片") && !members[i].includes("通話") && !members[i].includes("相簿") && !members[i].includes("已讓") && !members[i].includes("離開")) {
            console.log(members[i])
            console.log(eachMemberMessages[i])
            console.log(eachMemberStickers[i])
            console.log(eachMemberPhotos[i])
        }
        else
            unsent += eachMemberMessages[i];
    }
    if (unsent)
        console.log("unsent", unsent)

    console.log("max", maxMessage, maxDate)

    adjustTime(time);
    console.log("Total call time : ", "normal", time.hour + " hours " + time.min + " minute " + time.sec + " second");
    console.log("Maximum Call time : ", "normal", maxCallTime[0] + " hours " + maxCallTime[1] + " minute " + maxCallTime[2] + " second on " + maxCallDate);
    console.log("Total calls : " + time.calls + " phone calls ");

    displayResult2();

    generateDonut('myCanvas', [eachMemberMessages[1], eachMemberMessages[0]], ['#7C7877', '#F0E5DE']);
    generateDonut('memberCanvas1', [eachMemberMessages[0] - eachMemberStickers[0] - eachMemberPhotos[0], eachMemberStickers[0], eachMemberPhotos[0]], ['#EB9F9F', '#F0E5DE', '#7C7877']);
    generateDonut('memberCanvas2', [eachMemberMessages[1] - eachMemberStickers[1] - eachMemberPhotos[1], eachMemberStickers[1], eachMemberPhotos[1]], ['#EB9F9F', '#F0E5DE', '#7C7877']);

    generatePlots2();

    cloudlist = WordFreqSync(options).process(content);
    cloudlist = processlist(cloudlist);
    if (window.screen.width > 768)
        WordCloud(document.getElementById('wordcloud'), { list: cloudlist, shrinktofit: true, drawOutOfBound: false });
    else
        WordCloud(document.getElementById('wordcloud-mobile'), { list: cloudlist, shrinktofit: true, drawOutOfBound: false });

}

function displayResult2() {
    const chatTitle = document.querySelector('[chat-title]')
    const member1Name = document.querySelector('[member1-name]')
    const member2Name = document.querySelector('[member2-name]')
    const member1Message = document.querySelector('[member1-message]')
    const member2Message = document.querySelector('[member2-message]')
    const statDay = document.querySelector('[stat-day]')
    const statMessage = document.querySelector('[stat-message]')
    const statCall = document.querySelector('[stat-call]')
    const statCalltime = document.querySelector('[stat-calltime]')
    const member1Chart = document.querySelector('[member1-chart]')
    const member1Texts = document.querySelector('[member1-texts]')
    const member1Stickers = document.querySelector('[member1-stickers]')
    const member1Photos = document.querySelector('[member1-photos]')
    const member2Chart = document.querySelector('[member2-chart]')
    const member2Texts = document.querySelector('[member2-texts]')
    const member2Stickers = document.querySelector('[member2-stickers]')
    const member2Photos = document.querySelector('[member2-photos]')
    const maxMessageResult = document.querySelectorAll('[max-message]')
    const maxYear = document.querySelectorAll('[max-year]')
    const maxMonth = document.querySelectorAll('[max-month]')
    const maxDay = document.querySelectorAll('[max-day]')
    const maxCalltime = document.querySelectorAll('[max-calltime]')
    const maxCalltimeyear = document.querySelectorAll('[max-calltime-year]')
    const maxCalltimemonth = document.querySelectorAll('[max-calltime-month]')
    const maxCalltimeday = document.querySelectorAll('[max-calltime-day]')

    var maxIdx = (window.screen.width) > 768 ? 0 : 1;

    chatTitle.textContent = chatname + ':'
    member1Name.textContent = members[0]
    member2Name.textContent = members[1]
    member1Message.textContent = eachMemberMessages[0] + ' 則'
    member2Message.textContent = eachMemberMessages[1] + ' 則'
    statDay.textContent = totalDays
    statMessage.textContent = totalMessages
    statCall.textContent = time.calls
    statCalltime.textContent = time.hour + '時' + time.min + '分' + time.sec + '秒'

    maxlist = maxDate.split(/[/（ ()]+/)
    maxMessageResult[maxIdx].textContent = maxMessage + ' 則'
    maxYear[maxIdx].textContent = maxlist[0]
    maxMonth[maxIdx].textContent = maxlist[1]
    maxDay[maxIdx].textContent = maxlist[2]

    if (time.calls) {
        maxCalltimeList = maxCallDate.split(/[/（ ()]+/)
        maxCalltime[maxIdx].textContent = maxCallTime[0] + '時' + maxCallTime[1] + '分' + maxCallTime[2] + '秒'
        maxCalltimeyear[maxIdx].textContent = maxCalltimeList[0]
        maxCalltimemonth[maxIdx].textContent = maxCalltimeList[1]
        maxCalltimeday[maxIdx].textContent = maxCalltimeList[2]
    }

    member1Chart.textContent = members[0]
    member1Texts.textContent = eachMemberMessages[0] - eachMemberStickers[0] - eachMemberPhotos[0] + ' 訊息'
    member1Stickers.textContent = eachMemberStickers[0] + ' 貼圖'
    member1Photos.textContent = eachMemberPhotos[0] + ' 照片'
    member2Chart.textContent = members[1]
    member2Texts.textContent = eachMemberMessages[1] - eachMemberStickers[1] - eachMemberPhotos[1] + ' 訊息'
    member2Stickers.textContent = eachMemberStickers[1] + ' 貼圖'
    member2Photos.textContent = eachMemberPhotos[1] + ' 照片'

}

function findword2() {
    var wordInADay = [];
    var wordNum;
    var splitedMessage = [];

    if (window.screen.width > 768)
        var searchbox = document.querySelector(".searchbox")
    else
        var searchbox = document.getElementById("searchbox-mobile")
    var wordtofind = searchbox.value
    searchbox.value = ""
    if (window.screen.width > 768) { //responsive on the plots
        var fontsize = 18
        var margin = 50
    }
    else {
        var fontsize = 12
        var margin = 45
    }
    for (i = 0; i < length; i++) {
        if (date.test(lines[i].substring(0, 10))) {
            wordInADay.push(wordNum);
            wordNum = 0;
        }
        if (message.test(lines[i].split(/(\s+)/)[0])) { //word
            splitedMessage = lines[i].split(/(\s+)/);
            splitedMessage.shift();
            splitedMessage.shift();
            splitedMessage.shift();
            splitedMessage.shift();
            for (j = 0; j < splitedMessage.length; j++) {
                if (splitedMessage[j].includes(wordtofind)) {
                    wordNum++;
                    break;
                }
            }
        }
        if (i == length - 1) //last day
            wordInADay.push(wordNum);
    }
    var specificWord = {
        y: wordInADay,
        line: { shape: 'spline' },
        type: 'scatter'
    };
    var wordLayout = {
        title: '每日說 ' + wordtofind + ' 次數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '次數'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };
    var wordPlot = [specificWord];
    wordplot = document.getElementById('findingWord')
    wordplot.className = "message-plot word-plot" //remove hidden class
    Plotly.newPlot('findingWord', wordPlot, wordLayout, { displayModeBar: false });
}

function generatePlots2() {
    var memberMessage = [];
    if (window.screen.width > 768) { //responsive on the plots
        var fontsize = 18
        var margin = 50
    }
    else {
        var fontsize = 12
        var margin = 45
    }

    for (i = 0; i < members.length; i++) {
        memberMessage.push({
            y: memberMessageList[members[i]],
            line: { shape: 'spline' },
            type: 'scatter',
            name: members[i],
            opacity: 0.5,
            font: {
                size: 30
            },
            line: {
                width: 3
            }
        })
    }

    var allMessage = {
        y: messageInADayAll,
        line: { shape: 'spline' },
        type: 'scatter'
    };

    var callTime = {
        y: callSecondInADay,
        line: { shape: 'spline' },
        type: 'scatter'
    };


    var layout1 = {
        title: '每日訊息數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '訊息數'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };

    var layout2 = {
        title: '各自訊息數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '訊息數'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };

    var layout3 = {
        title: '每日通話秒數',
        xaxis: {
            title: '天數'
        },
        yaxis: {
            title: '秒'
        },
        legend: {
            font: {
                size: fontsize
            }
        },
        margin: {
            t: margin,
            r: margin,
            l: margin,
            b: margin
        }
    };

    var allMessagePlot = [allMessage];
    Plotly.newPlot('allMessage', allMessagePlot, layout1, { displayModeBar: false });

    var eachMessagePlot = memberMessage;
    Plotly.newPlot('memberMessage', eachMessagePlot, layout2, { displayModeBar: false });

    var callTimePlot = [callTime];
    Plotly.newPlot('callTime', callTimePlot, layout3, { displayModeBar: false });
}
