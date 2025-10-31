## <h1 align="center">Kanban-Datastar</h1>

### Why make this? 
We want to dragrace datastar against some frontend frameworks. This is a nieve implementation of datastar in golang, standard project using templ and tailwind, just to see what happens!

## Dev Setup

### For this to work you must have Go 1.25+ installed and in your `$PATH`
- [go](https://go.dev/doc/install)

Then run `go tool task -w`.  This will automatically install the task tool for you and start the server.

### Setting .env variables (loaded by `pkg/config/settings.go`)

`DATASTAR_IS_DEV` - set to `true` to enable dev mode (default: `false`)
`DATASTAR_PORT` - set to the port you want the server to run on (default: `7331`)


### More info

If you want to reset the project simply delete the generated `sqlite.db` file, everything will regenerate from the second migration file `seed`.

HUUUUUUGE shoutout to [Loren Sean Steward](https://github.com/lorenseanstewart/kanban-comparison) for making this awesome project!
