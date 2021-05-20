const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("bson");
MongoClient.connect("<MongoDB Connection String>", {
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to Database");
    const db = client.db("ToDo");
    const todoList = db.collection("list");

    app.get("/", (req, res) => {
      todoList
        .find()
        .toArray()
        .then((results) => {
          res.render("home.ejs", { data: results });
        })
        .catch(/* ... */);
    });

    app.post("/todo", (req, res) => {
      req.body["durum"] = false;
      req.body["bitis"] = new Date(req.body["bitis"]).getTime();
      todoList
        .insertOne(req.body)
        .then((result) => {
          res.redirect("/");
        })
        .catch((error) => console.error(error));
    });

    app.put("/todo", (req, res) => {
      todoList
        .findOneAndUpdate(
          {
            _id: ObjectId(req.body.id),
          },
          {
            $set: {
              durum: req.body.durum,
            },
          },
          {
            upsert: true,
          }
        )
        .then((result) => {
          res.json("Success");
        })
        .catch((error) => console.error(error));
    });

    app.delete("/todo", (req, res) => {
      todoList
        .deleteOne({ _id: ObjectId(req.body.id) })
        .then((result) => {
          res.json("Success");
        })
        .catch((error) => console.error(error));
    });
  })
  .catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
