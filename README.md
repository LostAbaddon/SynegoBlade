# SynegoBlade 🗡️

> - Author: LostAbaddon
> - Organization: 此在 (Dasein)
> - Version: 0.1.0

**SynegoBlade** 是一个羽量级的原生 JavaScript 库，旨在帮助开发者快速构建具有强大离线能力的渐进式网络应用 (PWA)。它摒弃了现代前端框架的复杂性，回归到纯粹的 HTML、CSS 和 JavaScript，无需构建步骤，让您专注于核心业务逻辑。

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://semver.org/)
[![Author](https://img.shields.io/badge/author-LostAbaddon-orange.svg)](https://github.com/lostabaddon)
[![Organization](https://img.shields.io/badge/organization-Dasein-lightgrey.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 核心理念

在当今前端生态中，我们常常需要庞大的框架和复杂的构建工具来开发应用。SynegoBlade 的诞生源于一个简单的想法：我们能否仅用浏览器原生支持的技术，就构建出现代、高效、可离线使用的 Web 应用？

SynegoBlade 的答案是肯定的。它为您提供：

*   **原生体验**：零依赖，无需编译，直接在浏览器中运行。
*   **简单高效**：轻量级的代码，极低的性能开销。
*   **功能完备**：提供 PWA 的核心功能，满足中小型项目的需求。

## ✨ 主要功能

*   **PWA 就绪**: 内置完整的 PWA 支持，包括 Service Worker 管理和应用清单。
*   **强大的离线能力**:
    *   采用 **Stale-While-Revalidate** 缓存策略，确保应用在离线时依然可用，并能在在线时静默更新。
    *   可配置的缓存排除规则，允许特定 API 请求（如 `/api/*`）绕过缓存，直达网络。
    *   内置心跳机制，实时检测并显示网络在线/离线状态。
*   **可安装到桌面**: 用户可以将您的 Web 应用一键“安装”到桌面或手机主屏幕，提供近乎原生的体验。

## 🚀 快速上手

我们提供了一个开箱即用的演示站点，您可以参照它来快速搭建您的第一个 SynegoBlade 应用。

### 1. 查看示例文件

我们强烈建议您首先查看 `test/site/` 目录下的文件，它们构成了一个功能完整的示例。
*   `test/site/index.html` 展示了如何组织页面结构、引入脚本以及初始化应用。
*   `test/site/manifest.json` 提供了一个标准的 PWA 清单文件配置。

### 2. 启动本地服务器

为了让 Service Worker 正常工作，您需要通过一个 Web 服务器来访问您的文件。这里首推 [**SynegoBase**](https://github.com/LostAbaddon/SynegoBase)，一个由我们团队开发的快速集群服务器系统。

## 📖 API & 用法

### `new SynegoPWA(options)`

初始化 PWA 功能。这是 SynegoBlade 的核心入口。

*   `options.swPath` (String): Service Worker 文件的路径。默认为 `/synego/sw.js`。
*   `options.cacheExclusionPrefixes` (Array): 一个字符串数组，定义了所有不应被离线缓存的 GET 请求的 URL 前缀。

**示例：**
```javascript
// 在您的主 HTML 文件的 <script> 标签中
window.synegoPWA = new SynegoPWA({
    // /api/ 和 /users/ 下的所有 GET 请求都将直接访问网络
    cacheExclusionPrefixes: ['/api/', '/users/']
});
```

## 📁 项目结构

```
/
├── src/                # 库核心文件
│   ├── synego-pwa.js   # PWA 客户端管理器
│   ├── sw.js           # Service Worker 脚本
│   └── style.css       # 默认样式
├── test/               # 示例与测试文件
│   └── site/           # 一个完整的演示站点
└─── README.md           # 你正在阅读的文件
```

## 🗺️ 未来路线图 (Roadmap)

SynegoBlade 正处于早期开发阶段，我们计划在未来加入更多激动人心的功能：

*   [ ] **双向数据绑定**: 通过 `model` 属性实现视图与数据的自动同步。
*   [ ] **动态属性绑定**: 支持绑定 HTML 元素的属性，例如 `@class` 或 `@disabled`。
*   [ ] **内置组件样式**: 为常见表单元素（如 `input`, `button`）在不同状态下（如 `:disabled`）提供更美观的默认样式。
*   [ ] **更丰富的事件系统**: 提供更简洁的事件绑定语法。
*   [ ] **生命周期钩子**: 在应用的特定阶段（如初始化、数据更新后）执行代码。

## ❤️ 贡献

我们欢迎任何形式的贡献！无论是功能建议、Bug 报告还是代码提交，请随时通过 [Issues](https://github.com/your-repo/synego-blade/issues) 或 [Pull Requests](https://github.com/your-repo/synego-blade/pulls) 与我们联系。

## 📄 授权

本项目基于 [MIT License](LICENSE) 开源。
