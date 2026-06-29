# Opportunity Atlas 部署说明

## 服务器前提

已验证目标服务器：

- Ubuntu 22.04
- root 用户
- Docker 29.5.0
- Docker Compose v5.1.3
- 公网 IP：`38.76.166.42`
- `80`、`443`、`3000` 已被其他 Docker 服务占用

因此本项目默认先暴露到 `3100` 端口：

```text
http://38.76.166.42:3100
```

## 首次部署

### 1. 上传或拉取代码

推荐使用 Git：

```bash
cd /opt
git clone <your-repo-url> OpportunityAtlas
cd /opt/OpportunityAtlas
```

如果暂时没有远程仓库，可以先用 `scp` 或压缩包上传到 `/opt/OpportunityAtlas`。

### 2. 配置环境变量

```bash
cp .env.production.example .env.production
```

编辑 `.env.production`：

```bash
nano .env.production
```

至少修改这些值：

```env
POSTGRES_PASSWORD=替换成强密码
DATABASE_URL="postgresql://opportunity_atlas:同一个强密码@postgres:5432/opportunity_atlas?schema=public"
ADMIN_EMAIL="你的管理员邮箱"
ADMIN_PASSWORD="替换成强管理员密码"
SESSION_SECRET="替换成长随机字符串"
SESSION_COOKIE_SECURE="false"
NEXT_PUBLIC_APP_URL="http://38.76.166.42:3100"
```

测试阶段使用 `http://38.76.166.42:3100`，所以 `SESSION_COOKIE_SECURE` 必须是 `false`，否则浏览器不会在 HTTP 下保存管理员 session cookie。后续接入 HTTPS 域名后再改为 `true`。

生成 session secret 可用：

```bash
openssl rand -hex 32
```

### 3. 启动数据库

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres
```

### 4. 构建应用镜像

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build app
```

### 5. 初始化数据库结构和 seed 数据

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run db:push
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run db:seed
```

### 6. 启动应用

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
```

访问：

```text
http://38.76.166.42:3100
```

如果服务器开启了 UFW：

```bash
ufw allow 3100/tcp
```

## 更新部署

```bash
cd /opt/OpportunityAtlas
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml build app
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run db:push
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
```

如需重新写入 seed：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app npm run db:seed
```

## 常用运维命令

查看容器：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

查看应用日志：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
```

查看数据库日志：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f postgres
```

重启应用：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml restart app
```

停止：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

停止并删除数据库数据卷需谨慎：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down -v
```

## 后续接域名

当前服务器 `80/443` 已被其他 Docker 服务占用。后续要接域名时，有两种方式：

1. 在现有反向代理里增加一条转发到 `127.0.0.1:3100`
2. 停掉当前占用 `80/443` 的服务，改由本项目自己的 Nginx/Caddy 接管

测试阶段建议先用 `http://38.76.166.42:3100`。
