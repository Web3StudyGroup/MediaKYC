# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
使用 zkTLS 进行身份验证的 Token 分发系统，利用 Primus SDK 实现隐私保护的数据验证。

## 项目实现功能
1. 前端连接钱包，连接Monad testnet
2. 点击连接X，用Primus SDK实现用户X账号的验证，验证成功后，在页面显示连接的X账号名
3. 验证成功后，用户点击上链按钮，则调用用户钱包，把用户的X账号名和钱包地址记录在区块链上
4. 页面上显示钱包地址绑定的X账号
5. 点击连接Bilibili，用Primus SDK实现用户Bilibili账号的验证，验证成功后，在页面显示等级和VIP状态
6. Bilibili验证成功后，用户点击上链按钮，则调用用户钱包，把用户的Bilibili等级和VIP状态记录在区块链上

## 目录结构
- 用monorepo架构
- 前端和后端：app目录，用next.js框架
- 智能合约：contracts目录

## 技术栈

- **前端框架**: Next.js + TypeScript
- **UI 组件库**: Shadcn UI  
- **智能合约**: Foundry
- **区块链前端**: Rainbow+wagmi
- **密码学层**: Primus SDK (zkTLS/zkFHE) 文档： @docs/primus.md
- **包管理器**: Bun
- **构建工具**: Vite


## 支持的区块链
- Monad Testnet

## 网络信息
### Monad Testnet
- **网络名称**: Monad Testnet
- **Chain ID**: 10143
- **货币符号**: MON
- **区块浏览器**: https://testnet.monadexplorer.com

### 公共 RPC 端点
| RPC URL | 提供者 | 请求限制 | 批处理调用限制 | 其他限制 |
|---------|--------|----------|----------------|----------|
| https://testnet-rpc.monad.xyz | QuickNode | 25 请求/秒 | 100 | - |
| https://rpc.ankr.com/monad_testnet | Ankr | 300 请求/10 秒，12000 请求/10 分钟 | 100 | 不允许 debug_* 方法 |
| https://rpc-testnet.monadinfra.com | Monad Foundation | 20 请求/秒 | 不允许 | 不允许 eth_getLogs 和 debug_* 方法 |

## 已部署的合约

### Monad Testnet (Chain ID: 10143)

- **XAccountRegistry**: `0xC20A0c2a51906e5a8c25F7Fc135A8266291bfd70`
  - 功能：管理X账号与钱包地址的绑定关系
  - 验证器地址：`0x1Ad7fD53206fDc3979C672C0466A1c48AF47B431` (Primus zkTLS)
  - 更新：已实现真实的zkTLS验证，验证attestation data中的screen_name与传入的xAccount匹配

- **BilibiliAccountRegistry**: `0x7863C43c49636808A7dCef4AeF755bD9983BFF60`
  - 功能：管理Bilibili账号等级和VIP状态的验证与绑定
  - 验证器地址：`0x1Ad7fD53206fDc3979C672C0466A1c48AF47B431` (Primus zkTLS)
  - 数据格式：验证current_level和vipDueDate信息
  - Primus模板ID：`415bfae0-14b3-430a-8c2a-cfb8530bf7ff`
  - 期望数据格式：`{"current_level":"6","vipDueDate":"1776700800000"}`
