# 课程展示与筛选系统

这是一个基于Vue 3和PrimeVue的现代化课程信息展示与筛选系统。该系统提供了友好的用户界面，允许用户通过多种条件筛选课程信息，包括课程性质、校区、开课学院以及课程时间安排等。

## 功能特点

- 🔍 **多条件筛选**: 支持按课程性质、校区、开课学院进行筛选
- 📅 **课程表时间筛选**: 直观的课程时间表界面，点击即可筛选特定时间段的课程
- 🔤 **文本搜索**: 支持在所有课程信息中进行文本搜索
- 📱 **响应式设计**: 完全适配移动端和桌面设备的界面布局
- 🌙 **暗色模式**: 自动适应系统的暗色模式设置
- ⚡ **性能优化**: 高效的数据加载和筛选机制，提供流畅的用户体验

## 技术栈

- **前端框架**: Vue.3.3+ (Composition API)
- **UI组件库**: PrimeVue 3.53+
- **状态管理**: Pinia
- **构建工具**: Vite
- **样式**: SCSS + PrimeFlex

## 开发

### 环境要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 数据格式

系统使用以下JSON文件作为数据源：

- `public/data/courses.json`: 包含所有课程信息的详细数据
- `public/data/filters.json`: 包含筛选选项数据，如课程性质、校区、开课学院等列表

## 部署

该项目可以部署到任何静态网站托管服务，如Vercel、Netlify、GitHub Pages等。只需执行构建命令，然后部署生成的`dist`目录即可。

## 在线演示

项目已部署到Vercel，可访问以下链接：
- [课程展示与筛选系统 - PrimeVue版](https://course-selection-2hqn0na4d-f1justins-projects.vercel.app)

## 许可证

MIT
