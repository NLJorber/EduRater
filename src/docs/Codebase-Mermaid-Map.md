## Dummy Layout - edit as code changes

```mermaid

flowchart TD
    Index["index.js<br>Project bootstrapping, calls app"]
    App["app.js<br>Configures app, sets up middleware"]
    Routes["routes.js<br>API endpoints"]
    DB["db.js<br>Sets up DB connection"]
    Utils["utils.js<br>Helpers, validation"]
    UserModel["models/UserModel.js<br>User schema/model"]

    Index --> App
    App --> Routes
    App --> DB
    Routes --> UserModel
    Routes --> Utils
    DB --> UserModel