import crc32 from 'crc/crc32'; // moudle: jssha crc md5
import fs from 'fs';
import path from 'node:path';
import * as XLSX from 'xlsx/xlsx.mjs';
import ProgressBar from 'progress';

// 声明全局变量
let g_var = {
    "duplicateCount" : 0,  //重复文件数量
    "moveCount" : 0, //已移动文件数量
    "xlsx": "Presidents.xlsx"
}
let g_infoList = [];
let workPath = "C:\\Users\\OC\\Documents\\WeChat Files\\wxid_d7iosrx8evpj22\\FileStorage\\File\\2023-07"

if (process.argv[2])
{
    console.log(process.argv[2]);
    workPath = process.argv[2]
}

if (fs.existsSync(path.join(workPath, "remove", g_var.xlsx)))
{
    console.log("this shell had worked. file exist:", path.join(workPath, "remove", g_var.xlsx));
    process.exit(0)
}


// 获取文件目录
function fetchFileList(basePath, inputList) {
    var baseStat = fs.statSync(basePath);
    if (baseStat.isDirectory) {
        var childList = fs.readdirSync(basePath)
        childList.forEach(element => {
            let childPath = path.join(basePath, element)
            let childStat = fs.statSync(childPath)
            if (childStat.isFile()) {
                inputList.push({
                    "size": childStat.size,
                    "path": childPath
                })
            } else {
                fetchFileList(childPath, inputList)
            }
        });
    } else {
        inputList.push({
            "size": baseStat.size,
            "path": basePath
        })
    }
}

fetchFileList(workPath, g_infoList)

//计算校验码
for (let info of g_infoList) {
    if (info.size <= 10 * 1024 * 1024) {
        info.crc = crc32(fs.readFileSync(info.path)).toString(16);
    } else {
        info.crc = "-"
    }
    info.duplicate = false
}



//标记重复项目
for (let i = 0; i < g_infoList.length; i++) {
    let info = g_infoList[i];
    if (info.duplicate || info.crc === "-") {
        continue
    } else {
        info.duplicate = 0;
        for (let j = i + 1; j < g_infoList.length; j++) {
            if (info.size == g_infoList[j].size && info.crc == g_infoList[j].crc) {
                g_infoList[j].duplicate = 1;
                ++g_var.duplicateCount;// 记录重复文件数量
            }
        }
    }
}


// 导出重复文件到表格
XLSX.set_fs(fs);
const worksheet = XLSX.utils.json_to_sheet(g_infoList);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
if (!fs.existsSync(path.join(workPath, "remove")))
{
    fs.mkdirSync(path.join(workPath, "remove"))
}
XLSX.writeFile(workbook, path.join(workPath, "remove", g_var.xlsx));


// g_var.moveCount = 0;
const g_bar = new ProgressBar('downloading [:bar] :total :percent :etas', { total: g_var.duplicateCount });

// 移动文件
for (const info of g_infoList) {
    if (info.duplicate) {
        let basename = path.win32.basename(info.path);
        let newname = path.join(workPath, "remove", basename)
        fs.rename(info.path, newname, (err) => {
            if (err){
                throw err
                // bar.interrupt
            } else {
                g_bar.tick();
                if (g_bar.complete)
                {
                    console.log("\n finish!");
                }
                // ++g_var.moveCount
            }
        })
    }
}