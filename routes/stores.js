const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const Store = require("../models/store")

router.route('/stores')
  // .get(function(){logger.info("pending validations")}, function(){logger.info("pending use case")});
  .get(async function (req, res, next) {
    const field_inclusion = {
      "_id": 0,
      "name": 1,
      "cuit": 1,
      "concepts": 1, // need to include it to use the virtuals. will be removed later
      "active": 1,
      "lastSale": 1
    }
    let doc_query;
    try {
      doc_query = req.query.q ? JSON.parse(req.query.q) : {}
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.statusMessage = "bad json syntax on query"
        res.status(400).end()
        return
      } else {
        res.statusMessage = "unknown error"
        res.status(400).end()
        return
      }
    }

    let stores;
    try {
      stores = await Store.find(doc_query).select(field_inclusion)
    } catch (e) {
        res.statusMessage = "Bad mongodb query on document"
        res.status(400).end()
        return
    }

    const total = stores.length
    const page = req.query.page ?? 1
    const limit = req.query.limit ?? 10

    let pages = Math.floor(total/limit)
    if (total % limit > 0) pages++

    const start_index = page * limit - limit
    const end_index = start_index + limit

    const selected_stores = stores.slice(start_index, end_index)
    const json_stores = []
    for (const store of selected_stores) {
      const json_store = store.toJSON()
      delete json_store.concepts
      json_store["lastSale"] = json_store["lastSale"].toDateString()
      json_stores.push(json_store)
    }

    const response = {
      data: json_stores,
      page: page,
      pages: pages,
      limit: limit,
      total: total
    }
    res.send(response)
  })

  .post(async function (req, res, next) {
    if (isValidStore(req.body)) {
      const body = req.body
      const parsed_body = {
        name: body.name,
        cuit: body.cuit,
        concepts: [
          body.concept1, body.concept2, body.concept3,
          body.concept4, body.concept5, body.concept6
        ],
        active: body.active,
        lastSale: body.lastSale
      }
      const store = new Store(parsed_body)
      await store.save()
      const response = store.toJSON()

      delete response.concepts
      delete response._id
      delete response.createdAt
      delete response.updatedAt
      delete response.__v

      res.send(response)
    } else {
      res.statusMessage = "Wrong body. See API specification for more details"
      res.status(400).end()
    }
  })

function isValidStore(body) {
  function hasAllAttributes(body) {
    return (
      "name" in body &&
      "cuit" in body &&
      "concept1" in body &&
      "concept2" in body &&
      "concept3" in body &&
      "concept4" in body &&
      "concept5" in body &&
      "concept6" in body &&
      "currentBalance" in body &&
      "active" in body &&
      "lastSale" in body
    )
  }

  function validName(name) {
    // for now its always valid, but some restrictions might come later
    return true
  }

  function validCuit(cuit) {
    // regex check on argentinean cuit format
    return /^\d{2}-\d{8}-\d$/.test(cuit)
  }

  function validConcepts(concepts) {
    // for now all concepts are considered valid. restrictions might come later
    const checks = []
    for (const concept of concepts) {
      // future check will go here
      checks.push(true)
    }
    return checks.every(x=>x===true)
  }

  function validBalance(balance) {
    // check that it's a number
    return ! isNaN(balance)
  }

  function validActive(active) {
    // check that is a boolean
    return (
      active === "true" || active === "false" ||
      active === "True" || active === "False" ||
      active === "TRUE" || active === "FALSE"
    )
  }

  function validSale(date) {
    // check that it's a date
    const parsed_date = Date.parse(date)
    return ! isNaN(parsed_date)
  }

  const concepts = [
      body.concept1, body.concept2, body.concept3,
      body.concept4, body.concept5, body.concept6
    ]
  return (
    hasAllAttributes(body) &&
    validName(body.name) &&
    validCuit(body.cuit) &&
    validConcepts(concepts) &&
    validBalance(body.currentBalance) &&
    validActive(body.active) &&
    validSale(body.lastSale)
  )

}

module.exports = router;
