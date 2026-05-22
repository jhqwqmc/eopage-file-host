import {getStore} from "@edgeone/pages-blob";

export default async function onRequest(context) {
    const {request, env} = context;

    if (request.method !== "PUT") {
        return new Response(JSON.stringify({error: "Method not allowed"}), {
            status: 405,
            headers: {"Content-Type": "application/json"},
        });
    }

    if (!env.EO_BLOB_STORE_KEY) {
        return new Response(
            JSON.stringify({error: "请配置环境变量 EO_BLOB_STORE_KEY"}),
            {status: 500, headers: {"Content-Type": "application/json"}}
        );
    }

    if (!env.EO_BLOB_STORE_SECRET) {
        return new Response(
            JSON.stringify({error: "请配置环境变量 EO_BLOB_STORE_SECRET"}),
            {status: 500, headers: {"Content-Type": "application/json"}}
        );
    }

    const store = getStore(env.EO_BLOB_STORE_KEY);
    const authHeader = request.headers.get("X-Auth-Key");
    if (authHeader !== env.EO_BLOB_STORE_SECRET) {
        return new Response(JSON.stringify({error: "Unauthorized"}), {
            status: 401,
            headers: {"Content-Type": "application/json"},
        });
    }

    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (!key) {
        return new Response(JSON.stringify({error: "Missing ?key= parameter"}), {
            status: 400,
            headers: {"Content-Type": "application/json"},
        });
    }

    const blob = await request.blob();
    await store.set(key, blob);

    return new Response(
        JSON.stringify({ok: true, key}),
        {headers: {"Content-Type": "application/json"}}
    );
}
