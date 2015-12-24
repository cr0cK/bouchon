const SchemaObject = require('node-schema-object');

const Article = new SchemaObject({
  id: Number,
  title: String,
  body: String,
  date_created: String,
  user_id: Number,
}, {setUndefined: true});

const oneArticle = new Article(
  { id: 1, title: 'title1', body: 'body1 patched2', user_id: null, }
);

console.log('oneArticle', oneArticle.toObject());
