package gobroem

import (
	"database/sql"
	"encoding/json"
	"errors"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// API is the HTTP API surface for database browsing.
type API struct {
	dbClient *sqlClient
	dbFile   string

	sessions  map[string]string
	sessionMu sync.RWMutex
}

// NewAPI initializes the API controller with a DB file.
func NewAPI(dbFile string) (*API, error) {
	client, err := newClient(dbFile)
	if err != nil {
		return nil, err
	}

	api := &API{dbClient: client, dbFile: dbFile}
	if err := api.initAuth(); err != nil {
		return nil, err
	}
	return api, nil
}

// NewAPIFromDB initializes the API controller with a DB.
func NewAPIFromDB(db *sql.DB) (*API, error) {
	client, err := newClientFromDB(db)
	if err != nil {
		return nil, err
	}

	api := &API{dbClient: client, dbFile: ""}
	if err := api.initAuth(); err != nil {
		return nil, err
	}
	return api, nil
}

// Create User
func (a *API) CreateUser(username, password string) error {
	count, err := a.usersCount()
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("用户已存在")
	}

	username = strings.TrimSpace(username)
	if username == "" || password == "" {
		return errors.New("用户名和密码不能为空")
	}

	hash, err := hashPassword(password)
	if err != nil {
		return err
	}

	_, err = a.dbClient.Exec(`INSERT INTO app_users (username, password_hash) VALUES (?, ?)`, username, hash)
	if err != nil {
		return err
	}
	return nil
}

// Handler creates the HTTP handler for UI and API routes.
func (a *API) Handler(browserRoot string, staticRoot string) http.Handler {
	indexPage, _ := Asset("static/index.html")
	indexTmpl, _ := template.New("index").Parse(string(indexPage))

	fileServer := http.FileServer(&AssetFS{AssetDir, Asset, "static"})
	staticHandler := http.StripPrefix(staticRoot, fileServer)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case browserRoot + "api/auth/status":
			a.authStatus(w, r)
		case browserRoot + "api/auth/setup":
			a.setupAdmin(w, r)
		case browserRoot + "api/auth/login":
			a.login(w, r)
		case browserRoot + "api/auth/logout":
			if !a.requireAuth(w, r) {
				return
			}
			a.logout(w, r)
		case browserRoot + "api/auth/update":
			if !a.requireAuth(w, r) {
				return
			}
			a.updateAccount(w, r)

		case browserRoot + "api/info":
			if !a.requireAuth(w, r) {
				return
			}
			a.Info(w, r)
		case browserRoot + "api/tables":
			if !a.requireAuth(w, r) {
				return
			}
			a.Tables(w, r)
		case browserRoot + "api/table":
			if !a.requireAuth(w, r) {
				return
			}
			a.Table(w, r)
		case browserRoot + "api/table/info":
			if !a.requireAuth(w, r) {
				return
			}
			a.TableInfo(w, r)
		case browserRoot + "api/table/sql":
			if !a.requireAuth(w, r) {
				return
			}
			a.TableSQL(w, r)
		case browserRoot + "api/table/indexes":
			if !a.requireAuth(w, r) {
				return
			}
			a.TableIndexes(w, r)
		case browserRoot + "api/query":
			if !a.requireAuth(w, r) {
				return
			}
			a.Query(w, r)

		case browserRoot:
			indexTmpl.Execute(w, map[string]string{"root": browserRoot, "static": staticRoot})
		default:
			fileName := strings.Replace(r.URL.Path, staticRoot, "static/", 1)
			if _, err := Asset(fileName); err == nil {
				staticHandler.ServeHTTP(w, r)
			} else {
				http.NotFound(w, r)
			}
		}
	})
}

// Info returns basic information for the opened database.
func (a *API) Info(w http.ResponseWriter, req *http.Request) {
	info, err := a.dbClient.Info()
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	filePath, err := filepath.Abs(a.dbFile)
	if err != nil {
		filePath = ""
	}

	dbName := filepath.Base(a.dbFile)
	size, _ := fileSize(filePath)

	result := map[string]interface{}{
		"number_of_tables":  info.Rows[0][0],
		"number_of_indexes": info.Rows[0][1],
		"filename":          dbName,
		"fullname":          filePath,
		"size":              size,
	}
	renderJSON(w, http.StatusOK, result)
}

// Tables returns all user table names.
func (a *API) Tables(w http.ResponseWriter, req *http.Request) {
	tables, err := a.dbClient.Tables()
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	renderJSON(w, http.StatusOK, map[string]interface{}{"tables": tables})
}

// Table returns table schema info.
func (a *API) Table(w http.ResponseWriter, req *http.Request) {
	name := req.URL.Query().Get("table")
	result, err := a.dbClient.Table(name)
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	renderJSON(w, http.StatusOK, result.Format())
}

// TableInfo returns basic row/index count for one table.
func (a *API) TableInfo(w http.ResponseWriter, req *http.Request) {
	name := req.URL.Query().Get("table")
	result, err := a.dbClient.TableInfo(name)
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	data := map[string]interface{}{
		"row_count":     result.Rows[0][0],
		"indexes_count": 0,
	}
	renderJSON(w, http.StatusOK, data)
}

// TableSQL returns CREATE TABLE SQL.
func (a *API) TableSQL(w http.ResponseWriter, req *http.Request) {
	name := req.URL.Query().Get("table")
	result, err := a.dbClient.TableSQL(name)
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}
	if len(result) == 0 {
		renderError(w, http.StatusNotFound, errors.New("表不存在"))
		return
	}

	renderJSON(w, http.StatusOK, map[string]interface{}{"sql": result[0]})
}

// TableIndexes returns index metadata for one table.
func (a *API) TableIndexes(w http.ResponseWriter, req *http.Request) {
	name := req.URL.Query().Get("table")
	result, err := a.dbClient.TableIndexes(name)
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	renderJSON(w, http.StatusOK, result.Format())
}

// Query executes SQL and returns JSON or CSV based on query format.
func (a *API) Query(w http.ResponseWriter, req *http.Request) {
	query := strings.TrimSpace(req.FormValue("query"))
	if query == "" {
		renderError(w, http.StatusBadRequest, errors.New("缺少 SQL 语句"))
		return
	}

	result, err := a.dbClient.QuerySQL(query)
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	q := req.URL.Query()
	if len(q["format"]) > 0 {
		if q["format"][0] == "csv" {
			renderCSV(w, http.StatusOK, result.CSV())
			return
		}
		if q["format"][0] == "json" {
			renderJSON(w, http.StatusOK, result.Format())
			return
		}
	}

	renderJSON(w, http.StatusOK, result)
}

// renderError renders a JSON response with the given error message.
func renderError(w http.ResponseWriter, status int, err error) {
	result := map[string]interface{}{
		"code":    "error",
		"message": err.Error(),
	}
	renderJSON(w, status, result)
}

func renderCSV(w http.ResponseWriter, status int, data []byte) {
	w.Header().Set("Content-Type", "text/csv")
	w.WriteHeader(status)
	w.Write(data)
}

func renderJSON(w http.ResponseWriter, status int, v interface{}) {
	data, err := json.Marshal(v)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(status)
	w.Write(data)
}

func fileSize(fileName string) (int64, error) {
	fi, err := os.Stat(fileName)
	if err != nil {
		return 0, err
	}
	return fi.Size(), nil
}
