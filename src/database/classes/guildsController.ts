import { injectable } from "tsyringe";
import { Database } from "../database.js";

export interface IGuildResolvable {
    success: boolean;
    error?: string;
    row?: any;
    changes?: number;
}

@injectable()
export class guildsController {
    constructor(private _database: Database) {}

    async guildExists(guildId: string): Promise<boolean> {
        let guild = await this.getGuild(guildId);
        return !!guild?.row;
    }

    async getGuild(guildId: string): Promise<IGuildResolvable> {
        let result: IGuildResolvable = { success: false };

        return new Promise((resolve, reject) => {
            this._database.conn.get(`SELECT * FROM guilds WHERE guildId=?`, [guildId], (err, row) => {
                if (err) {
                    result.error = err.message;
                    return reject(result);
                }

                result.success = true;
                result.row = row;
                resolve(result);
            });
        });
    }

    async addGuild(guildId: string, logsChannelId: string): Promise<IGuildResolvable> {
        let result: IGuildResolvable = { success: false };
        let stmt = this._database.conn.prepare(`INSERT INTO guilds(guildId, logsChannelId) VALUES(?,?)`);

        return new Promise((resolve, reject) => {
            stmt.run([guildId, logsChannelId], (err) => {
                if (err) {
                    result.error = err.message;
                    return reject(err);
                }

                result.success = true;
                resolve(result);
            });

            stmt.finalize((err) => {
                if (err) console.log(`Erro ao finalizar inserção(guilds): ${err.message}`);
            });
        });
    }

    async deleteGuild(guilId: string): Promise<IGuildResolvable> {
        let result: IGuildResolvable = { success: false };
        let stmt = this._database.conn.prepare(`DELETE FROM guilds WHERE guildId=?`);

        return new Promise((resolve, reject) => {
            stmt.run([guilId], function(err) {
                if (err) {
                    result.error = err.message;
                    return reject(err);
                }

                result.success = true;
                result.changes = this.changes;
                resolve(result);
            });

            stmt.finalize((err) => {
                if (err) console.log(`Erro ao finalizar exclusão(guilds): ${err.message}`);
            })
        });
    }

    async updateGuildLogsChannel(guildId: string, newLogsChannelId: string): Promise<IGuildResolvable> {
        let result: IGuildResolvable = { success: false };
        let stmt = this._database.conn.prepare(`UPDATE guilds SET logsChannelId=? WHERE guildId=?`);

        return new Promise((resolve, reject) => {
            stmt.run([guildId, newLogsChannelId], function(err) {
                if (err) {
                    result.error = err.message;
                    return reject(err);
                }

                result.success = true;
                result.changes = this.changes;
                resolve(result);
            });
        });
    }
}