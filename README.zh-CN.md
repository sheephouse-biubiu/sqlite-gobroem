# sqlite-gobroem

[English Documentation](README.en.md)

sqlite-gobroem 是一个使用 Golang 构建的嵌入式 Web SQLite 数据库浏览器。

## 作为包引入

安装最新版：

```bash
go get -u github.com/sheephouse-biubiu/sqlite-gobroem
```

在应用中引入：

```go
import "github.com/sheephouse-biubiu/sqlite-gobroem/gobroem"
```

## 独立运行

编译：

```bash
cd $GOPATH/src/github.com/sheephouse-biubiu/sqlite-gobroem/gobroem
go build .
```

运行：

```bash
./sqlite-gobroem -h

Usage of ./sqlite-gobroem:
  -bind string
        HTTP server host (default "localhost")
  -db string
        SQLite database file (default "test/test.db")
  -listen uint
        HTTP server listen port (default 8000)

./sqlite-gobroem
```

浏览器访问 http://localhost:8000/

## Web 界面功能

1. 支持浏览数据表列表并快速切换表。
2. 支持表结构编辑：
   - 新增字段（内置常用类型）
   - 行内修改字段名、类型、非空、默认值
   - 删除字段
   - 重命名表
3. 支持侧栏创建数据表：
   - 点击创建数据表按钮
   - 输入表名
   - 系统默认创建 `id INTEGER PRIMARY KEY AUTOINCREMENT` 的起始表
   - 业务字段可在表结构编辑区继续新增
4. 支持索引管理：
   - 新增、修改、删除索引
   - 索引字段从当前表字段中选择
5. SQL 查询区增强：
   - 清晰的主执行入口
   - SQL 历史与收藏
   - 导出 CSV / JSON
   - 执行耗时与行数统计
6. 支持数据行操作：
   - 新增、修改、删除数据行
   - 无显式主键表也可通过安全回退策略进行操作
7. 账号安全：
   - 提供页面内修改密码流程

前端资源修改后，请执行构建脚本重新生成嵌入静态资源。

## Windows 构建

将 static/ 下资源重新嵌入 gobroem/assets.go 并编译：

```powershell
./build_windows.ps1
```

或使用 cmd：

```bat
build_windows.bat
```

脚本会自动执行：

1. 检查 go-bindata（缺失时自动安装）
2. 从 static/... 重新生成 gobroem/assets.go
3. 执行 go build .

## 嵌入到现有服务

初始化 API 控制器：

```go
api, err := gobroem.NewAPI("path to sqlite db file")
if err != nil {
    log.Fatal("can not open db", err)
}
```

注册 API 处理器：

```go
http.Handle("/browser/", api.Handler("/browser/"))
```
