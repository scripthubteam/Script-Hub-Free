// Iniciamos un servidor web en el puerto por defecto para que Glitch no detecte errores.
const express = require("express");
const app = express();

require("./config")

app.get("*", (req, res) => {
  res.send("OK");
});

app.listen(process.env.PORT || 3000, (e) => {
  console.log(`${e ? `${e.toString()}${e.fileName ? ` - ${e.fileName}:${e.lineNumber}:${e.columnNumber}` : ``}` : "Página web lista!"}`);
});

// Código del bot en sí.
const Discord = require("discord.js");
const mongoose = require("mongoose");
const client = new Discord.Client();
const path = require("path");
const fs = require("fs");

// Conectando a base de datos MongoDB.
mongoose.connect(process.env.MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (e) => {
  console.log(`${e ? `${e.toString()}${e.fileName ? ` - ${e.fileName}:${e.lineNumber}:${e.columnNumber}` : ``}` : `Base de datos lista!`}`);
});

// Cuando el cliente esté listo.
client.on("ready", () => {
  // Señal de vida.
  console.log("Discord Bot listo!");

  // Definiciones importantes y administrador de comandos (1/3).
  client.onlyDeleteUsers = [];
  client.db = require("./database.js");
  client.cmds = new Discord.Collection();

  // Administrador de eventos.
  let events = fs
    .readdirSync(path.join(__dirname, "events/"))
    .filter(e => e.endsWith(".js"));
  events.forEach(event => {
    let nombreEvento = event.split(".")[0];
    let archivoEvento = require(`./events/${event}`);
    client.on(nombreEvento, archivoEvento.bind(null, client));
  });
  console.log(`Cargados ${events.length} eventos correctamente!`);

  // Administrador de comandos (2/3).
  let cmds = fs
    .readdirSync(path.join(__dirname, "cmds/"))
    .filter(c => c.endsWith(".js"));
  cmds.forEach(cmd => {
    let nombreCmd = cmd.split(".")[0];
    let archivoCmd = require(`./cmds/${cmd}`);
    client.cmds.set(nombreCmd, {
      file: archivoCmd,
      aliases: archivoCmd.aliases,
      public: archivoCmd.public,
      description: archivoCmd.description,
      usage: archivoCmd.usage
    });
  });
  console.log(`Cargados ${cmds.length} comandos correctamente!`);
});

// Controlamos todas las excepciones recbiidas que no han sido controladas anteriormente.
process.on("unhandledRejection", e => {
  // Se envía todo eso en la consola.
  console.error(`${e.toString()}${e.fileName ? ` - ${e.fileName}:${e.lineNumber}:${e.columnNumber}` : ``}`);
});

// Iniciamos sesión en el bot con su token correspondiente y si hay algún error lo muestra.
client.login(process.env.TOKEN).catch((e) => {
  console.error(`${e.toString()}${e.fileName ? ` - ${e.fileName}:${e.lineNumber}:${e.columnNumber}` : ``}`);
});
