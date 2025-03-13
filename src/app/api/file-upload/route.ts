import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // parse incoming FormData
        const formData = await request.formData();
        const files = formData.getAll("embeddingFiles") as File[];
        const userId = formData.get("userId") as string;

        if (!userId) {
            return NextResponse.json({ error: "Missing userId in form data" }, { status: 400 });
        }

        if (!files.length) {
            return NextResponse.json({ error: "No files received" }, { status: 400 });
        }

        // forward to external embedding service - we will recreate a new FormData to send to NEXT_PUBLIC_EMBEDDING_SERVICE_API
        const embeddingServiceUrl = process.env.NEXT_PUBLIC_EMBEDDING_SERVICE_API;
        if (!embeddingServiceUrl) {
            return NextResponse.json(
                { error: "Missing the embedding service details." },
                { status: 500 }
            );
        }

        // build a new FormData for the external request
        const externalFormData = new FormData();
        externalFormData.append("userId", userId);
        for (const file of files) {
            externalFormData.append("files", file);
        }

        // make the request to your external service
        const externalRes = await fetch(embeddingServiceUrl, {
            method: "POST",
            body: externalFormData,
        });

        if (!externalRes.ok) {
            const errText = await externalRes.text();
            return NextResponse.json(
                { error: `Embedding service error: ${errText}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: any) {
        console.error("Failed to process embeddings upload: ", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
