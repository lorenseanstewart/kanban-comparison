package config

import (
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
)

// fileServer sets up the fileserver for public assets anr routes /public GET reqs to the /public/ folder
func fileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}

// SetupFileServer to serve public assets
func SetupFileServer(l *slog.Logger, r *chi.Mux) {
	workdir, _ := os.Getwd()
	publicPath := filepath.Join(workdir, "public")
	filesDir := http.Dir(publicPath)
	fileServer(r, "/public", filesDir)
	l.Info("File server configured for /public/*")
}
