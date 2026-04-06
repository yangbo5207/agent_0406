# agent_0406

一个最小可运行结构的 turborepo demo。

## 目录

- `apps/web`：Next.js 客户端
- `apps/admin`：Next.js 后台管理
- `apps/server`：NestJS 服务端

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
```

默认端口：

- `web`: 3000
- `admin`: 3001
- `server`: 3002

## Server 技术选型基线

`apps/server` 的基础方向先确定为：

- 框架：`NestJS`
- 数据库：`PostgreSQL`
- ORM：`Prisma`

这是当前项目后续开发的默认基线。下面这些项目分为两类：

- 已确定方向，后续开发时按需逐步接入
- 尚未实现，但默认推荐采用的生产级方案

### 核心选型

- 配置管理：`@nestjs/config + zod`
- API 风格：`REST`
- 数据校验：`ValidationPipe + class-validator + class-transformer`
- API 文档：`Swagger / OpenAPI`
- 日志：`nestjs-pino`
- 认证：`JWT Access Token + Refresh Token`
- 权限：`RBAC`
- 数据库迁移：`Prisma Migrate`
- 测试：`Jest + integration/e2e`
- 部署基础：`Docker`

### 生产级基础设施

- 缓存：`Redis`
- 队列：`BullMQ + Redis`
- 文件存储：`S3` 兼容对象存储
- 任务进度通知：优先考虑 `SSE`，复杂实时场景再评估 `WebSocket`
- 限流：`@nestjs/throttler`
- 监控与错误上报：`Sentry + Prometheus`

### Prisma 约定

- 通过 `PrismaModule + PrismaService` 统一管理 Prisma Client 生命周期
- 使用 `Prisma Migrate` 管理 schema 迁移
- 默认保留通用审计字段：
  `createdAt`、`updatedAt`
- 如业务需要删除恢复能力，再引入：
  `deletedAt`（软删除）
- 如业务需要操作追踪，再引入：
  `createdBy`、`updatedBy`

### 推荐的后续决策清单

这些项目虽然可以按需加入，但越晚确定，重构成本通常越高：

- 是否需要任务队列
- 是否需要对象存储
- 是否需要 `RBAC`
- 是否需要软删除与审计字段
- 是否需要 `SSE` 推送任务进度
- 是否需要搜索能力（先 `Postgres FTS`，复杂后再升级）

### 关于“按需加入”

可以，后续开发中完全可以按需加入这些能力。

但更准确地说：

- `Swagger`、`ValidationPipe`、`@nestjs/config`、日志方案，建议尽早接入
- `Redis`、`BullMQ`、`S3`、`SSE`，可以在业务真正需要时再加
- `认证`、`权限`、`审计字段`，如果项目一开始就有后台管理、多角色或操作追踪需求，建议前期就定下来
- `监控`、`错误上报`、`限流`，在进入真实测试环境前就应该补齐

也就是说，功能型基础设施可以按需加入，但架构方向最好尽早确定。
