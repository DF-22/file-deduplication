import crc32 from 'crc/crc32';
import fs from 'fs';

function readFileTest(filePath){
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
            console.log(value.toString(16));
        }
    });
    rs.on('end', function () {
        
        console.log(filePath, "crc:", value.toString(16))

    });
};

readFileTest('C:\\Users\\OC\\Documents\\WeChat Files\\wxid_3fm3074u7s3b22\\FileStorage\\File\\2023-07\\2023.07.02王庄镇古柳树村支部过硬星.doc')
readFileTest('C:\\Users\\OC\\Documents\\WeChat Files\\wxid_3fm3074u7s3b22\\FileStorage\\File\\2023-07\\全县已上图入库设施农用地项目明细表.xlsx')

console.log("*************");
