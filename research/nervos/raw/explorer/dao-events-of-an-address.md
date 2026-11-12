---
agentTools:
  projectIndex: https://ckb-explorer.readme.io/llms.txt
---

# DAO events of an address

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
    "/dao_events": {
      "get": {
        "summary": "DAO events of an address",
        "description": "",
        "operationId": "dao-events-of-an-address",
        "parameters": [
          {
            "name": "address",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "default": "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdku6gqm43say6x6xzzglfpqr5h62l9zpcd3lynr"
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
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"data\": {\n    \"id\": 2371865,\n    \"address\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdku6gqm43say6x6xzzglfpqr5h62l9zpcd3lynr\",\n    \"deposit_capacity\": \"6804900000000\",\n    \"average_deposit_time\": \"\",\n    \"activities\": [\n      {\n        \"transaction_hash\": \"0x96614fb3079fe304c4e0df6815159e0bb2a2e03185428f8b1954bc68465ca3ab\",\n        \"block_number\": \"10569716\",\n        \"block_timestamp\": \"1690619479957\",\n        \"display_inputs_count\": 1,\n        \"display_outputs_count\": 2,\n        \"display_inputs\": [\n          {\n            \"id\": \"42195373\",\n            \"from_cellbase\": false,\n            \"capacity\": \"61596491259556.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqwcdm7a5cp70967rvt79wqjn0ad8hjzneqavumvc\",\n            \"generated_tx_hash\": \"0xc6d47c57d12134ca12b4f25e96bf19a516b0a2ee6fe1654218401c2dad6f5630\",\n            \"cell_index\": \"1\",\n            \"cell_type\": \"normal\",\n            \"since\": {\n              \"raw\": \"0x0000000000000000\",\n              \"median_timestamp\": \"1690619297962\"\n            }\n          }\n        ],\n        \"display_outputs\": [\n          {\n            \"id\": \"42283262\",\n            \"capacity\": \"6804900000000.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdku6gqm43say6x6xzzglfpqr5h62l9zpcd3lynr\",\n            \"status\": \"pending\",\n            \"consumed_tx_hash\": \"\",\n            \"cell_type\": \"nervos_dao_deposit\"\n          },\n          {\n            \"id\": \"42283263\",\n            \"capacity\": \"54791591258432.0\",\n            \"address_hash\": \"ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdvp8299y34usuwdxk2a75q5g69j802j2cf349tp\",\n            \"status\": \"pending\",\n            \"consumed_tx_hash\": \"\",\n            \"cell_type\": \"normal\"\n          }\n        ]\n      }\n    ]\n  },\n  \"meta\": {\n    \"total\": 1,\n    \"page_size\": 10\n  }\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 2371865,
                          "default": 0
                        },
                        "address": {
                          "type": "string",
                          "example": "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdku6gqm43say6x6xzzglfpqr5h62l9zpcd3lynr"
                        },
                        "deposit_capacity": {
                          "type": "string",
                          "example": "6804900000000"
                        },
                        "average_deposit_time": {
                          "type": "string",
                          "example": ""
                        },
                        "activities": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "transaction_hash": {
                                "type": "string",
                                "example": "0x96614fb3079fe304c4e0df6815159e0bb2a2e03185428f8b1954bc68465ca3ab"
                              },
                              "block_number": {
                                "type": "string",
                                "example": "10569716"
                              },
                              "block_timestamp": {
                                "type": "string",
                                "example": "1690619479957"
                              },
                              "display_inputs_count": {
                                "type": "integer",
                                "example": 1,
                                "default": 0
                              },
                              "display_outputs_count": {
                                "type": "integer",
                                "example": 2,
                                "default": 0
                              },
                              "display_inputs": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "example": "42195373"
                                    },
                                    "from_cellbase": {
                                      "type": "boolean",
                                      "example": false,
                                      "default": true
                                    },
                                    "capacity": {
                                      "type": "string",
                                      "example": "61596491259556.0"
                                    },
                                    "address_hash": {
                                      "type": "string",
                                      "example": "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqwcdm7a5cp70967rvt79wqjn0ad8hjzneqavumvc"
                                    },
                                    "generated_tx_hash": {
                                      "type": "string",
                                      "example": "0xc6d47c57d12134ca12b4f25e96bf19a516b0a2ee6fe1654218401c2dad6f5630"
                                    },
                                    "cell_index": {
                                      "type": "string",
                                      "example": "1"
                                    },
                                    "cell_type": {
                                      "type": "string",
                                      "example": "normal"
                                    },
                                    "since": {
                                      "type": "object",
                                      "properties": {
                                        "raw": {
                                          "type": "string",
                                          "example": "0x0000000000000000"
                                        },
                                        "median_timestamp": {
                                          "type": "string",
                                          "example": "1690619297962"
                                        }
                                      }
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
                                      "example": "42283262"
                                    },
                                    "capacity": {
                                      "type": "string",
                                      "example": "6804900000000.0"
                                    },
                                    "address_hash": {
                                      "type": "string",
                                      "example": "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdku6gqm43say6x6xzzglfpqr5h62l9zpcd3lynr"
                                    },
                                    "status": {
                                      "type": "string",
                                      "example": "pending"
                                    },
                                    "consumed_tx_hash": {
                                      "type": "string",
                                      "example": ""
                                    },
                                    "cell_type": {
                                      "type": "string",
                                      "example": "nervos_dao_deposit"
                                    }
                                  }
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
  "_id": "64c4d30d5e5cc1000a385424:64c4d47a5e5cc1000a385c0c"
}
```