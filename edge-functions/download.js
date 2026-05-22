import {getStore} from "@edgeone/pages-blob";

export default async function onRequest(context) {
    const {request, env} = context;

    if (request.method !== "GET") {
        return new Response(JSON.stringify({error: "Method not allowed"}), {
            status: 405,
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

    if (!env.EO_BLOB_STORE_KEY) {
        return new Response(
            JSON.stringify({error: "请配置环境变量 EO_BLOB_STORE_KEY"}),
            {status: 500, headers: {"Content-Type": "application/json"}}
        );
    }

    const store = getStore(env.EO_BLOB_STORE_KEY);
    const result = await store.getWithHeaders(key, {consistency: "strong"});

    if (!result) {
        return new Response(JSON.stringify({error: "File not found"}), {
            status: 404,
            headers: {"Content-Type": "application/json"},
        });
    }

    const body = await store.get(key, {type: "arrayBuffer", consistency: "strong"});

    return new Response(body, {
        headers: {
            "Content-Type": result.headers["content-type"] || "application/octet-stream",
            "Content-Disposition": "attachment",
            "Content-Length": result.headers["content-length"] || "",
            "ETag": result.headers["etag"] || "",
        },
    });
}
