const express = require("express")
const exphbs = require("express-handlebars")
const bodyParser = require("body-parser")
const path = require("path")
const methodOverride = require("method-override")
const redis = require("redis")

const PORT = process.env.PORT || 3000
const app = express()
const client = redis.createClient()

client.on("connect", () => console.log("connected to redis"))

// METHOD-OVERRIDE MIDDLEWARE
app.use(methodOverride("_method"))

// BODY-PARSER MIDDLEWARE
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

// HANDLEBARS MIDDLEWARE
app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.get("/", (req, res, next) => {
  res.render("search_users")
})

app.post("/users/search", (req, res) => {
  let id = req.body.id
  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render("search_users", {
        error: "User doesnt exist."
      })
    } else {
      obj.id = id
      res.render("user_details", {
        user: obj
      })
    }
  })
})

app.get("/users/add", (req, res) => {
  res.render("add_user")
})

app.post("/users/add", (req, res) => {
  let { id, first_name, last_name, email, phone } = req.body
  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone
    ],
    (err, reply) => {
      if (err) console.log(err)
      console.log(reply)
      res.redirect("/")
    }
  )
})

app.listen(PORT, () => console.log(`server started at ${PORT}`))
