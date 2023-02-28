import { singleton } from "tsyringe";
import sqlite from "sqlite3";

@singleton()
export class Database {
    private db: sqlite.Database;

    constructor() {
        this.db = new sqlite.Database("database.db", (err: Error) => {
            if (err)
                return console.error(err);
            console.log("Conectado ao banco de dados SQLite com sucesso!");
        });

        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS "guilds" (
                "guildId"	TEXT NOT NULL,
                "logsChannelId"	TEXT NOT NULL,
                PRIMARY KEY("guildId")
            );`, function(err: Error) {
                if (err)
                    return console.error(`Ocorreu um erro ao criar a tabela 'guilds': ${err.message}`);
                console.log((this.changes > 0) ? "Tabela 'guilds' criada com sucesso!" : "Tabela 'guilds' já existe, nada alterado.");
            });

            this.db.run(`CREATE TABLE IF NOT EXISTS "contacts" (
                "id"	INTEGER,
                "userId"	TEXT NOT NULL,
                "guildId"	TEXT NOT NULL,
                "contactChannelId"	TEXT NOT NULL,
                FOREIGN KEY("guildId") REFERENCES "guilds"("guildId") ON DELETE CASCADE,
                PRIMARY KEY("id" AUTOINCREMENT)
            );`, function(err: Error) {
                if (err)
                    return console.error(`Ocorreu um erro ao criar a tabela 'contacts': ${err.message}`);
                console.log((this.changes > 0) ? "Tabela 'contacts' criada com sucesso!" : "Tabela 'contacts' já existe, nada alterado.");
            })
        })
    }

    public get conn() {
        return this.db;
    }
}