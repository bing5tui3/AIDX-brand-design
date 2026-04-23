---
quick_id: 260421-nya
slug: reduce-terminal-spans
description: 减少 AIDX 动画帧 span 数量：合并 h/g/o 三种 span 类为单一类，重新生成 235 帧
date: 2026-04-21
status: in_progress
---

# Quick Task: 减少 AIDX 动画帧 span 数量

## Goal

将每帧 span 数从 ~289 降至 ~50，接近 Ghostty 水平（~75），消除动画卡顿。

## Root Cause

`scripts/generate-frames.js` 使用 4 种 span 类（`e/h/g/o`），导致相邻字符频繁切换类，产生大量细碎 span。Ghostty 只用 1 种（`b`）。

## Tasks

1. **修改 `generate-frames.js`**：合并 `h/g/o` 为单一类 `w`（white），保留 `e`（眼睛）
2. **更新 `Terminal.module.css`**：将 `.h/.g/.o` 颜色规则合并为 `.w`
3. **重新生成 235 帧**：`node scripts/generate-frames.js`
4. **验证**：用 agent-browser 确认新帧 span 数 ≤ 80

## Must-Haves

- [ ] `h/g/o` 三类合并为 `w`，视觉效果保持（白色系字符）
- [ ] CSS 更新，`.w` 类有正确颜色
- [ ] 235 帧重新生成
- [ ] 每帧 span 数 ≤ 80（目标 ~50）
- [ ] 眼睛 `e` 类保留不变
