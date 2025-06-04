const fs = require('fs');
const path = require('path'); // 引入 path 模块

// 确保目标目录存在
const outputDir = path.join('public', 'data');
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`创建目录: ${outputDir}`);
}

// CSV解析函数
function parseCSVLine(line) {
    const result = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }
        if (char === ',' && !inQuotes) {
            result.push(cell.trim());
            cell = '';
        } else {
            cell += char;
        }
    }
    result.push(cell.trim());
    return result;
}

// 新增：解析课程时间字符串，提取时间段
function parseScheduleTimeSlots(scheduleString) {
    if (!scheduleString) return [];
    const slots = new Set();
    // 课程时间可能由多个部分组成，以逗号分隔
    const parts = scheduleString.split(','); 

    parts.forEach(part => {
        // 匹配 "数字-数字节" 或 "数字-数字节" (可能前面有星期几)
        // 例如: "星期一1-2节", "3-4节", "星期三10-12节"
        const match = part.match(/(?:星期[一二三四五六日])?(\d{1,2}-\d{1,2})节/);
        if (match && match[1]) {
            slots.add(match[1]);
        }
    });
    return Array.from(slots);
}

// 读取CSV文件
console.log('开始读取CSV文件...');
const csvData = fs.readFileSync('source.csv', 'utf8');
const rows = csvData.split("\n");
console.log(`CSV文件读取完成，共${rows.length}行`);

// 处理数据
const courseData = [];
const validCourseNatures = [
    "通识选修课", "通识必修课", "社会发展与国际视野", "人文经典与审美素养",
    "科学探索与生命关怀", "工程能力与创新思维", "必修课程", "公共课",
    "专业基础课", "专业选修课", "专业必修课", "实践环节", "实践环节课程",
    "公共基础课", "个性化课程"
];
const validCampuses = ["四平路校区", "嘉定校区", "沪西校区", "沪北校区"];

let currentDepartment = "";
const allTimeSlots = new Set(); // 用于收集所有唯一的时间段

console.log('开始处理数据...');
for (let i = 0; i < rows.length; i++) {
    const row = parseCSVLine(rows[i]);
    
    if (row[0] && row.slice(1).every(cell => cell === "")) {
        currentDepartment = row[0];
    } else if (row[0] && row[1]) {
        const courseNature = row[7];
        const campus = row[9];

        if (!validCourseNatures.includes(courseNature) || !validCampuses.includes(campus)) {
            continue;
        }

        const rawSchedule = row[14];
        const parsedTimeSlots = parseScheduleTimeSlots(rawSchedule);
        parsedTimeSlots.forEach(slot => allTimeSlots.add(slot));

        courseData.push({
            courseId: row[0],
            courseName: row[1],
            weeklyHours: row[2],
            leader: row[3],
            teachers: row[4],
            courseNature: row[7],
            language: row[8],
            campus: row[9],
            department: currentDepartment,
            auditInfo: row[10],
            schedule: rawSchedule.replace(/\s+/g, ''), // 保留原始的、去空格的 schedule 字符串
            parsedTimeSlots: parsedTimeSlots // 新增解析后的时间段
        });
    }
    
    if (i % 1000 === 0) {
        console.log(`已处理 ${i}/${rows.length} 行...`);
    }
}
console.log(`数据处理完成，共提取了 ${courseData.length} 条课程记录`);

// 生成筛选器数据
const filterData = {
    courseNatures: [...new Set(courseData.map(item => item.courseNature))].sort(),
    campuses: [...new Set(courseData.map(item => item.campus))].sort(),
    departments: [...new Set(courseData.map(item => item.department))].sort(),
    // timeSlots: [...allTimeSlots].sort() // 将时间段也加入到 filters.json 中 (或者单独文件)
};

console.log('开始写入JSON文件...');
// 将所有数据写入一个文件
fs.writeFileSync('public/data/courses.json', JSON.stringify(courseData));
// 将筛选器数据写入单独文件
fs.writeFileSync('public/data/filters.json', JSON.stringify(filterData));
// 新增：将唯一时间段写入 timeSlots.json
fs.writeFileSync('public/data/timeSlots.json', JSON.stringify([...allTimeSlots].sort((a, b) => {
    // 自定义排序逻辑，例如按起始节数排序，然后按结束节数排序
    const [aStart, aEnd] = a.split('-').map(Number);
    const [bStart, bEnd] = b.split('-').map(Number);
    if (aStart !== bStart) {
        return aStart - bStart;
    }
    return aEnd - bEnd;
})));

console.log('数据处理和JSON文件生成完成'); 