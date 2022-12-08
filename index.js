// inclure les dépendanceset middleware
const mysql = require("mysql");
const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
//var urlEncodedParser = bodyparser.urlencoded({extended: "false"});
let iniparser = require("iniparser");
// activation des dépendances
let configDB = iniparser.parseSync("./DB.ini");

let app = express();

let mysqlconnexion = mysql.createConnection({
  host: configDB["dev"]["host"],
  user: configDB["dev"]["user"],
  password: configDB["dev"]["password"],
  database: configDB["dev"]["database"],
});

mysqlconnexion.connect((err) => {
  if (!err) console.log("BDD connectée.");
  else console.log("BDD connexion échouée \n Erreur: " + JSON.stringify(err));
});

// activer le middleware et lancer l'application sur le port 3000
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.listen(8080, () => console.log("le serveur Livre d'Or est prêt."));

// utiliser les routes
app.get("/", (req, res) => {
  res.send("Livre d'Or est actif");
});
// voir tous les messages
app.get("/LivreOr", (req, res) => {
  mysqlconnexion.query("SELECT * FROM tlivre", (err, lignes, champs) => {
    if (!err) {
      console.log(lignes);
      res.send(lignes);
    }
  });
});
// ajouter un message (query)
//RESTer
// body: id, name, msg, note et le contenu souhaité
// headers : content-type application/x-www-form-urlencoded
app.post("/LivreOr/Ajouter", (req, res) => {
  console.log(req.body.name);
  let msgID = req.body.id;
  let msgName = req.body.name;
  let msgMsg = req.body.msg;
  let msgNote = req.body.note;
  console.log(`Ajout msg ID ${msgID} de ${msgName} contenant ${msgMsg} et noté ${msgNote}`);
  let requeteSQL = "INSERT INTO tlivre (id, name, message, evaluation) VALUES";
  requeteSQL = requeteSQL + `( ${msgID} , '${msgName}', '${msgMsg}', ${msgNote})`;
  console.log("Requete : " + requeteSQL);
  mysqlconnexion.query(requeteSQL, (err, lignes, champs) => {
    if (!err) {
      console.log("Insertion terminée");
      res.send("Insertion terminée");
    } else {
      console.log("Erreur lors de l'enregistrement");
      res.send("Erreur ajout : " + JSON.stringify(err));
    }
  });
});
// chercher les messages contenant ElementSearch dans le champ message (query)
app.get("/search/", (req, res) => {
  let critere = "%" + req.query.msgSearch + "%"; //query. Exemple : %you%
  console.log("Find this : " + critere);
  mysqlconnexion.query(
    "SELECT * FROM tlivre WHERE message LIKE ?",
    [critere],
    (err, lignes, champs) => {
      if (!err) {
        console.log(lignes);
        res.send(lignes);
      }
    }
  );
});
// effacer un message choisi par ID (parameters)
app.delete("/LivreOr/:id", (req, res) => {
  let critere = req.params.id;
  console.log("ID = " + critere);
  mysqlconnexion.query(
    "DELETE FROM tlivre WHERE id = ?",
    [critere],
    (err, lignes, champs) => {
      if (!err) {
        console.log("Effacement terminé");
        res.send("Effacement terminé");
      } else {
        console.log("Erreur lors de l'effacement");
        res.send("Erreur effacement : " + JSON.stringify(err));
      }
    }
  );
});
