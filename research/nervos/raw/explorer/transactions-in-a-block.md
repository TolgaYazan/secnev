---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# Transactions in a block

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
    "/block_transactions/{block_hash}": {
      "get": {
        "summary": "Transactions in a block",
        "description": "",
        "operationId": "transactions-in-a-block",
        "parameters": [
          {
            "name": "block_hash",
            "in": "path",
            "schema": {
              "type": "string",
              "default": "0xe145af6f0d1af070765bc86cae924c25e507b19317055e82c205ec0a46d4f03f"
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
              "default": 10
            }
          },
          {
            "name": "tx_hash",
            "in": "query",
            "description": "Filter transactions by transaction hash",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "address_hash",
            "in": "query",
            "description": "Filter transactions by address",
            "schema": {
              "type": "string"
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
                    "value": "{\n  \"data\": [\n    {\n      \"id\": \"22658969\",\n      \"type\": \"ckb_transactions\",\n      \"attributes\": {\n        \"is_cellbase\": true,\n        \"transaction_hash\": \"0x865b124e5dd1f12d7c7802832eca0bc3843697839ca148eb3bac27e8a6735954\",\n        \"block_number\": \"10569707\",\n        \"block_timestamp\": \"1690619386554\",\n        \"display_inputs_count\": 1,\n        \"display_outputs_count\": 1,\n        \"display_inputs\": [\n          {\n            \"id\": \"\",\n            \"from_cellbase\": true,\n            \"capacity\": \"\",\n            \"address_hash\": \"\",\n            \"target_block_number\": \"10569696\",\n            \"generated_tx_hash\": \"0x865b124e5dd1f12d7c7802832eca0bc3843697839ca148eb3bac27e8a6735954\"\n          }\n        ],\n        \"display_outputs\": [\n          {\n            \"id\": \"42283180\",\n            \"capacity\": \"159670855525.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq0dn8gg6ag6uvkl0lr0xpyt0n99dsal47sm7mzyj\",\n            \"target_block_number\": \"10569696\",\n            \"base_reward\": \"154911810919\",\n            \"commit_reward\": \"1847\",\n            \"proposal_reward\": \"2039\",\n            \"secondary_reward\": \"4759040720\",\n            \"status\": \"live\",\n            \"consumed_tx_hash\": \"\"\n          }\n        ],\n        \"income\": null\n      }\n    },\n    {\n      \"id\": \"22658970\",\n      \"type\": \"ckb_transactions\",\n      \"attributes\": {\n        \"is_cellbase\": false,\n        \"transaction_hash\": \"0xf5b7165467ab0f47bb972e5983e5cf5a5545de8149944b6ba0cf40177ea3a81c\",\n        \"block_number\": \"10569707\",\n        \"block_timestamp\": \"1690619386554\",\n        \"display_inputs_count\": 2,\n        \"display_outputs_count\": 2,\n        \"display_inputs\": [\n          {\n            \"id\": \"42282461\",\n            \"from_cellbase\": false,\n            \"capacity\": \"12599990000.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqfgt263lp78h5lzah0ls93fyklnwz3fphgwfy2ee\",\n            \"generated_tx_hash\": \"0xff7e6bfa4651563e2b6ab2cf7209fc59d265a8f5b820bf74d866f5ef2a718f0a\",\n            \"cell_index\": \"0\",\n            \"cell_type\": \"normal\",\n            \"since\": {\n              \"raw\": \"0x0000000000000000\",\n              \"median_timestamp\": \"1690619207847\"\n            }\n          },\n          {\n            \"id\": \"42282460\",\n            \"from_cellbase\": false,\n            \"capacity\": \"12599990000.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqfgt263lp78h5lzah0ls93fyklnwz3fphgwfy2ee\",\n            \"generated_tx_hash\": \"0xce24e2392164328a2fd7ac36a18d93ad766060e9758d60f6ea15b011c1353765\",\n            \"cell_index\": \"0\",\n            \"cell_type\": \"normal\",\n            \"since\": {\n              \"raw\": \"0x0000000000000000\",\n              \"median_timestamp\": \"1690619207847\"\n            }\n          }\n        ],\n        \"display_outputs\": [\n          {\n            \"id\": \"42283153\",\n            \"capacity\": \"12600000000.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqfgt263lp78h5lzah0ls93fyklnwz3fphgwfy2ee\",\n            \"status\": \"pending\",\n            \"consumed_tx_hash\": \"\",\n            \"cell_type\": \"normal\"\n          },\n          {\n            \"id\": \"42283154\",\n            \"capacity\": \"12599970000.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqfgt263lp78h5lzah0ls93fyklnwz3fphgwfy2ee\",\n            \"status\": \"pending\",\n            \"consumed_tx_hash\": \"\",\n            \"cell_type\": \"normal\"\n          }\n        ],\n        \"income\": null\n      }\n    },\n    {\n      \"id\": \"22658971\",\n      \"type\": \"ckb_transactions\",\n      \"attributes\": {\n        \"is_cellbase\": false,\n        \"transaction_hash\": \"0x535cc3d4337e0c2e76da76146aa6930a433283d1f5c52f02e689ac1ef17d7e56\",\n        \"block_number\": \"10569707\",\n        \"block_timestamp\": \"1690619386554\",\n        \"display_inputs_count\": 3,\n        \"display_outputs_count\": 3,\n        \"display_inputs\": [\n          {\n            \"id\": \"42283093\",\n            \"from_cellbase\": false,\n            \"capacity\": \"31800000000.0\",\n            \"address_hash\": \"ckb1qzjrnpmgmpaaz7h2zds7msave44qz9mhfhzwhjqnh7sh869vp5yx6qgqwhrzgpkxkxqd3llfvsqd0uywd6yarpkuqqu2gqs3\",\n            \"generated_tx_hash\": \"0xf9fffe002e47cc9e120ed3b54264be5a9c20cc5e5c468d81b611b9a020445849\",\n            \"cell_index\": \"0\",\n            \"cell_type\": \"normal\",\n            \"since\": {\n              \"raw\": \"0x4000000064c4ccbb\",\n              \"median_timestamp\": \"1690619207847\"\n            }\n          },\n          {\n            \"id\": \"42283094\",\n            \"from_cellbase\": false,\n            \"capacity\": \"60000000000.0\",\n            \"address_hash\": \"ckb1qzmpjxz2hy2zc5dsae6lfcjtempaqalwlegnz9d666yrd5r88r7jcqgu5dwttldyh42zuuweffk47nqdy4wk6ma6w0zpeazay6f7txesw2qddt80jukmg6yypzj7r9he96cy2l9qq0v658z9luzs266znv6njwhupgqqqqqqqqm2devk\",\n            \"generated_tx_hash\": \"0xf9fffe002e47cc9e120ed3b54264be5a9c20cc5e5c468d81b611b9a020445849\",\n            \"cell_index\": \"1\",\n            \"cell_type\": \"normal\",\n            \"since\": {\n              \"raw\": \"0x0000000000000000\",\n              \"median_timestamp\": \"1690619207847\"\n            }\n          },\n          {\n            \"id\": \"42283095\",\n            \"from_cellbase\": false,\n            \"capacity\": \"434391294091.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt4ccjqd343srv0l6tyqrtlprnw38gcdhqcwfvsy\",\n            \"generated_tx_hash\": \"0xf9fffe002e47cc9e120ed3b54264be5a9c20cc5e5c468d81b611b9a020445849\",\n            \"cell_index\": \"2\",\n            \"cell_type\": \"normal\",\n            \"since\": {\n              \"raw\": \"0x0000000000000000\",\n              \"median_timestamp\": \"1690619207847\"\n            }\n          }\n        ],\n        \"display_outputs\": [\n          {\n            \"id\": \"42283150\",\n            \"capacity\": \"31800000000.0\",\n            \"address_hash\": \"ckb1qzjrnpmgmpaaz7h2zds7msave44qz9mhfhzwhjqnh7sh869vp5yx6qgqwhrzgpkxkxqd3llfvsqd0uywd6yarpkuqqu2gqs3\",\n            \"status\": \"pending\",\n            \"consumed_tx_hash\": \"\",\n            \"cell_type\": \"normal\"\n          },\n          {\n            \"id\": \"42283151\",\n            \"capacity\": \"60000000000.0\",\n            \"address_hash\": \"ckb1qzmpjxz2hy2zc5dsae6lfcjtempaqalwlegnz9d666yrd5r88r7jcqgu5dwttldyh42zuuweffk47nqdy4wk6ma6w0zpeazay6f7txesw2qddt80jukmg6yypzj7r9he96cy2l9qq0v658z9luzs266znv6njwlupgqqqqqqqq4dyqqc\",\n            \"status\": \"pending\",\n            \"consumed_tx_hash\": \"\",\n            \"cell_type\": \"normal\"\n          },\n          {\n            \"id\": \"42283152\",\n            \"capacity\": \"434391291579.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt4ccjqd343srv0l6tyqrtlprnw38gcdhqcwfvsy\",\n            \"status\": \"pending\",\n            \"consumed_tx_hash\": \"\",\n            \"cell_type\": \"normal\"\n          }\n        ],\n        \"income\": null\n      }\n    }\n  ],\n  \"meta\": {\n    \"total\": 3,\n    \"page_size\": 10\n  }\n}"
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
                            "example": "22658969"
                          },
                          "type": {
                            "type": "string",
                            "example": "ckb_transactions"
                          },
                          "attributes": {
                            "type": "object",
                            "properties": {
                              "is_cellbase": {
                                "type": "boolean",
                                "example": true,
                                "default": true
                              },
                              "transaction_hash": {
                                "type": "string",
                                "example": "0x865b124e5dd1f12d7c7802832eca0bc3843697839ca148eb3bac27e8a6735954"
                              },
                              "block_number": {
                                "type": "string",
                                "example": "10569707"
                              },
                              "block_timestamp": {
                                "type": "string",
                                "example": "1690619386554"
                              },
                              "display_inputs_count": {
                                "type": "integer",
                                "example": 1,
                                "default": 0
                              },
                              "display_outputs_count": {
                                "type": "integer",
                                "example": 1,
                                "default": 0
                              },
                              "display_inputs": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": ""
                                    },
                                    "from_cellbase": {
                                      "type": "boolean",
                                      "example": true,
                                      "default": true
                                    },
                                    "capacity": {
                                      "type": "string",
                                      "example": ""
                                    },
                                    "address_hash": {
                                      "type": "string",
                                      "example": ""
                                    },
                                    "target_block_number": {
                                      "type": "string",
                                      "example": "10569696"
                                    },
                                    "generated_tx_hash": {
                                      "type": "string",
                                      "example": "0x865b124e5dd1f12d7c7802832eca0bc3843697839ca148eb3bac27e8a6735954"
                                    }
                                  }
                                }
                              },
                              "display_outputs": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "42283180"
                                    },
                                    "capacity": {
                                      "type": "string",
                                      "example": "159670855525.0"
                                    },
                                    "address_hash": {
                                      "type": "string",
                                      "example": "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq0dn8gg6ag6uvkl0lr0xpyt0n99dsal47sm7mzyj"
                                    },
                                    "target_block_number": {
                                      "type": "string",
                                      "example": "10569696"
                                    },
                                    "base_reward": {
                                      "type": "string",
                                      "example": "154911810919"
                                    },
                                    "commit_reward": {
                                      "type": "string",
                                      "example": "1847"
                                    },
                                    "proposal_reward": {
                                      "type": "string",
                                      "example": "2039"
                                    },
                                    "secondary_reward": {
                                      "type": "string",
                                      "example": "4759040720"
                                    },
                                    "status": {
                                      "type": "string",
                                      "example": "live"
                                    },
                                    "consumed_tx_hash": {
                                      "type": "string",
                                      "example": ""
                                    }
                                  }
                                }
                              },
                              "income": {}
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
                          "example": 3,
                          "default": 0
                        },
                        "page_size": {
                          "type": "integer",
                          "example": 10,
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
  "_id": "64c3a08be5d2e500127a91cc:64c4ce18af5766006f4bb5c9"
}
```