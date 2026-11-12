---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# SUDT

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
    "/udts/{type_hash}": {
      "get": {
        "summary": "SUDT",
        "description": "",
        "operationId": "udt",
        "parameters": [
          {
            "name": "type_hash",
            "in": "path",
            "description": "Type Hash of specific UDT",
            "schema": {
              "type": "string",
              "default": "0x1ebe22fe7d9740e56998b6b874aac985af4ca4040d82b251951fb536f405244d"
            },
            "required": true
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
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"data\": {\n    \"id\": \"93833\",\n    \"type\": \"udt\",\n    \"attributes\": {\n      \"symbol\": \"KOI\",\n      \"full_name\": \"StableKoi Token\",\n      \"icon_file\": \"https://app.stablekoi.com/images/tokens/0xd66eb642eE33837531FdA61eb7Ab15B15658BcaB.svg\",\n      \"published\": true,\n      \"description\": null,\n      \"type_hash\": \"0x1ebe22fe7d9740e56998b6b874aac985af4ca4040d82b251951fb536f405244d\",\n      \"type_script\": {\n        \"args\": \"0x68ab5e63d676ce31c56c73d037f38bc35398d4af94b43f8717832c1c81eb251e\",\n        \"code_hash\": \"0x5e7a36a77e68eecc013dfa2fe6a23f3b6c344b04005808694ae6dd45eea4cfd5\",\n        \"hash_type\": \"type\"\n      },\n      \"issuer_address\": \"ckb1qz0n46hjl3pe2jwtepcvv5ehf9p6l94qvk9addgmarvfsvvrum6j7qgpma4tnak67fwm6v238fkvc3que7eppffupq8n2g9gvm8zfnzhk2t6gst958ncz84zw9l8nzd42faw9uf94yhnjdqve5h\",\n      \"display_name\": \"\",\n      \"uan\": \"\",\n      \"total_amount\": \"382800000100000000000000000000\",\n      \"addresses_count\": \"1672\",\n      \"decimal\": \"18\",\n      \"h24_ckb_transactions_count\": \"0\",\n      \"created_at\": \"1658201333317\"\n    }\n  }\n}"
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
                          "example": "93833"
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
                              "example": "KOI"
                            },
                            "full_name": {
                              "type": "string",
                              "example": "StableKoi Token"
                            },
                            "icon_file": {
                              "type": "string",
                              "example": "https://app.stablekoi.com/images/tokens/0xd66eb642eE33837531FdA61eb7Ab15B15658BcaB.svg"
                            },
                            "published": {
                              "type": "boolean",
                              "example": true,
                              "default": true
                            },
                            "description": {},
                            "type_hash": {
                              "type": "string",
                              "example": "0x1ebe22fe7d9740e56998b6b874aac985af4ca4040d82b251951fb536f405244d"
                            },
                            "type_script": {
                              "type": "object",
                              "properties": {
                                "args": {
                                  "type": "string",
                                  "example": "0x68ab5e63d676ce31c56c73d037f38bc35398d4af94b43f8717832c1c81eb251e"
                                },
                                "code_hash": {
                                  "type": "string",
                                  "example": "0x5e7a36a77e68eecc013dfa2fe6a23f3b6c344b04005808694ae6dd45eea4cfd5"
                                },
                                "hash_type": {
                                  "type": "string",
                                  "example": "type"
                                }
                              }
                            },
                            "issuer_address": {
                              "type": "string",
                              "example": "ckb1qz0n46hjl3pe2jwtepcvv5ehf9p6l94qvk9addgmarvfsvvrum6j7qgpma4tnak67fwm6v238fkvc3que7eppffupq8n2g9gvm8zfnzhk2t6gst958ncz84zw9l8nzd42faw9uf94yhnjdqve5h"
                            },
                            "display_name": {
                              "type": "string",
                              "example": ""
                            },
                            "uan": {
                              "type": "string",
                              "example": ""
                            },
                            "total_amount": {
                              "type": "string",
                              "example": "382800000100000000000000000000"
                            },
                            "addresses_count": {
                              "type": "string",
                              "example": "1672"
                            },
                            "decimal": {
                              "type": "string",
                              "example": "18"
                            },
                            "h24_ckb_transactions_count": {
                              "type": "string",
                              "example": "0"
                            },
                            "created_at": {
                              "type": "string",
                              "example": "1658201333317"
                            }
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
  "_id": "64c3a08be5d2e500127a91cc:64c3bbc9f6cdd700490158fe"
}
```