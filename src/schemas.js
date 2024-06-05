

const login_schema = {
    "$schema": "http://json-schema.org/schema#",
    "$comment": "Login action parameters",
    "title": "Parameters for /login route",
    "type": "object",
    "properties": {
        "login": {
            "type": "string"
        },
        "password": {
            "type": "string"
        }
    },
    "required": ["login", "password"],
    "additionalProperties": false
};

const postdata_schema = {
    "$schema": "http://json-schema.org/schema#",
    "$comment": "Postdata action parameters",
    "title": "Parameters for /postdata route",
    "type": "object",
    "properties": {
        "token": {
            "type": "string"
        },
        "data": {
        }
    },
    "required": ["token", "data"],
    "additionalProperties": false
};

const pull_schema = {
    "$schema": "http://json-schema.org/schema#",
    "$comment": "Pull action parameters",
    "title": "Parameters for /pull route",
    "type": "object",
    "properties": {
        "token": {
            "type": "string"
        }
    },
    "required": ["token"],
    "additionalProperties": false
};


exports.login_schema = login_schema;
exports.postdata_schema = postdata_schema;
exports.pull_schema = pull_schema;
