const axios = require('axios');

const baseUrl = 'http://lb-bzdvzokl-p54y803m9azst1vj.clb.ap-beijing.tencentclb.com:40000';
const apikey = 'Qt4rPLV8ZPLqdHoCdaUIcf5A37r6Jl5jR1HpjUpm';

axios.defaults.headers.common['Authorization'] = 'Bearer account=root&api_key=' + apikey;
axios.defaults.headers.post['Content-Type'] = 'application/json';

async function createdb(name) {
  const data = await axios({
    url: baseUrl + '/database/create',
    method: 'post',
    data: {
      database: name,
    },
  });
  console.log(data.data);
}

async function createCollection(db, collection) {
  const data = await axios({
    method: 'post',
    url: baseUrl + '/collection/create',
    data: {
      database: db,
      collection: collection,
      replicaNum: 2,
      shardNum: 1,
      description: 'vector db for ' + collection,
      embedding: {
        field: 'text',
        vectorField: 'vector',
        model: 'bge-base-zh',
      },
      indexes: [
        {
          fieldName: 'id',
          fieldType: 'string',
          indexType: 'primaryKey',
        },
        {
          fieldName: 'vector',
          fieldType: 'vector',
          indexType: 'HNSW',
          metricType: 'COSINE',
          params: {
            M: 16,
            efConstruction: 200,
          },
        },
        {
          fieldName: 'title',
          fieldType: 'string',
          indexType: 'filter',
        },
        {
          fieldName: 'year',
          fieldType: 'string',
          indexType: 'filter',
        },
        {
          fieldName: 'mongoId',
          fieldType: 'string',
          indexType: 'filter',
        },
      ],
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer account=root&api_key=' + apikey,
    },
  });
  console.log(data.data);
  return data.data;
}

async function upsert(db, collection, documents) {
  const data = await axios({
    method: 'post',
    url: baseUrl + '/document/upsert',
    data: {
      database: db,
      collection: collection,
      buildIndex: true,
      documents,
    },
  });
  return data.data;
}

async function query(db, collection, texts, limit = 20) {
  const data = await axios({
    url: baseUrl + '/document/search',
    method: 'post',
    data: {
      database: db,
      collection: collection,
      search: {
        embeddingItems: Array.isArray(texts) ? texts : [texts],
        limit: limit,
        params: {
          ef: 200,
        },
        retrieveVector: false,
        outputFields: ['id', 'mongoId', 'title', 'text'],
      },
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer account=root&api_key=' + apikey,
    },
  });
  return data.data.documents[0];
}

/**
 * curl -i -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer account=root&api_key=A5VOgsMpGWJhUI0WmUbY********************' \
  http://10.0.X.X:80/document/delete \
  -d '{
    "database": "db-test",
    "collection": "book-emb",
    "query": {
        "documentIds": [
            "0001",
            "0002",
            "0003"
        ],
        "filter": "bookName in (\"三国演义\",\"西游记\")"
    }
}'

 */

async function deleteByIds(ids = [], filter) {
  const data = await axios({
    url: baseUrl + '/document/delete',
    method: 'post',
    data: {
      database: 'cat',
      collection: 'papers',
      query: {
        documentIds: ids,
        filter,
      },
    },
  });
  console.log(data.data);
  return data;
}

async function main() {
  //   await createdb('synthsum');
  await createCollection('synthsum', 'sspapers');
  // await upsert()
  // await query()
}

// main();

module.exports = {
  upsert,
  query,
  deleteByIds,
};
