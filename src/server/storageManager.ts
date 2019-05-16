import * as dataStore from "nedb";

export class PersistentStorageManager {

    private readonly _storageDirectory: string;

    private _pushSubscriptionDataStore: Nedb | undefined;

    public constructor() {
        this._storageDirectory = "./storage";
    }

    public getPushSubscriptionDataStore() {

        if (this._pushSubscriptionDataStore === undefined) {
            this.ensurePushSubscriptionDataStore();
        }

        return this._pushSubscriptionDataStore!;
    }

    private ensurePushSubscriptionDataStore() {

        const pushSubscriptionsDataStore = new dataStore({
            filename: `${this._storageDirectory}/pushSubscriptions.db`,
            autoload: true
        });

        pushSubscriptionsDataStore.ensureIndex({
            fieldName: "endpoint",
            unique: true
        });

        this._pushSubscriptionDataStore = pushSubscriptionsDataStore;
    }
}
