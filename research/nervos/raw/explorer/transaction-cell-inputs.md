---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# Transaction cell inputs

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
    "/ckb_transactions/{hash}/display_inputs": {
      "get": {
        "summary": "Transaction cell inputs",
        "description": "",
        "operationId": "transaction-cell-inputs",
        "parameters": [
          {
            "name": "hash",
            "in": "path",
            "description": "Transaction hash",
            "schema": {
              "type": "string",
              "default": "0x1d9c9ee6693b7375310241e7dfdfacfc851f24bff75e60f3f7d45832bbe64c6e"
            },
            "required": true
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "page_size",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
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
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
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
  "_id": "64c4d30d5e5cc1000a385424:66f6724d86818b002530ad4e"
}
```