import crc32 from 'crc/crc32'; // moudle: jssha crc md5
import fs from 'fs';
import path from 'node:path';
import * as XLSX from 'xlsx/xlsx.mjs';
import ProgressBar from 'progress';

// 声明全局变量
let g_var = {
    "duplicateCount": 0,  //重复文件数量
    "moveCount": 0, //已移动文件数量
    "xlsx": "Presidents.xlsx",
    "removeDir": "remove"
}
let g_infoList = [];
let g_fileList = [];
let workPath = "C:\\Users\\OC\\Documents\\WeChat Files\\wxid_3fm3074u7s3b22\\FileStorage\\File\\2022-04";

function fetchFileList(basePath, fileList, skipDir) {
    var baseStat = fs.statSync(basePath);
    if (baseStat.isDirectory) {
        var childList = fs.readdirSync(basePath)
        childList.forEach(element => {
            let childPath = path.join(basePath, element)
            let childStat = fs.statSync(childPath)
            if (childStat.isFile()) {
                fileList.push({
                    "size": childStat.size,
                    "path": childPath
                })
            } else if (!(element === skipDir)) { // 计算除了remove以外的文件夹
                fetchFileList(childPath, fileList, skipDir)
            }
        });
    } else {
        fileList.push({
            "size": childStat.size,
            "path": childPath
        });
    }
}

function readFileTest(filePath, size) {
    var value = 0;
    var chunk;
    var rs = fs.createReadStream(filePath);
    rs.on('readable', function () {
        while ((chunk = rs.read(1024 * 1024 * 4)) != null) {
            if (value == 0) {
                value = crc32(chunk)
            } else {
                value = crc32(chunk, value);
            }
        }
    });
    rs.on('end', function () {
        // console.log(filePath, "crc:", value.toString(16))
        updateInfoList(filePath, size, value.toString(16))
    });
};

// 从命令行参数中获取工作路径
if (process.argv[2]) {
    console.log(process.argv[2]);
    workPath = process.argv[2]
} else {
    console.log("work:\nnode [shellName] [workPath] [-f]");
}

// 若不强制工作，且已经工作过一次则退出
if (!("-f" === process.argv[3]) && fs.existsSync(path.join(workPath, g_var.removeDir, g_var.xlsx))) {
    console.log("this shell had worked. file exist:", path.join(workPath, g_var.removeDir, g_var.xlsx));
    process.exit(0)
}

// 获取文件目录
fetchFileList(workPath, g_fileList, g_var.removeDir);
const crcBar = new ProgressBar('crc [:bar] :current / :total :percent :elapseds', { total: g_fileList.length , width: 50});

//计算校验码
for (let file of g_fileList) {
    if (file.size <= 10 * 1024 * 1024) {
        let crc = crc32(fs.readFileSync(file.path)).toString(16);
        updateInfoList(file.path, file.size, crc);
    } else {
        readFileTest(file.path, file.size);
    }
}

function updateInfoList(filePath, size, crc) {
    g_infoList.push({
        "size":size,
        "path":filePath,
        "crc":crc,
        "duplicate": 0
    });
    crcBar.tick();
    if (g_infoList.length == g_fileList.length) {
        workWithCrc();
    }
}

function workWithCrc() {
    console.log("workWithCrc");
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
    if (!fs.existsSync(path.join(workPath, g_var.removeDir))) {
        fs.mkdirSync(path.join(workPath, g_var.removeDir))
    }
    XLSX.writeFile(workbook, path.join(workPath, g_var.removeDir, g_var.xlsx));
    
    const bar = new ProgressBar('move [:bar] :current / :total :percent :etas', { total: g_var.duplicateCount , width: 50});
    // 移动文件
    for (const info of g_infoList) {
        if (info.duplicate) {
            let basename = path.win32.basename(info.path);
            let newname = path.join(workPath, g_var.removeDir, basename)
            fs.rename(info.path, newname, (err) => {
                if (err) {
                    throw err
                    // bar.interrupt
                } else {
                    bar.tick();
                    if (bar.complete) {
                        console.log("\n finish!");
                    }
                    // ++g_var.moveCount
                }
            })
        }
    }
}

