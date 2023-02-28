import { injectable } from "tsyringe";
import { Database } from "../database.js";

export interface IContactsResolvable {
    success: boolean;
    error?: string;
    row?: any;
    changes?: number;
}

@injectable()
export class contactsController {
    constructor(private _database: Database) {}

    async contactExists(userId: string, guildId: string): Promise<boolean> {
        let contact = await this.getContact(userId, guildId);
        return !!contact?.row;
    }

    async getContact(userId: string, guildId: string): Promise<IContactsResolvable> {
        let result: IContactsResolvable = { success: false };

        return new Promise((resolve, reject) => {
            this._database.conn.get(`SELECT * FROM contacts WHERE userId=? AND guildId=?`, [userId, guildId], (err, row) => {
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

    async addContact(userId: string, guildId: string, contactChannelId: string): Promise<IContactsResolvable> {
        let result: IContactsResolvable = { success: false };
        let stmt = this._database.conn.prepare(`INSERT INTO contacts(userId, guildId, contactChannelId) VALUES(?,?,?)`);

        return new Promise((resolve, reject) => {
            stmt.run([userId, guildId, contactChannelId], (err) => {
                if (err) {
                    result.error = err.message;
                    return reject(err);
                }

                result.success = true;
                resolve(result);
            });

            stmt.finalize((err) => {
                if (err) console.log(`Erro ao finalizar inserção(contacts): ${err.message}`);
            });
        });
    }

    async deleteContact(userId: string, guildId: string): Promise<IContactsResolvable> {
        let result: IContactsResolvable = { success: false };
        let stmt = this._database.conn.prepare(`DELETE FROM contacts WHERE userId=? AND guildId=?`);

        return new Promise((resolve, reject) => {
            stmt.run([userId, guildId], function(err) {
                if (err) {
                    result.error = err.message;
                    return reject(err);
                }

                result.success = true;
                result.changes = this.changes;
                resolve(result);
            });

            stmt.finalize((err) => {
                if (err) console.log(`Erro ao finalizar exclusão(contacts): ${err.message}`);
            })
        });
    }
}