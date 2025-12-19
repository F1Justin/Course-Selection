# 通济 - 选课系统（Vue）

使用 Vue 3 + PrimeVue 构建的课程筛选与选课模拟工具，支持按条件筛选、时间网格筛选、选课模拟与冲突高亮、已选课程列表等功能。

## 项目结构（重要）

本仓库**仅保留一个正在使用的版本**：`vue-course-selection/`（Vite + Vue 3 + Pinia）。

根目录不再是可运行工程；请始终进入 `vue-course-selection/` 进行开发与构建。

核心功能：
- 多条件筛选：课程性质/校区/开课学院/全文搜索
- 时间网格筛选：按星期与节次筛选，常用/全部时段切换
- 选课模拟：在课程表内选择/退选；自动检测并高亮时间冲突
- 已选课程列表：集中查看、退选、快捷跳转“课程评价”
- 长文本优化：单元格默认显示 4 行，点击弹出完整信息
- 本地持久化：已选课程保存至浏览器 localStorage
- 深色模式：跟随系统主题

## 快速开始

1) 进入子项目并安装依赖

```bash
cd vue-course-selection
npm ci
```

2) 启动开发服务器

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

3) 生产构建与预览

```bash
npm run build
npm run preview
```

## 数据与预处理

- 运行时数据位于子项目 `public/data/`：
  - `courses.json`：课程列表（包含 `parsedTimeSlots`）
  - `filters.json`：筛选项
  - `timeSlots.json`：所有可用时间段
- 如需从 CSV 重新生成数据（子项目目录内优先读取 `26春课表.csv`，否则回退到 `2025秋课表.csv` 或 `source.csv`）：

```bash
cd vue-course-selection
npm run preprocess
```

脚本 `scripts/csv-to-json.js` 会解析排课信息，生成上述 JSON 文件。

## 在线预览 / 部署

- 构建产物位于 `vue-course-selection/dist/`，可直接部署到任意静态托管平台（如 Vercel、Netlify、GitHub Pages 等）。

### Vercel 自动部署如何改配置（两种方式）

#### 方式 A（推荐）：在 Vercel Dashboard 里把 Root Directory 指到子项目

- **Root Directory**：`vue-course-selection`
- **Install Command**：`npm ci`
- **Build Command**：`npm run build`
- **Output Directory**：`dist`

这种方式下，Vercel 会以 `vue-course-selection/` 作为项目根目录，读取其中的 `package.json` 与 `vercel.json`（用于 SPA 路由重写）。

#### 方式 B：不改 Root Directory，让 Vercel 从仓库根目录构建

仓库根目录提供了 `vercel.json`，会自动：

- `cd vue-course-selection && npm ci`
- `cd vue-course-selection && npm run build`
- 输出目录为 `vue-course-selection/dist`

适合你不方便改 Dashboard 设置、或希望配置完全放在仓库里管理的场景。

## 许可证

Creative Commons Zero License
