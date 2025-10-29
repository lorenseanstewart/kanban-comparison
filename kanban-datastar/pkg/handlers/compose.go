package handlers

import (
	"kanban-datastar/view/common"
	"net/http"

	"github.com/a-h/templ"
)

type PageResponse struct {
	Component templ.Component
	Title     string
}

// NewPageResponse creates a standard page response
func NewPageResponse(component templ.Component, title string) PageResponse {
	return PageResponse{
		Component: component,
		Title:     title,
	}
}

// RenderPage handles layout wrapping and rendering of common page elements such as page head and menu
func (h *WebHandler) RenderPage(response PageResponse, w http.ResponseWriter, r *http.Request) {
	pc := common.PageContext{
		Title: response.Title,
	}

	component := common.Layout(pc, response.Component)
	templ.Handler(component).ServeHTTP(w, r)
}
