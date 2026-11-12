---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# XUDT snapshot

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "v1",
    "version": "1.0"
  },
  "servers": [
    {
      "url": "https://mainnet-api.explorer.nervos.org/api/v1/"
    }
  ],
  "security": [
    {}
  ],
  "paths": {
    "/xudts/snapshot": {
      "get": {
        "summary": "XUDT snapshot",
        "description": "",
        "operationId": "xudt-snapshot",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "xudt type_hash",
            "required": true,
            "schema": {
              "type": "string",
              "default": "0x3390b8cb174b5623fd72a2dc5af13ea428ff171573f500b0e796e1f7336bcabe"
            }
          },
          {
            "name": "number",
            "in": "query",
            "description": "specific block number",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 12973025
            }
          },
          {
            "name": "Accept",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string",
              "default": "application/vnd.api+json"
            }
          },
          {
            "name": "Content-Type",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string",
              "default": "application/vnd.api+json"
            }
          },
          {
            "name": "merge_with_owner",
            "in": "query",
            "description": "Add the merge_with_owner parameter with a default value of false. When false, return the CKB Address column; when true, return the Owner column.",
            "schema": {
              "type": "boolean",
              "default": false
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
  "_id": "64c3a08be5d2e500127a91cc:66446f94e1bf480018ed31a2"
}
```