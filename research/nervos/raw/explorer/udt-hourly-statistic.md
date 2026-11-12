---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# Rgbpp assets statistic

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
    "/rgbpp_assets_statistics": {
      "get": {
        "summary": "Rgbpp assets statistic",
        "description": "",
        "operationId": "udt-hourly-statistic",
        "parameters": [
          {
            "name": "indicators",
            "in": "query",
            "description": "The indicators are enum values: ft_count, dob_count, holders_count, transactions_count, which can be combined and separated by commas, such as ft_count,dob_count.",
            "schema": {
              "type": "string",
              "enum": [
                "ft_count",
                "dob_count",
                "holders_count",
                "transactions_count"
              ]
            }
          },
          {
            "name": "network",
            "in": "query",
            "description": "The holders_count and transactions_count correspond to the network parameter, which can be either btc or ckb.",
            "schema": {
              "type": "string",
              "enum": [
                "global",
                "ckb",
                "btc"
              ]
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
                    "value": "{\n    \"data\": [\n        {\n            \"indicator\": \"ft_count\",\n            \"value\": \"1205\",\n            \"network\": \"global\",\n            \"created_at_unixtimestamp\": \"1733932800\"\n        },\n        {\n            \"indicator\": \"dob_count\",\n            \"value\": \"282\",\n            \"network\": \"global\",\n            \"created_at_unixtimestamp\": \"1733932800\"\n        },\n        {\n            \"indicator\": \"transactions_count\",\n            \"value\": \"8\",\n            \"network\": \"btc\",\n            \"created_at_unixtimestamp\": \"1733932800\"\n        },\n        {\n            \"indicator\": \"transactions_count\",\n            \"value\": \"10\",\n            \"network\": \"ckb\",\n            \"created_at_unixtimestamp\": \"1733932800\"\n        },\n        {\n            \"indicator\": \"holders_count\",\n            \"value\": \"1072\",\n            \"network\": \"btc\",\n            \"created_at_unixtimestamp\": \"1733932800\"\n        },\n        {\n            \"indicator\": \"holders_count\",\n            \"value\": \"23656\",\n            \"network\": \"ckb\",\n            \"created_at_unixtimestamp\": \"1733932800\"\n        }\n    ]\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "indicator": {
                            "type": "string",
                            "example": "ft_count"
                          },
                          "value": {
                            "type": "string",
                            "example": "1205"
                          },
                          "network": {
                            "type": "string",
                            "example": "global"
                          },
                          "created_at_unixtimestamp": {
                            "type": "string",
                            "example": "1733932800"
                          }
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
  "_id": "64c4d30d5e5cc1000a385424:675fee9af443111964be4195"
}
```