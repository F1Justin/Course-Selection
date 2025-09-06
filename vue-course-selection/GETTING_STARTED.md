# 项目启动指南

## 环境准备

确保您的系统已安装以下软件：

1. **Node.js** (16.x 或更高版本)
2. **npm** (7.x 或更高版本)

## 初始化项目

1. 进入项目目录：

```bash
cd vue-course-selection
```

2. 安装依赖：

```bash
npm install
```

## 数据处理

在开发或构建前，需要将CSV数据转换为JSON格式：

```bash
npm run preprocess
```

这将执行`scripts/csv-to-json.js`脚本，将`source.csv`文件转换为`public/data/courses.json`和`public/data/filters.json`文件。

## 本地开发

启动开发服务器：

```bash
npm run dev
```

这将启动一个开发服务器，通常在`http://localhost:3000`访问。

## 构建与部署

1. 构建生产版本：

```bash
npm run build
```

2. 预览构建结果：

```bash
npm run preview
```

3. 部署到Vercel（如果已安装Vercel CLI）：

```bash
vercel
```

或者部署到生产环境：

```bash
vercel --prod
```

## 项目结构说明

```
vue-course-selection/
├── public/               # 静态资源目录
│   └── data/             # JSON数据文件
│       ├── courses.json  # 课程数据
│       └── filters.json  # 筛选器选项数据
├── scripts/              # 脚本目录
│   └── csv-to-json.js    # CSV转JSON数据处理脚本
├── src/                  # 源代码目录
│   ├── assets/           # 资源文件（样式、图片等）
│   ├── components/       # Vue组件
│   ├── store/            # Pinia状态管理
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图组件
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口
├── .env                  # 环境变量
├── .gitignore            # Git忽略文件
├── index.html            # HTML入口
├── package.json          # 项目配置
├── README.md             # 项目说明
├── source.csv            # 源数据文件
├── vercel.json           # Vercel配置
└── vite.config.js        # Vite配置
```

## 自定义与扩展

- 修改样式：编辑`src/assets/main.scss`文件
- 添加新功能：在`src/components/`目录下创建新的组件
- 修改数据处理逻辑：编辑`scripts/csv-to-json.js`文件 