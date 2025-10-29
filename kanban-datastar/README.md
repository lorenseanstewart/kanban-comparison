## <h1 align="center">Kanban-Datastar</h1>

### Why make this? 
We want to dragrace datastar against some frontend frameworks. This is a nieve implementation of datastar in golang, standard project using templ and tailwind, just to see what happens!

## Dev Setup

### For this to work you must have 5 things installed and in your `$PATH`
- [task](https://github.com/go-task/task?tab=readme-ov-file)
- [go](https://go.dev/doc/install)
- [air](https://github.com/air-verse/air)
- [templ](https://github.com/a-h/templ?tab=readme-ov-file)
- [tailwindcss](https://github.com/tailwindlabs/tailwindcss/) - Download from Releases

### Setting .env variables (loaded by `pkg/config/settings.go`)

`LOG_LEVEL` (DEBUG | INFO | WARN | ERROR)

### The Layers / Setup
I have this project split into distinct layers to keep things organized. 

- handlers/: Handle HTTP Requests / Responses related to `kanban client`.
- services/: Handle all of the business logic. Grab data from external services.
- database/repository: Handles the CRUD operations directly on the database. 

- view/: Where all the `.templ` files live that do the actual rendering of the HTTP strings.
