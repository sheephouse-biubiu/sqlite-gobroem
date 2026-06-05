# sqlite-gobroem

[中文文档](README.zh-CN.md)

sqlite-gobroem is a Golang embedded, web-based SQLite database browser.

## Install As A Package

Install the latest version:

```bash
go get -u github.com/sheephouse-biubiu/sqlite-gobroem
```

Import in your application:

```go
import "github.com/sheephouse-biubiu/sqlite-gobroem/gobroem"
```

## Run Standalone

Build:

```bash
cd $GOPATH/src/github.com/sheephouse-biubiu/sqlite-gobroem/gobroem
go build .
```

Run:

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

Open http://localhost:8000/

## Web UI Features

1. Browse table list and switch tables quickly.
2. Edit table schema:
   - add column with common type presets
   - inline edit column name, type, not-null and default value
   - drop column
   - rename table
3. Create table from sidebar:
   - click the create-table button
   - input table name
   - app creates a starter table with `id INTEGER PRIMARY KEY AUTOINCREMENT`
   - add business columns in schema editor
4. Manage indexes:
   - add, edit and delete indexes
   - pick index columns from current table columns
5. SQL workspace enhancements:
   - clear primary run action
   - SQL history and favorites
   - CSV and JSON export
   - execution time and row-count stats
6. Data row operations:
   - add, edit and delete rows
   - safe fallback support for tables without explicit primary key
7. Account security:
   - in-app password change flow

After frontend changes, run build scripts to regenerate embedded assets.

## Build On Windows

Embed files from static/ into gobroem/assets.go and compile:

```powershell
./build_windows.ps1
```

Or with cmd:

```bat
build_windows.bat
```

The script will:

1. Ensure go-bindata exists (install automatically if missing)
2. Regenerate gobroem/assets.go from static/...
3. Run go build .

## Embedded Usage

Initialize API controller:

```go
api, err := gobroem.NewAPI("path to sqlite db file")
if err != nil {
    log.Fatal("can not open db", err)
}
```

Register API handler:

```go
http.Handle("/browser/", api.Handler("/browser/"))
```
