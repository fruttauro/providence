import * as express from "express";

export function createResponse(res: express.Response, statusCode: number, message: string, success: boolean = true) {
    res.status(statusCode);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ data: { success: success, message: message } }));
}
