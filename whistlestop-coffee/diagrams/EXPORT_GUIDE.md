# 将 Mermaid 图表导出为 PNG

本指南提供多种方式将这些 UML 图表导出为 PNG 格式。

## 📋 可用的图表

- **erd-database.mmd** - 数据库关系图 (ERD)
- **uml-class.mmd** - UML 类图

---

## 方案 1️⃣：使用 Mermaid Live Editor（最简单 ⭐）

### 步骤：
1. 打开 [https://mermaid.live](https://mermaid.live)
2. 打开 `erd-database.mmd` 或 `uml-class.mmd` 文件中的代码
3. 复制代码到 Mermaid Live Editor 左侧编辑框
4. 点击右上角的 **Download** 按钮
5. 选择 **PNG** 格式下载

### 优点：
- ✅ 无需安装任何工具
- ✅ 支持实时预览
- ✅ 可以调整图表样式

---

## 方案 2️⃣：使用命令行工具（专业方案）

### 安装 Mermaid CLI

```bash
# 使用 npm
npm install -g @mermaid-js/mermaid-cli

# 或使用 yarn
yarn global add @mermaid-js/mermaid-cli
```

### 转换单个文件

```bash
# 转换 ERD
mmdc -i erd-database.mmd -o erd-database.png

# 转换 UML 类图
mmdc -i uml-class.mmd -o uml-class.png
```

### 转换整个目录

```bash
# 转换当前目录的所有 .mmd 文件
mmdc -i . -o ./outputs
```

### 高级选项

```bash
# 指定宽度和高度
mmdc -i erd-database.mmd -o erd-database.png -w 1920 -H 1080

# 转换为 SVG
mmdc -i erd-database.mmd -o erd-database.svg

# 转换为 PDF
mmdc -i erd-database.mmd -o erd-database.pdf
```

---

## 方案 3️⃣：使用 GitHub Actions（自动化）

在 `.github/workflows/export-diagrams.yml` 中添加：

```yaml
name: Export Mermaid Diagrams

on:
  push:
    paths:
      - 'whistlestop-coffee/diagrams/*.mmd'

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Mermaid CLI
        run: npm install -g @mermaid-js/mermaid-cli
      
      - name: Export diagrams
        run: |
          mmdc -i whistlestop-coffee/diagrams/erd-database.mmd -o whistlestop-coffee/diagrams/erd-database.png
          mmdc -i whistlestop-coffee/diagrams/uml-class.mmd -o whistlestop-coffee/diagrams/uml-class.png
      
      - name: Commit and push
        run: |
          git config user.name "Mermaid Bot"
          git config user.email "bot@example.com"
          git add whistlestop-coffee/diagrams/*.png
          git commit -m "Generate diagram PNGs" || echo "No changes"
          git push
```

---

## 方案 4️⃣：在线工具（无需安装）

### PlantUML 在线编辑器
1. 访问 [https://www.plantuml.com/plantuml/uml/](https://www.plantuml.com/plantuml/uml/)
2. 粘贴 Mermaid 代码
3. 导出为 PNG

### Lucidchart
1. 访问 [https://www.lucidchart.com](https://www.lucidchart.com)
2. 导入 Mermaid 代码
3. 导出为 PNG、SVG 或其他格式

---

## 📊 推荐工作流程

```
mmd 文件
   ↓
编辑/更新
   ↓
本地预览（Mermaid Live）
   ↓
导出为 PNG
   ↓
在文档中引用
```

---

## 常见问题

**Q: 导出的 PNG 质量不好？**
A: 使用 `-w` 和 `-H` 参数增加宽高：
```bash
mmdc -i erd-database.mmd -o erd-database.png -w 2560 -H 1440
```

**Q: 可以导出为其他格式吗？**
A: 是的，支持 PNG、SVG、PDF：
```bash
mmdc -i erd-database.mmd -o erd-database.svg  # SVG
mmdc -i erd-database.mmd -o erd-database.pdf  # PDF
```

**Q: 如何修改图表样式？**
A: 在 Mermaid Live Editor 中使用主题选项或在代码中添加配置。

---

## 📝 备注

- 所有 `.mmd` 文件都是纯文本格式，可以用任何文本编辑器编辑
- 使用 Git 进行版本控制时，建议只提交 `.mmd` 文件，PNG 文件可选
- 建议在 CI/CD 流程中自动化 PNG 生成

---

**最后更新**: 2026-05-08
