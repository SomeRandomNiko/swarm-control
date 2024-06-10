import { Config } from "common/types";
import { app } from "../index";
import { sendPubSubMessage } from "../util/pubsub";
import { pack } from "jsonpack";

let config: Config | undefined;

const gistUrl = "https://gist.githubusercontent.com/Alexejhero/804fe0900d015b89a934a9b759ba2330/raw";

async function fetchConfig(): Promise<Config> {
    const url = `${gistUrl}?${Date.now()}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data as Config;
    } catch (e: any) {
        console.error("Error when fetching config");
        console.error(e);

        return {
            version: -1,
            message: "Error when fetching config",
        };
    }
}

export async function getConfig(): Promise<Config> {
    if (!config) {
        config = await fetchConfig();
    }

    return config;
}

export async function broadcastConfigRefresh(config: Config) {
    return sendPubSubMessage({
        type: "config_refreshed",
        data: pack(config),
    });
}

app.get("/private/refresh", async (_, res) => {
    config = await fetchConfig();
    console.log("Refreshed config, new config version is ", config.version);
    await broadcastConfigRefresh(config);
    res.sendStatus(200);
});

app.get("/public/config", async (req, res) => {
    const config = await getConfig();
    res.send(JSON.stringify(config));
});

(async () => {
    const config = await getConfig();
    await broadcastConfigRefresh(config);
})().then();
