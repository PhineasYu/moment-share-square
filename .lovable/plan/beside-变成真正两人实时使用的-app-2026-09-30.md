# Beside：变成真正两人实时使用的 app

## 体验
- **登录**：打开 app → 用 Google 登录。
- **配对**：第一个人登录后看到“邀请她”，生成一个邀请链接（复制/分享）。对方打开链接，用 Google 登录，就自动和你配成一对。一个人只能在一对里。
- **视图**：每个人看到的永远是**自己在左，对方在右**。顶部显示对方名字（Google 名字，而不是“Her”）。
- **从空白开始**：没有示例照片，只有今天的 + 格子。
- **实时流程**：
  1. 我点 +，拍照/选图/选 emoji → 左格出现我的内容，右格留空（虚线/空白邀请）。
  2. 她的手机上**立刻**出现这一行：右边（她的左边）空着，等她填。
  3. 她填上照片 → 我这边右格立刻出现，带配对动画。
  4. 她也可以自己新建一行，我这边就出现空的左格等我填。
- 不回也没关系，空格只是邀请，不提醒、不催。
- “I have time” 的时间也同步给对方显示。
- 右上加一个退出登录。

## 保留
现有设计全部保留：滚轮效果、复古滤镜、诗句、玻璃质感菜单、DrumPicker、今天格子。

## Technical details
- 启用 Lovable Cloud；配置 Google 登录（Lovable broker）。
- 表：
  - `profiles`（id, display_name, avatar_url）— 注册触发器自动创建。
  - `couples`（id, member_a, member_b nullable, invite_token, created_at）。
  - `moments`（id, couple_id, created_at, initiator_id, initiator_content, responder_content nullable, responded_at）— content 为 `{type:'photo', path}` 或 `{type:'emoji', glyph}`。
  - `availability`（user_id, minutes, updated_at）。
- 所有表加 GRANT + RLS：只有这一对的两个成员能读写；只有非发起人能填 responder_content。用 security definer 函数 `is_couple_member`。
- 存储桶 `moments`（私有），路径 `couple_id/...`，成员才可读写，前端用签名 URL 显示。
- 接受邀请：服务端函数 `acceptInvite(token)`（requireSupabaseAuth）把当前用户写入 member_b。
- 实时：订阅 `moments` 和 `availability` 的 Realtime 变化，收到即更新列表并触发现有入场/配对动画。
- 视角映射：`left = 我的内容`（我是发起人则 initiator，否则 responder），`right = 对方内容`。原来的“切换视角”逻辑移除。
- 路由：`/auth`（Google 登录）、`/invite/$token`（公开，登录后接受邀请）、主屏移入 `_authenticated/`；未配对时主屏显示邀请卡片。
- `store.ts` 改为基于 Cloud 数据的 hooks，移除种子数据和 picsum 图片。
- 测试方式：两个浏览器/手机各用一个 Google 账号。
