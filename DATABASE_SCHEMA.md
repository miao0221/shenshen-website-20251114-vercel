# 数据库表结构设计

## 1. users 表（用户信息）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 用户唯一标识符（主键） |
| username | STRING | 用户名 |
| email | STRING | 邮箱地址 |
| password_hash | STRING | 密码哈希值 |
| avatar_url | STRING | 头像链接 |
| created_at | DATETIME | 注册时间 |
| last_login | DATETIME | 最后登录时间 |
| is_active | BOOLEAN | 账户是否激活 |

## 2. songs 表（音乐作品）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 歌曲唯一标识符（主键） |
| title | STRING | 歌曲标题 |
| album | STRING | 所属专辑 |
| release_date | DATE | 发行日期 |
| duration | INTEGER | 歌曲时长（秒） |
| cover_url | STRING | 封面图片链接 |
| audio_url | STRING | 音频文件链接 |
| lyrics | TEXT | 歌词内容 |
| created_at | DATETIME | 创建时间 |

## 3. videos 表（视频内容）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 视频唯一标识符（主键） |
| title | STRING | 视频标题 |
| description | TEXT | 视频描述 |
| thumbnail_url | STRING | 缩略图链接 |
| video_url | STRING | 视频文件链接 |
| duration | INTEGER | 视频时长（秒） |
| publish_date | DATE | 发布日期 |
| views_count | INTEGER | 观看次数 |
| created_at | DATETIME | 创建时间 |

## 4. comments 表（用户评论）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 评论唯一标识符（主键） |
| content | TEXT | 评论内容 |
| user_id | UUID | 评论用户ID（外键关联users表） |
| target_type | STRING | 评论目标类型（歌曲/视频） |
| target_id | UUID | 评论目标ID |
| parent_id | UUID | 父级评论ID（用于回复功能，可为空） |
| created_at | DATETIME | 评论时间 |

## 5. collections 表（用户收藏）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 收藏记录唯一标识符（主键） |
| user_id | UUID | 用户ID（外键关联users表） |
| item_type | STRING | 收藏项目类型（歌曲/视频） |
| item_id | UUID | 收藏项目ID |
| created_at | DATETIME | 收藏时间 |

## 6. tags 表（标签系统）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 标签唯一标识符（主键） |
| name | STRING | 标签名称 |
| color | STRING | 标签颜色（用于前端显示） |
| created_at | DATETIME | 创建时间 |

## 7. posts 表（社区帖子）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 帖子唯一标识符（主键） |
| title | STRING | 帖子标题 |
| content | TEXT | 帖子内容 |
| user_id | UUID | 发帖用户ID（外键关联users表） |
| category | STRING | 帖子分类（如：分享、讨论、提问等） |
| likes_count | INTEGER | 点赞数 |
| comments_count | INTEGER | 评论数 |
| is_approved | BOOLEAN | 是否已审核 |
| created_at | DATETIME | 发布时间 |
| updated_at | DATETIME | 更新时间 |

## 8. post_likes 表（帖子点赞）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 点赞记录唯一标识符（主键） |
| post_id | UUID | 帖子ID（外键关联posts表） |
| user_id | UUID | 点赞用户ID（外键关联users表） |
| created_at | DATETIME | 点赞时间 |

## 关联表

### song_tags 表（歌曲标签关联）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| song_id | UUID | 歌曲ID（外键关联songs表） |
| tag_id | UUID | 标签ID（外键关联tags表） |

### video_tags 表（视频标签关联）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| video_id | UUID | 视频ID（外键关联videos表） |
| tag_id | UUID | 标签ID（外键关联tags表） |

### post_tags 表（帖子标签关联）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| post_id | UUID | 帖子ID（外键关联posts表） |
| tag_id | UUID | 标签ID（外键关联tags表） |