---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# XUDT List

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
    "/xudts": {
      "get": {
        "summary": "XUDT List",
        "description": "",
        "operationId": "xudt-list",
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
          },
          {
            "name": "symbol",
            "in": "query",
            "description": "xUDT symbol, case-insensitive",
            "schema": {
              "type": "string",
              "default": "seal"
            }
          },
          {
            "name": "tags",
            "in": "query",
            "description": "tags to filter tokens, availables are \"rgbpp-compatible\", \"layer-1-asset\", \"layer-2-asset\", \"supply-limited\", \"supply-unlimited\", \"suspicious\", \"invalid\"",
            "schema": {
              "type": "string",
              "default": "layer-1-asset,supply-limited"
            }
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
              "default": 25
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
                    "value": "{\n    \"data\": [\n        {\n            \"id\": \"182911\",\n            \"type\": \"udt\",\n            \"attributes\": {\n                \"symbol\": \"UBBQT\",\n                \"full_name\": \"Unique BBQ TEST\",\n                \"icon_file\": null,\n                \"published\": true,\n                \"description\": null,\n                \"type_hash\": \"0x1b2c5f414541d81a19d6b70621779479911987d080fd9e3223b84f561e08ce3d\",\n                \"type_script\": {\n                    \"args\": \"0x35344439f289faf8e784bc674c76c624d37fa5bbfd167694eb6cfef9f7f2eb78\",\n                    \"code_hash\": \"0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95\",\n                    \"hash_type\": \"data1\"\n                },\n                \"issuer_address\": null,\n                \"display_name\": null,\n                \"uan\": null,\n                \"udt_type\": \"xudt\",\n                \"operator_website\": null,\n                \"email\": null,\n                \"total_amount\": \"0\",\n                \"addresses_count\": \"23\",\n                \"decimal\": \"8\",\n                \"h24_ckb_transactions_count\": \"16\",\n                \"created_at\": \"1711858381203\",\n                \"xudt_tags\": [\"duplicate\", \"layer-1-asset\", \"supply-limited\"]\n            }\n        }\n    ],\n    \"meta\": {\n        \"total\": 1,\n        \"page_size\": 25\n    }\n}"
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
                          "id": {
                            "type": "string",
                            "example": "182911"
                          },
                          "type": {
                            "type": "string",
                            "example": "udt"
                          },
                          "attributes": {
                            "type": "object",
                            "properties": {
                              "symbol": {
                                "type": "string",
                                "example": "UBBQT"
                              },
                              "full_name": {
                                "type": "string",
                                "example": "Unique BBQ TEST"
                              },
                              "icon_file": {},
                              "published": {
                                "type": "boolean",
                                "example": true,
                                "default": true
                              },
                              "description": {},
                              "type_hash": {
                                "type": "string",
                                "example": "0x1b2c5f414541d81a19d6b70621779479911987d080fd9e3223b84f561e08ce3d"
                              },
                              "type_script": {
                                "type": "object",
                                "properties": {
                                  "args": {
                                    "type": "string",
                                    "example": "0x35344439f289faf8e784bc674c76c624d37fa5bbfd167694eb6cfef9f7f2eb78"
                                  },
                                  "code_hash": {
                                    "type": "string",
                                    "example": "0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95"
                                  },
                                  "hash_type": {
                                    "type": "string",
                                    "example": "data1"
                                  }
                                }
                              },
                              "issuer_address": {},
                              "display_name": {},
                              "uan": {},
                              "udt_type": {
                                "type": "string",
                                "example": "xudt"
                              },
                              "operator_website": {},
                              "email": {},
                              "total_amount": {
                                "type": "string",
                                "example": "0"
                              },
                              "addresses_count": {
                                "type": "string",
                                "example": "23"
                              },
                              "decimal": {
                                "type": "string",
                                "example": "8"
                              },
                              "h24_ckb_transactions_count": {
                                "type": "string",
                                "example": "16"
                              },
                              "created_at": {
                                "type": "string",
                                "example": "1711858381203"
                              },
                              "xudt_tags": {
                                "type": "array",
                                "items": {
                                  "type": "string",
                                  "example": "duplicate"
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "meta": {
                      "type": "object",
                      "properties": {
                        "total": {
                          "type": "integer",
                          "example": 1,
                          "default": 0
                        },
                        "page_size": {
                          "type": "integer",
                          "example": 25,
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
  "_id": "64c3a08be5d2e500127a91cc:660cd37439d87e0031acc39f"
}
```