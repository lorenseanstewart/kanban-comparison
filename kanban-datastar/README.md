## <h1 align="center">Kanban-Datastar</h1>

### Why make this? 
We want to dragrace datastar against some frontend frameworks. This is a nieve implementation of datastar in golang, standard project using templ and tailwind, just to see what happens!

## Dev Setup

### For this to work you must have Go 1.25+ installed and in your `$PATH`
- [go](https://go.dev/doc/install)

Then run `go tool task -w`.  This will automatically install the task tool for you and start the server.

### Setting .env variables (loaded by `pkg/config/settings.go`)

`LOG_LEVEL` (DEBUG | INFO | WARN | ERROR)

### The Layers / Setup
I have this project split into distinct layers to keep things organized. 

- handlers/: Handle HTTP Requests / Responses related to `client`.
- services/: Handle all of the business logic. Grab data from external services.
- database/repository: Handles the CRUD operations directly on the database. 

- view/: Where all the `.templ` files live that do the actual rendering of the HTTP strings.

### More info

If you want to reset the project simply delete the generated `sqlite.db` file, everything will regenerate from the second migration file `seed`.

HUUUUUUGE shoutout to [Loren Sean Steward](https://github.com/lorenseanstewart/kanban-comparison) for making this awesome project!
