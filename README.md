# 依依服装销售 · 大码女装电商平台

面向大码女装的多角色电商系统，采用前后端分离架构，包含 **PC 管理后台**、**移动端商城**、**REST API 服务** 三部分，支持管理员、运营、客服、商家、买家五种角色协同。

---

## 技术栈

**后端**

- Node.js + Express 5，RESTful API
- MySQL 8.0（`mysql2` 驱动，utf8mb4）
- Redis（`ioredis`，用于权限与数据缓存，可关闭）
- JWT 身份认证 + `bcryptjs` 密码加密
- Socket.io 实时通信（客服聊天）
- `sharp` 图片处理、`multer` 文件上传
- `winston` 日志、`swagger-ui-express` 接口文档

**管理后台（frontend）**

- Vue 3 + Vite 4
- Element Plus 组件库（按需自动导入）
- Pinia 状态管理、Vue Router
- ECharts 数据可视化、Socket.io Client

**移动端商城（uiapp）**

- uni-app（Vue 3）多端框架，基于 `@uni-helper/unh` 构建
- 可编译为 H5、微信小程序及其他小程序平台
- Vant 组件库、`vue-i18n` 国际化

---

## 项目结构

```
project/
├── backend/        # Node.js + Express 后端服务
│   ├── config/         # 数据库、Redis、JWT、日志配置
│   ├── controllers/    # 业务控制器
│   ├── routes/         # 路由定义（含 mobile 移动端专用路由）
│   ├── middleware/     # 鉴权、限流、参数校验
│   ├── services/       # 业务服务层
│   ├── db/             # 建表脚本与增量迁移（migrations）
│   ├── jobs/           # 定时任务
│   └── index.js        # 服务入口，挂载全部路由与 Socket.io
├── frontend/       # Vue 3 管理后台（管理员 / 商家）
├── uiapp/          # uni-app 移动端商城（买家）
├── docs/           # 部署手册、测试用例、UML 时序图
├── sucai/          # 商品图素材
└── web.sql         # 数据库完整建表与初始化脚本
```

---

## 功能模块

- **多角色权限体系**：超级管理员 / 运营人员 / 客服人员 / 商家 / 买家，基于 RBAC 的细粒度权限（`product:view`、`order:ship` 等），权限数据支持 Redis 缓存
- **商品管理**：商品增删改查、上下架、多级分类、品牌管理、热销商品、新品推荐、专区
- **订单全流程**：购物车、下单、支付、发货、确认收货、退款与售后
- **营销中心**：优惠券创建与发放、满减规则
- **互动社区**：商品评价、讨论区、收藏、浏览足迹、店铺关注
- **客户服务**：Socket.io 实时聊天、内部消息通知
- **审核流程**：商家实名认证申请与审核、店铺入驻
- **数据统计**：销售趋势、用户增长、商品排行（ECharts 可视化）
- **系统能力**：操作审计日志、接口限流、统一错误处理

---

## 快速开始

### 环境要求

- Node.js 18.0 及以上
- MySQL 8.0 及以上
- Redis 6.0 及以上（可选，不装可在配置中关闭）

### 1. 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入表结构与初始数据
mysql -u root -p web < web.sql
```

导入后修改 `backend/config/index.js` 中的数据库连接参数，改成你自己的 MySQL 账号密码。

### 2. 启动后端

```bash
cd backend
npm install
npm run dev
```

服务运行在 `http://localhost:3000`，健康检查接口 `http://localhost:3000/api/health`。

> 不使用 Redis 时，将 `backend/config/index.js` 里的 `redis.enabled` 改为 `false`。

### 3. 启动管理后台

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`，已配置 `/api` 代理指向后端 3000 端口。

### 4. 启动移动端（可选）

```bash
cd uiapp
npm install
npm run dev
```

默认编译为 H5，具体访问地址以终端输出为准；如需小程序端，按 `unh` 的平台参数切换。

---

## 默认账号

| 角色 | 账号 | 密码 | 登录入口 |
| --- | --- | --- | --- |
| 超级管理员 | `admin` | `admin123` | `http://localhost:5173` |

管理员账号异常时，可执行重置脚本：

```bash
cd backend
npm run fix-admin-account
```

买家账号在移动端自行注册；商家账号由管理员在后台创建，或经实名认证审核后生成。

---

## 主要接口

所有接口以 `/api` 为前缀，部分按端拆分（`/api/mobile/*` 为移动端专用）。

| 模块 | 接口示例 |
| --- | --- |
| 认证 | `POST /api/auth/login`、`POST /api/admin/login`、`POST /api/mobile/users/register` |
| 商品 | `GET /api/products`、`POST /api/products`、`PUT /api/products/:id` |
| 订单 | `GET /api/orders`、`POST /api/orders`、`PUT /api/orders/:id` |
| 店铺 | `GET /api/shops`、`POST /api/shops` |
| 优惠券 | `/api/coupons`、`/api/mobile/coupons` |
| 售后 | `/api/after-sales`、`/api/mobile/after-sales` |
| 消息 | `/api/conversations`、`/api/messages` |
| 统计 | `GET /api/statistics` |
| 文件 | `POST /api/upload`，静态资源 `/uploads` |

完整接口说明见 `docs/系统部署与使用手册.md`。

---

## 部署说明

生产环境建议：前端 `npm run build` 产物交由 Nginx 托管，`/api` 与 `/socket.io` 反向代理到后端；后端使用 PM2 守护进程。详细的 Nginx 配置、数据库备份与常见问题排查，参见 `docs/系统部署与使用手册.md`。

## 已知事项

- `backend/config/index.js` 中的数据库密码与 JWT 密钥为本地开发默认值，正式部署前应改为读取环境变量，避免入库泄露
- `node_modules`、`dist`、`logs`、`backend/uploads` 已通过 `.gitignore` 排除，不纳入版本管理
- 数据库增量结构变更脚本位于 `backend/db/migrations/`，可单独执行
