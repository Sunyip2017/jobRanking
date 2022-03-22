const request = require("request");
// const iconv = require('iconv-lite')
const http = require("http");
const _ = require("loadsh");

const BEST_ZAN_NUM = 2; // 最佳默认点赞数前2名角逐
const WORST_ZAN_NUM = 4; // 最差默认点赞数后4名角逐

const BASE_URL = "http://test9.rcmtm.cn";

const USERDATA = {
  env: "dev",
  username: "164674",
  password: "123",
};
let token = null; // 存储token
/**
 * 开发组
 * 晓春 33
 * 小萌 41
 * 守洁 30
 * 潇潇 29
 * 法兹 43
 * 仇哥 28
 * 双姐 35
 * 鹏   31
 * 阿旭 34
 */

const group_1 = [
  { userId: 33 },
  { userId: 41 },
  { userId: 30 },
  { userId: 29 },
  { userId: 43 },
  { userId: 28 },
  { userId: 35 },
  { userId: 31 },
  { userId: 34 },
];
/**
 * 云姐 38
 * 松哥 42
 * 大萌 11
 * 欣姐 68
 * 忠哥 13
 * 阿萍 26
 *
 */
const group_2 = [
  { userId: 38 },
  { userId: 42 },
  { userId: 11 },
  { userId: 68 },
  { userId: 13 },
  { userId: 26 },
];

function handleGroup(type) {
  let group = [];
  if (type === "k") {
    group = group_2; // 开发组排除group_2
  } else {
    group = group_1;
  }
  return group;
}
function handleSlice(l, zanType) {
  let s = [];
  if (zanType === "b") {
    // 最佳
    var slice0 = l.length - BEST_ZAN_NUM;
    // 提取点赞数最高的两位
    s = _.slice(l, slice0);

  } else {
    // 提取点赞数最少的4位
    s = _.slice(l, 0, WORST_ZAN_NUM);
  }
  return s;
}
function handleMes(type, s, zanType) {
  let mes = "";
  if (zanType === "b") {
    // 比较分数-分数高者胜
    let z = _.maxBy(s, function (item) {
      return item.likedNum + item.level;
    });
    mes =
      type === "k" ? "开发组本周最佳: " + z.name : "非开发组本周最佳: " + z.name;
  } else {
    // 比较分数-分数低者胜
    let z = _.minBy(s, function (item) {
      return item.likedNum + item.level;
    });
    mes =
      type === "k" ? "开发组本周不佳: " + z.name : "非开发组本周不佳: " + z.name;
  }

  return mes;
}

// 排名结果
function handlePm(userData, type = "k", zanType = "b") {
  let group = handleGroup(type);
  let g = _.differenceBy(userData, group, "userId");
  // 根据点赞数排序
  let l = _.sortBy(g, ['likedNum','level']);
  // 分割数组
  let s = handleSlice(l, zanType);
  let mes = handleMes(type, s, zanType);
  return mes;
}

let url =
  BASE_URL +
  "/login?env=" +
  USERDATA.env +
  "&username=" +
  USERDATA.username +
  "&password=" +
  USERDATA.password;

const app = http.createServer(function (req, res) {
  request.post(
    {
      url,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        token = JSON.parse(body).data;
        request.get(
          {
            url: BASE_URL + "/team/projectteam/members",
            headers: {
              Authorization: token,
            },
          },
          function (err, response2, b) {
            if (!err && response2.statusCode == 200) {
              let userData = JSON.parse(b).data;
              res.writeHead("200", {
                "Content-Type": "text/html;charset=utf-8",
              });
              // 一组
              let mes = handlePm(userData);
              let mes2 = handlePm(userData, "k", "f");
              // 二组
              let mes3 = handlePm(userData, "f");
              let mes4 = handlePm(userData, "f", "f");

              let str =
                mes + "<br/>" + mes2 + "<br/><br/>" + mes3 + "<br/>" + mes4;
              res.end(str);
            }
          }
        );
      }
    }
  );
});

app.listen(3000, function () {
  console.log("启动成功");
});
