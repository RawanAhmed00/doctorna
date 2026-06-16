<?php

function HttpStatus(string $status): int {
    $codes = [
        'OK' => 200,
        'CREATED' => 201,
        'ACCEPTED' => 202,
        'NO_CONTENT' => 204,
        'BAD_REQUEST' => 400,
        'UNAUTHORIZED' => 401,
        'FORBIDDEN' => 403,
        'NOT_FOUND' => 404,
        'METHOD_NOT_ALLOWED' => 405,
        'CONFLICT' => 409,
        'UNPROCESSABLE_ENTITY' => 422,
        'INTERNAL_SERVER_ERROR' => 500,
        'NOT_IMPLEMENTED' => 501,
        'SERVICE_UNAVAILABLE' => 503
    ];
    return $codes[$status] ?? 500;
}

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
