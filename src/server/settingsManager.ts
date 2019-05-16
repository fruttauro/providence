import * as fs from "fs-extra";

export class SettingsManager {

    private readonly _secretsDirectory: string = "./settings/secrets";
    private readonly _vapidPublicKey: string = "BPfbkLtT8zRVfuLNsHXbCh89238qFJjZewmHsPCTDLhbRTFavy1naX00H74sc85yOK72WeTTHNxa78ZLYfHuEdM";

    private _sslKey: Buffer | undefined;
    private _sslCert: Buffer | undefined;
    private _vapidPrivateKey: string | undefined;

    public async getSSLKey() {
        if (this._sslKey === undefined) {
            this._sslKey = await fs.readFile(`${this._secretsDirectory}/localhost.key`);
        }

        return this._sslKey;
    }

    public async getSSLCert() {
        if (this._sslCert === undefined) {
            this._sslCert = await fs.readFile(`${this._secretsDirectory}/localhost.cer`);
        }

        return this._sslCert;
    }

    public getVapidPublicKey() {
        return this._vapidPublicKey;
    }

    public async getVapidPrivateKey() {
        if (this._vapidPrivateKey === undefined) {
            this._vapidPrivateKey = await fs.readFile(`${this._secretsDirectory}/pushPrivateKey`, "utf8");
        }

        return this._vapidPrivateKey;
    }
}
