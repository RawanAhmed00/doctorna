<?php

function getHttpStatusMessage(int $code): string {
    $messages = [
        200 => "Success",
        201 => "Resource Created Successfully",
        202 => "Accepted",
        204 => "No Content",
        400 => "Bad Request - Please check your input",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Resource Not Found",
        405 => "Method Not Allowed",
        409 => "Conflict",
        422 => "Unprocessable Entity",
        500 => "Internal Server Error - Something went wrong on our side",
        501 => "Not Implemented",
        503 => "Service Unavailable"
    ];
    return $messages[$code] ?? "Unknown Status";
}
