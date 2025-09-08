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

// 读取CSV（支持多行单元格：按引号配对拼接行）
function readCSVRecords(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const records = [];
    let buffer = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (buffer.length === 0) buffer = line; else buffer += "\n" + line;
        const quoteCount = (buffer.match(/"/g) || []).length;
        if (quoteCount % 2 === 0) {
            // 引号配对完成，作为一条记录
            records.push(parseCSVLine(buffer));
            buffer = '';
        }
    }
    if (buffer.length > 0) {
        records.push(parseCSVLine(buffer));
    }
    return records;
}

// 首选新版CSV文件名，找不到则回退到 source.csv
console.log('开始读取CSV文件...');
const candidateFiles = ['2025秋课表.csv', 'source.csv'];
let inputFile = candidateFiles.find(f => fs.existsSync(f));
if (!inputFile) {
    console.error('未找到可用的CSV文件：2025秋课表.csv 或 source.csv');
    process.exit(1);
}
console.log(`使用文件: ${inputFile}`);
const rows = readCSVRecords(inputFile);
console.log(`CSV文件读取完成，共${rows.length}条记录（含标题与分隔行）`);

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
// 基于表头映射列索引
function buildHeaderMap(headerRow) {
    const map = {};
    headerRow.forEach((name, idx) => {
        map[name] = idx;
    });
    return map;
}

// 寻找表头行（包含关键列名）
let header = null;
let headerIndex = -1;
for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.includes('课程序号') && row.includes('课程名称')) {
        header = row;
        headerIndex = i;
        break;
    }
}
if (!header) {
    console.error('未找到表头行，无法解析。');
    process.exit(1);
}
const headerMap = buildHeaderMap(header);

// 常用列名（新旧兼容）
const COL = {
    newCourseId: headerMap['新课程序号'],
    courseId: headerMap['课程序号'] ?? headerMap['课程号'] ?? 1,
    courseName: headerMap['课程名称'],
    weeklyHours: headerMap['周学时'],
    leader: headerMap['负责人'],
    teachers: headerMap['授课教师'],
    courseNature: headerMap['课程性质'],
    language: headerMap['授课语言'],
    campus: headerMap['校区'],
    auditInfo: headerMap['听课专业'],
    startWeek: headerMap['起始周'],
    endWeek: headerMap['结束周'],
    schedule: headerMap['排课信息']
};

for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    // 学院分隔行：第一列有值，其余多为空
    if (row[0] && row.slice(1).every(cell => cell === '')) {
        currentDepartment = row[0];
        continue;
    }
    // 跳过空行
    if (row.every(cell => cell === '')) continue;

    // 数据行需要至少课程号和名称
    if (!(row[COL.courseId] && row[COL.courseName])) continue;

    const courseNature = row[COL.courseNature] || '';
    const campus = row[COL.campus] || '';
    if (!validCourseNatures.includes(courseNature) || !validCampuses.includes(campus)) {
        continue;
    }

    const rawSchedule = row[COL.schedule] || '';
    const normalizedSchedule = rawSchedule.replace(/\s+/g, '');
    const parsedTimeSlots = parseScheduleTimeSlots(normalizedSchedule);
    parsedTimeSlots.forEach(slot => allTimeSlots.add(slot));

    courseData.push({
        newCourseId: COL.newCourseId !== undefined ? (row[COL.newCourseId] || '') : '',
        courseId: row[COL.courseId] || '',
        courseName: row[COL.courseName] || '',
        weeklyHours: row[COL.weeklyHours] || '',
        leader: row[COL.leader] || '',
        teachers: row[COL.teachers] || '',
        courseNature: courseNature,
        language: row[COL.language] || '',
        campus: campus,
        department: currentDepartment,
        auditInfo: row[COL.auditInfo] || '',
        schedule: normalizedSchedule,
        parsedTimeSlots: parsedTimeSlots
    });

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