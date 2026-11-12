---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# Udt hourly statistics

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
    "/udt_hourly_statistics/{type_hash}": {
      "get": {
        "summary": "Udt hourly statistics",
        "description": "",
        "operationId": "rgbpp-hourly-statistics",
        "parameters": [
          {
            "name": "type_hash",
            "in": "path",
            "description": "The type_hash of a specific UDT",
            "schema": {
              "type": "string"
            },
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": ""
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
  "_id": "64c4d30d5e5cc1000a385424:675fef0d83ad41fe2de935fe"
}
```