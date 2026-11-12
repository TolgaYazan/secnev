---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# Statistics

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
    "/statistics": {
      "get": {
        "summary": "Statistics",
        "description": "",
        "operationId": "statistics",
        "parameters": [
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
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"data\": {\n    \"id\": \"1\",\n    \"type\": \"index_statistic\",\n    \"attributes\": {\n      \"epoch_info\": {\n        \"epoch_number\": \"8081\",\n        \"epoch_length\": \"1238\",\n        \"index\": \"197\"\n      },\n      \"tip_block_number\": \"10569797\",\n      \"average_block_time\": \"11886.98\",\n      \"current_epoch_difficulty\": \"1806383573922273186\",\n      \"hash_rate\": \"159898818082987.600315\",\n      \"estimated_epoch_time\": \"13985737.301417\",\n      \"transactions_last_24hrs\": \"21903\",\n      \"transactions_count_per_minute\": \"13\",\n      \"reorg_started_at\": null\n    },\n    \"relationships\": {}\n  }\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "example": "1"
                        },
                        "type": {
                          "type": "string",
                          "example": "index_statistic"
                        },
                        "attributes": {
                          "type": "object",
                          "properties": {
                            "epoch_info": {
                              "type": "object",
                              "properties": {
                                "epoch_number": {
                                  "type": "string",
                                  "example": "8081"
                                },
                                "epoch_length": {
                                  "type": "string",
                                  "example": "1238"
                                },
                                "index": {
                                  "type": "string",
                                  "example": "197"
                                }
                              }
                            },
                            "tip_block_number": {
                              "type": "string",
                              "example": "10569797"
                            },
                            "average_block_time": {
                              "type": "string",
                              "example": "11886.98"
                            },
                            "current_epoch_difficulty": {
                              "type": "string",
                              "example": "1806383573922273186"
                            },
                            "hash_rate": {
                              "type": "string",
                              "example": "159898818082987.600315"
                            },
                            "estimated_epoch_time": {
                              "type": "string",
                              "example": "13985737.301417"
                            },
                            "transactions_last_24hrs": {
                              "type": "string",
                              "example": "21903"
                            },
                            "transactions_count_per_minute": {
                              "type": "string",
                              "example": "13"
                            },
                            "reorg_started_at": {}
                          }
                        },
                        "relationships": {
                          "type": "object",
                          "properties": {}
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
  "_id": "64c3a08be5d2e500127a91cc:64c4d28b8406c6003def1900"
}
```