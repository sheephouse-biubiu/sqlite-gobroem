package gobroem

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
)

const sessionCookieName = "gobroem_session"

func (a *API) initAuth() error {
	_, err := a.dbClient.Exec(`
CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`)
	if err != nil {
		return err
	}

	a.sessionMu = sync.RWMutex{}
	a.sessions = make(map[string]string)
	return nil
}

func (a *API) usersCount() (int, error) {
	var count int
	err := a.dbClient.QueryRow(`SELECT COUNT(*) FROM app_users`).Scan(&count)
	return count, err
}

func (a *API) authStatus(w http.ResponseWriter, req *http.Request) {
	count, err := a.usersCount()
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	username, ok := a.currentUser(req)
	renderJSON(w, http.StatusOK, map[string]interface{}{
		"configured":    count > 0,
		"authenticated": ok,
		"username":      username,
	})
}

func (a *API) setupAdmin(w http.ResponseWriter, req *http.Request) {
	count, err := a.usersCount()
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}
	if count > 0 {
		renderError(w, http.StatusBadRequest, errors.New("系统已初始化，请直接登录"))
		return
	}

	username := strings.TrimSpace(req.FormValue("username"))
	password := req.FormValue("password")
	if username == "" || password == "" {
		renderError(w, http.StatusBadRequest, errors.New("用户名和密码不能为空"))
		return
	}

	hash, err := hashPassword(password)
	if err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	_, err = a.dbClient.Exec(`INSERT INTO app_users (username, password_hash) VALUES (?, ?)`, username, hash)
	if err != nil {
		renderError(w, http.StatusBadRequest, err)
		return
	}

	if err := a.loginWithUsername(w, username); err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	renderJSON(w, http.StatusOK, map[string]interface{}{"ok": true, "username": username})
}

func (a *API) login(w http.ResponseWriter, req *http.Request) {
	username := strings.TrimSpace(req.FormValue("username"))
	password := req.FormValue("password")
	if username == "" || password == "" {
		renderError(w, http.StatusBadRequest, errors.New("用户名和密码不能为空"))
		return
	}

	var storedHash string
	err := a.dbClient.QueryRow(`SELECT password_hash FROM app_users WHERE username = ?`, username).Scan(&storedHash)
	if err != nil {
		renderError(w, http.StatusUnauthorized, errors.New("用户名或密码错误"))
		return
	}

	if !verifyPassword(storedHash, password) {
		renderError(w, http.StatusUnauthorized, errors.New("用户名或密码错误"))
		return
	}

	if err := a.loginWithUsername(w, username); err != nil {
		renderError(w, http.StatusInternalServerError, err)
		return
	}

	renderJSON(w, http.StatusOK, map[string]interface{}{"ok": true, "username": username})
}

func (a *API) logout(w http.ResponseWriter, req *http.Request) {
	c, err := req.Cookie(sessionCookieName)
	if err == nil && c.Value != "" {
		a.sessionMu.Lock()
		delete(a.sessions, c.Value)
		a.sessionMu.Unlock()
	}

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
		SameSite: http.SameSiteLaxMode,
	})

	renderJSON(w, http.StatusOK, map[string]interface{}{"ok": true})
}

func (a *API) updateAccount(w http.ResponseWriter, req *http.Request) {
	username, ok := a.currentUser(req)
	if !ok {
		renderError(w, http.StatusUnauthorized, errors.New("请先登录"))
		return
	}

	currentPassword := req.FormValue("current_password")
	newUsername := strings.TrimSpace(req.FormValue("new_username"))
	newPassword := req.FormValue("new_password")

	if currentPassword == "" {
		renderError(w, http.StatusBadRequest, errors.New("请填写当前密码"))
		return
	}
	if newUsername == "" && newPassword == "" {
		renderError(w, http.StatusBadRequest, errors.New("请至少修改用户名或密码之一"))
		return
	}

	var storedHash string
	err := a.dbClient.QueryRow(`SELECT password_hash FROM app_users WHERE username = ?`, username).Scan(&storedHash)
	if err != nil || !verifyPassword(storedHash, currentPassword) {
		renderError(w, http.StatusUnauthorized, errors.New("当前密码不正确"))
		return
	}

	targetUsername := username
	if newUsername != "" {
		targetUsername = newUsername
	}

	targetHash := storedHash
	if newPassword != "" {
		hashed, hashErr := hashPassword(newPassword)
		if hashErr != nil {
			renderError(w, http.StatusInternalServerError, hashErr)
			return
		}
		targetHash = hashed
	}

	_, err = a.dbClient.Exec(
		`UPDATE app_users SET username = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?`,
		targetUsername,
		targetHash,
		username,
	)
	if err != nil {
		renderError(w, http.StatusBadRequest, err)
		return
	}

	a.refreshSessionUsername(req, targetUsername)
	renderJSON(w, http.StatusOK, map[string]interface{}{"ok": true, "username": targetUsername})
}

func (a *API) loginWithUsername(w http.ResponseWriter, username string) error {
	token, err := newSessionToken()
	if err != nil {
		return err
	}

	a.sessionMu.Lock()
	a.sessions[token] = username
	a.sessionMu.Unlock()

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	return nil
}

func (a *API) refreshSessionUsername(req *http.Request, username string) {
	c, err := req.Cookie(sessionCookieName)
	if err != nil || c.Value == "" {
		return
	}
	a.sessionMu.Lock()
	if _, ok := a.sessions[c.Value]; ok {
		a.sessions[c.Value] = username
	}
	a.sessionMu.Unlock()
}

func (a *API) currentUser(req *http.Request) (string, bool) {
	c, err := req.Cookie(sessionCookieName)
	if err != nil || c.Value == "" {
		return "", false
	}

	a.sessionMu.RLock()
	username, ok := a.sessions[c.Value]
	a.sessionMu.RUnlock()
	return username, ok
}

func (a *API) requireAuth(w http.ResponseWriter, req *http.Request) bool {
	if _, ok := a.currentUser(req); !ok {
		renderError(w, http.StatusUnauthorized, errors.New("请先登录"))
		return false
	}
	return true
}

func newSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func hashPassword(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	h := sha256.Sum256(append(salt, []byte(password)...))
	return fmt.Sprintf("%s$%s", hex.EncodeToString(salt), hex.EncodeToString(h[:])), nil
}

func verifyPassword(stored string, password string) bool {
	parts := strings.Split(stored, "$")
	if len(parts) != 2 {
		return false
	}

	salt, err := hex.DecodeString(parts[0])
	if err != nil {
		return false
	}

	expectedHash, err := hex.DecodeString(parts[1])
	if err != nil {
		return false
	}

	actual := sha256.Sum256(append(salt, []byte(password)...))
	if len(expectedHash) != len(actual) {
		return false
	}
	return subtle.ConstantTimeCompare(expectedHash, actual[:]) == 1
}
