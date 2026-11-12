---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# Address

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
    "/addresses/{address}": {
      "get": {
        "summary": "Address",
        "description": "",
        "operationId": "address",
        "parameters": [
          {
            "name": "address",
            "in": "path",
            "description": "CKB Addressckb1qrgqep8saj8agswr30pls73hra28ry8jlnlc3ejzh3dl2ju7xxpjxqgqqy3wfc0yrznfrsavpvn9n5fhsfw4kl49uux6dser",
            "schema": {
              "type": "string"
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
              "default": 100
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
                    "value": "{\n  \"data\": [\n    {\n      \"id\": \"11459477\",\n      \"type\": \"address\",\n      \"attributes\": {\n        \"lock_info\": null,\n        \"address_hash\": \"ckb1qz7xc452rgxs5z0ks3xun46dmdp58sepg0ljtae8ck0d7nah945nvqgzqqqqph57wnrmd65j4d9q599p56xknjhkpn2gah324lhz6cvacam5j366kdufyc\",\n        \"balance\": \"35499980792\",\n        \"transactions_count\": \"1\",\n        \"dao_deposit\": \"0\",\n        \"interest\": \"0\",\n        \"is_special\": \"false\",\n        \"live_cells_count\": \"1\",\n        \"mined_blocks_count\": \"0\",\n        \"average_deposit_time\": \"\",\n        \"udt_accounts\": [\n          {\n            \"symbol\": \"Nervape\",\n            \"amount\": \"57497022152830372215459976662917312177579470129615508189059691569576637052165\",\n            \"type_hash\": \"0x91d51bfbbaa0aa6d9e162224fb8b539e1c5dd7abe351d1c5cfac98906721b86d\",\n            \"collection\": {\n              \"type_hash\": \"0xb8a46214f1c1602d69ea30c5fe4552829277af91b3c5199fdc7f83b3d48ce250\"\n            },\n            \"udt_icon_file\": \"0x7500000010000000190000005100000005000000646f622f30340000007b226964223a313636322c22646e61223a223962326262336133306332326166383965386232626134326130653033343836227d20000000d5852c19fa4fa394d64915cafe026cdeb702ce53cf2b839c6ace501e8dead41c\",\n            \"udt_type\": \"spore_cell\",\n            \"udt_type_script\": {\n              \"args\": \"0x7f1e294a27a717e3cf1fdd4d4ec23c3f3d37668b55e517c90578aa4dad173505\",\n              \"code_hash\": \"0x4a4dce1df3dffff7f8b2cd7dff7303df3b6150c9788cb75dcf6747247132b9f5\",\n              \"hash_type\": \"data1\"\n            }\n          }\n        ],\n        \"lock_script\": {\n          \"args\": \"0x02000000de9e74c7b6ea92ab4a0a14a1a68d69caf60cd48ede2aafee2d619dc77749475a\",\n          \"code_hash\": \"0xbc6c568a1a0d0a09f6844dc9d74ddb4343c32143ff25f727c59edf4fb72d6936\",\n          \"hash_type\": \"type\"\n        },\n        \"dao_compensation\": \"0\",\n        \"balance_occupied\": \"35499980792\",\n        \"bitcoin_address_hash\": \"bc1qza4ckqsxx6gdd7jqnylymgauwauw0fjv6m54tc\"\n      }\n    }\n  ],\n  \"meta\": {\n    \"total\": 1,\n    \"page_size\": 100,\n    \"total_pages\": 1\n  }\n}"
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
                            "example": "11459477"
                          },
                          "type": {
                            "type": "string",
                            "example": "address"
                          },
                          "attributes": {
                            "type": "object",
                            "properties": {
                              "lock_info": {},
                              "address_hash": {
                                "type": "string",
                                "example": "ckb1qz7xc452rgxs5z0ks3xun46dmdp58sepg0ljtae8ck0d7nah945nvqgzqqqqph57wnrmd65j4d9q599p56xknjhkpn2gah324lhz6cvacam5j366kdufyc"
                              },
                              "balance": {
                                "type": "string",
                                "example": "35499980792"
                              },
                              "transactions_count": {
                                "type": "string",
                                "example": "1"
                              },
                              "dao_deposit": {
                                "type": "string",
                                "example": "0"
                              },
                              "interest": {
                                "type": "string",
                                "example": "0"
                              },
                              "is_special": {
                                "type": "string",
                                "example": "false"
                              },
                              "live_cells_count": {
                                "type": "string",
                                "example": "1"
                              },
                              "mined_blocks_count": {
                                "type": "string",
                                "example": "0"
                              },
                              "average_deposit_time": {
                                "type": "string",
                                "example": ""
                              },
                              "udt_accounts": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "symbol": {
                                      "type": "string",
                                      "example": "Nervape"
                                    },
                                    "amount": {
                                      "type": "string",
                                      "example": "57497022152830372215459976662917312177579470129615508189059691569576637052165"
                                    },
                                    "type_hash": {
                                      "type": "string",
                                      "example": "0x91d51bfbbaa0aa6d9e162224fb8b539e1c5dd7abe351d1c5cfac98906721b86d"
                                    },
                                    "collection": {
                                      "type": "object",
                                      "properties": {
                                        "type_hash": {
                                          "type": "string",
                                          "example": "0xb8a46214f1c1602d69ea30c5fe4552829277af91b3c5199fdc7f83b3d48ce250"
                                        }
                                      }
                                    },
                                    "udt_icon_file": {
                                      "type": "string",
                                      "example": "0x7500000010000000190000005100000005000000646f622f30340000007b226964223a313636322c22646e61223a223962326262336133306332326166383965386232626134326130653033343836227d20000000d5852c19fa4fa394d64915cafe026cdeb702ce53cf2b839c6ace501e8dead41c"
                                    },
                                    "udt_type": {
                                      "type": "string",
                                      "example": "spore_cell"
                                    },
                                    "udt_type_script": {
                                      "type": "object",
                                      "properties": {
                                        "args": {
                                          "type": "string",
                                          "example": "0x7f1e294a27a717e3cf1fdd4d4ec23c3f3d37668b55e517c90578aa4dad173505"
                                        },
                                        "code_hash": {
                                          "type": "string",
                                          "example": "0x4a4dce1df3dffff7f8b2cd7dff7303df3b6150c9788cb75dcf6747247132b9f5"
                                        },
                                        "hash_type": {
                                          "type": "string",
                                          "example": "data1"
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "lock_script": {
                                "type": "object",
                                "properties": {
                                  "args": {
                                    "type": "string",
                                    "example": "0x02000000de9e74c7b6ea92ab4a0a14a1a68d69caf60cd48ede2aafee2d619dc77749475a"
                                  },
                                  "code_hash": {
                                    "type": "string",
                                    "example": "0xbc6c568a1a0d0a09f6844dc9d74ddb4343c32143ff25f727c59edf4fb72d6936"
                                  },
                                  "hash_type": {
                                    "type": "string",
                                    "example": "type"
                                  }
                                }
                              },
                              "dao_compensation": {
                                "type": "string",
                                "example": "0"
                              },
                              "balance_occupied": {
                                "type": "string",
                                "example": "35499980792"
                              },
                              "bitcoin_address_hash": {
                                "type": "string",
                                "example": "bc1qza4ckqsxx6gdd7jqnylymgauwauw0fjv6m54tc"
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
                          "example": 100,
                          "default": 0
                        },
                        "total_pages": {
                          "type": "integer",
                          "example": 1,
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
  "_id": "64c3a08be5d2e500127a91cc:64c3a92cdece2600246088f5"
}
```