---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# General info of a script

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "v2",
    "version": "1.0"
  },
  "servers": [
    {
      "url": "https://mainnet-api.explorer.nervos.org/api/v2/"
    }
  ],
  "security": [
    {}
  ],
  "paths": {
    "/scripts/general_info": {
      "get": {
        "summary": "General info of a script",
        "description": "",
        "operationId": "general-info-of-a-script",
        "parameters": [
          {
            "name": "code_hash",
            "in": "query",
            "description": "Code hash of the script",
            "required": true,
            "schema": {
              "type": "string",
              "default": "0xa4398768d87bd17aea1361edc3accd6a0117774dc4ebc813bfa173e8ac0d086d"
            }
          },
          {
            "name": "hash_type",
            "in": "query",
            "description": "Hash type of the script",
            "required": true,
            "schema": {
              "type": "string",
              "enum": [
                "type",
                "data"
              ],
              "default": "type"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"data\": {\n    \"id\": 11122006,\n    \"code_hash\": \"0xa4398768d87bd17aea1361edc3accd6a0117774dc4ebc813bfa173e8ac0d086d\",\n    \"hash_type\": \"type\",\n    \"script_type\": \"LockScript\",\n    \"capacity_of_deployed_cells\": \"10729400000000.0\",\n    \"capacity_of_referring_cells\": \"0.0\",\n    \"count_of_transactions\": 719842,\n    \"count_of_deployed_cells\": 1,\n    \"count_of_referring_cells\": 0\n  }\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 11122006,
                          "default": 0
                        },
                        "code_hash": {
                          "type": "string",
                          "example": "0xa4398768d87bd17aea1361edc3accd6a0117774dc4ebc813bfa173e8ac0d086d"
                        },
                        "hash_type": {
                          "type": "string",
                          "example": "type"
                        },
                        "script_type": {
                          "type": "string",
                          "example": "LockScript"
                        },
                        "capacity_of_deployed_cells": {
                          "type": "string",
                          "example": "10729400000000.0"
                        },
                        "capacity_of_referring_cells": {
                          "type": "string",
                          "example": "0.0"
                        },
                        "count_of_transactions": {
                          "type": "integer",
                          "example": 719842,
                          "default": 0
                        },
                        "count_of_deployed_cells": {
                          "type": "integer",
                          "example": 1,
                          "default": 0
                        },
                        "count_of_referring_cells": {
                          "type": "integer",
                          "example": 0,
                          "default": 0
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "64c4d30d5e5cc1000a385424:64c4d6a43673650059bd5ffa"
}
```