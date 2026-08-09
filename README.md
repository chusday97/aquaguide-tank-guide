# AquaGuide — AI 辅助水族管理 / AI-Assisted Aquarium Management

AquaGuide 是面向水族新手的鱼缸管理、物种选择、混养判断与养护辅助工具。

AquaGuide is an aquarium management product for beginner and light-experience fishkeepers.

## 目录 / Table of Contents

### 中文
- [项目简介](#项目简介)
- [为什么做 AquaGuide](#为什么做-aquaguide)
- [核心产品流程](#核心产品流程)
- [核心功能](#核心功能)
- [AI 与确定性规则的边界](#ai-与确定性规则的边界)
- [系统架构](#系统架构)
- [可靠性与评测](#可靠性与评测)
- [本地运行](#本地运行)
- [当前限制](#当前限制)

### English
- [Overview](#overview)
- [Why AquaGuide](#why-aquaguide)
- [Core Product Flow](#core-product-flow)
- [Core Modules](#core-modules)
- [AI vs Deterministic Logic](#ai-vs-deterministic-logic)
- [Architecture](#architecture)
- [Reliability & Evaluation](#reliability--evaluation)
- [Local Development](#local-development)
- [Current Limitations](#current-limitations)

---

# 中文版

## 项目简介

AquaGuide 将鱼缸建立、物种图鉴、混养判断、日常观察、养护建议和个人水族记录串成一个连续产品流程。

**核心设计原则：需要稳定和安全的结论由确定性规则负责，AI 负责解释、整理和有限追问，不覆盖规则给出的风险判断。**

**关键词：** 鱼缸管理 · 物种图鉴 · 混养判断 · 日常检查 · 养护指南 · AI 辅助 · 产品评测

[在线体验](https://aqua-tank-guide.vercel.app)

## 为什么做 AquaGuide

水族新手通常并不是完全找不到信息，而是面临三个更实际的问题：

- 信息散落在论坛、商家页面、视频和帖子中；
- 不同来源的建议可能互相冲突；
- 用户知道“哪里不对”，却不知道下一步应该先做什么。

AquaGuide 希望把零散的信息查询转成一个可执行、可追踪的决策流程。

## 核心产品流程

```mermaid
flowchart LR
  A[建立鱼缸] --> B[填写环境与设备]
  B --> C[浏览物种]
  C --> D[快速混养判断]
  D --> E[结合当前鱼缸再次校验]
  E --> F[安全添加生物]
  F --> G[每日检查]
  G -->|发现异常| H[本地风险分级]
  H --> I[低风险即时动作]
  I --> J[养护指南]
```

## 核心功能

| 模块 | 作用 | 状态 |
| --- | --- | --- |
| 我的鱼缸 | 管理多个鱼缸、尺寸、设备、生物与 3D 鱼缸视图 | 已实现 |
| 物种图鉴 | 搜索、筛选、查看物种详情并收藏 | 已实现 |
| 混养判断 | 物种间快速判断，并结合具体鱼缸再次校验 | 已实现 |
| 每日检查 | 记录结构化观察并进行本地风险分级 | 已实现 |
| 养护指南 | 按问题查找养护内容与恢复步骤 | 已实现 |
| AI Tank Copilot | 理解用户目标、有限追问并解释可选方案 | 已实现 |
| 水族收藏 | 汇总收藏物种、养护记录、纪念与成就 | 已实现 |
| 3D 实验 | 鱼缸三维展示与材质交互实验 | 实验中 |
| 云端同步 | 跨设备备份与恢复 | 尚未完整实现 |

## AI 与确定性规则的边界

AquaGuide 不把生成式 AI 当作安全决策引擎。

**确定性逻辑负责：** 物种兼容性与阻断规则、风险等级、安全边界、养护内容白名单，以及生物写入鱼缸前的校验。

**AI 负责：** 解释规则结论、整理观察信息、提出有限追问，以及帮助用户理解不同养护和配置方案。

即使模型不可用，产品也保留本地规则结果。

## 系统架构

```mermaid
flowchart TB
  subgraph Client[浏览器端]
    UI[桌面 / 移动端 UI]
    Actions[统一产品 Actions]
    Rules[兼容性与诊断规则]
    Local[本地数据 Repository]
    Three[3D Aquarium]
    UI --> Actions
    Actions --> Rules
    Actions --> Local
    UI --> Three
  end
  Actions --> API[Express Business API]
  API --> DB[Supabase PostgreSQL / Storage]
  API --> AI[模型服务]
  Auth[Supabase Auth] --> UI
```

主要技术栈：React 19、TypeScript、Vite、Tailwind CSS、Three.js、Express、Supabase、PostHog、Playwright。

## 可靠性与评测

当前评测覆盖 Copilot 输入输出约束、Daily Check 确定性规则、物种状态红旗优先级、失败场景，以及 Badcase → Fix → Regression 回归流程。

```bash
npm run eval:all
```

## 本地运行

```bash
npm install
npm run dev
npm run build
```

## 当前限制

- 云端数据路径仍在迭代；
- 开放式 AI 输入的真实用户覆盖还不充分；
- 图片识别尚缺少足够规模的真实图片准确率评测集；
- 3D 首屏性能和低端设备表现仍需专项验证；
- AquaGuide 不提供疾病诊断、自动用药，也不能替代专业兽医建议。

---

# English Version

## Overview

AquaGuide connects tank setup, species discovery, compatibility checking, daily observations, care guidance, and personal aquarium records into one workflow.

**Core design principle: deterministic rules own safety-critical decisions. AI explains, organizes, and asks bounded follow-up questions, but does not override compatibility or risk decisions.**

[Live Demo](https://aqua-tank-guide.vercel.app)

## Why AquaGuide

Beginner fishkeepers face fragmented information, conflicting advice, and uncertainty about what to do next. AquaGuide turns that research process into a traceable product workflow.

## Core Product Flow

```mermaid
flowchart LR
  A[Create tank] --> B[Add environment and equipment]
  B --> C[Explore species]
  C --> D[Quick compatibility check]
  D --> E[Validate against current tank]
  E --> F[Add livestock safely]
  F --> G[Daily check]
  G -->|Issue found| H[Local risk triage]
  H --> I[Immediate low-risk action]
  I --> J[Care guidance]
```

## Core Modules

My Aquarium, Species Atlas, Compatibility Engine, Daily Check, Care Guide, AI Tank Copilot, Aquarium Collection, experimental 3D interactions, and evolving cloud sync.

## AI vs Deterministic Logic

Deterministic logic handles compatibility rules, risk classification, safety boundaries, allowlisted care actions, and validation. AI is used for explanation, organization, and bounded follow-up questions. Local rule results remain authoritative if model assistance is unavailable.

## Architecture

React + TypeScript frontend, Express business layer, Supabase data services, local deterministic rules, and a bounded model-service layer.

## Reliability & Evaluation

Evaluation covers bounded Copilot behavior, deterministic Daily Check logic, species-status red flags, failure scenarios, and a Badcase → Fix → Regression workflow.

## Local Development

```bash
npm install
npm run dev
npm run build
```

## Current Limitations

Cloud data paths are still evolving, open-ended AI inputs need broader real-user coverage, visual identification needs a broader benchmark, and 3D performance requires additional validation. AquaGuide does not replace professional veterinary advice.
