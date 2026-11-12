---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# Market indicator data

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
    "/market_data/{indicator}": {
      "get": {
        "summary": "Market indicator data",
        "description": "",
        "operationId": "market-indicator-data",
        "parameters": [
          {
            "name": "indicator",
            "in": "path",
            "schema": {
              "type": "string",
              "enum": [
                "total_supply",
                "circulating_supply"
              ]
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
        "deprecated": false,
        "security": []
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "64c3a08be5d2e500127a91cc:65685a50d17252000ffb7bf4"
}
```