# 通济 - 模拟选课系统（Vue）

面向同济课程数据的课程筛选与“模拟选课”工具：支持按条件筛选、按时间网格筛选、选课与退选、冲突检测与高亮、已选清单与预览等。

在线演示（若部署可用）：[课程展示与筛选系统 - PrimeVue版](https://course-selection-2hqn0na4d-f1justins-projects.vercel.app)

## 功能概览

- **多条件筛选**：课程性质 / 校区 / 开课学院 / 全文搜索
- **时间网格筛选**：按星期 × 节次范围筛选，支持“常用/全部时段”切换
- **模拟选课**：在列表中选课/退选；基于“周次 + 节次重叠”做冲突检测并高亮
- **已选课程**：本地持久化（`localStorage`）；支持预览视图
- **长文本展示**：单元格截断 + 点击弹出完整内容
- **主题**：跟随系统深色模式

## 技术栈

- **框架**：Vue 3（Composition API）
- **构建**：Vite
- **状态管理**：Pinia
- **UI**：PrimeVue / PrimeFlex / SCSS

## 仓库结构

本仓库的可运行工程位于 `vue-course-selection/`（根目录仅保留仓库级配置，例如 `vercel.json` 与许可证等）。

```
Course-Selection/
├── README.md
├── LICENSE
├── vercel.json                # 可选：让 Vercel 从仓库根目录构建子项目
└── vue-course-selection/       # 主项目（Vite + Vue3）
    ├── package.json
    ├── vite.config.js
    ├── scripts/csv-to-json.js  # CSV -> JSON 预处理
    ├── public/data/            # 运行时数据（courses/filters/timeSlots）
    └── src/                    # 应用代码
```

## 本地开发

在 `vue-course-selection/` 目录下执行：

```bash
npm ci
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

## 数据源与预处理（CSV -> JSON）

应用运行时从 `vue-course-selection/public/data/` 读取：

- `courses.json`：课程列表（包含 `schedule` 与 `parsedTimeSlots`）
- `filters.json`：筛选项（课程性质 / 校区 / 开课学院）
- `timeSlots.json`：全量节次范围集合（如 `9-10`、`5-7`）

如需从 CSV 重新生成上述 JSON：

```bash
npm run preprocess
```

`scripts/csv-to-json.js` 会在子项目目录内按如下优先级寻找 CSV：

1. `26春课表.csv`
2. `2025秋课表.csv`
3. `source.csv`

## 部署（Vercel）

### 方式 A：Vercel Dashboard 指向子项目（推荐）

- **Root Directory**：`vue-course-selection`
- **Install Command**：`npm ci`
- **Build Command**：`npm run build`
- **Output Directory**：`dist`

### 方式 B：不改 Root Directory，使用仓库根 `vercel.json`

根目录 `vercel.json` 已配置为在构建时进入 `vue-course-selection/` 安装与构建，并将输出目录指向 `vue-course-selection/dist`，同时包含 SPA 路由重写规则。

## 许可证

本项目使用 **CC0 1.0（Creative Commons Zero）**，详见 `LICENSE`。
