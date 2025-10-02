use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::{Schema, TEXT, STORED};
use tantivy::{Index, DocAddress, Score};

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    uptime_seconds: u64,
    version: String,
}

static START_TIME: std::sync::OnceLock<u64> = std::sync::OnceLock::new();

#[get("/healthz")]
async fn healthz() -> impl Responder {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let uptime = now - START_TIME.get_or_init(|| now);

    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        uptime_seconds: uptime,
        version: "1.0.0".to_string(),
    })
}

#[derive(Deserialize)]
struct SearchQuery {
    q: String,
}

#[derive(Serialize)]
struct SearchResult {
    score: f32,
    title: String,
    content: String,
}

#[get("/search")]
async fn search(query: web::Query<SearchQuery>) -> impl Responder {
    // In a real application, the index would be persistent and populated from a database.
    // For this example, we create a new in-memory index with mock data on each request.
    let mut schema_builder = Schema::builder();
    let title_field = schema_builder.add_text_field("title", TEXT | STORED);
    let content_field = schema_builder.add_text_field("content", TEXT | STORED);
    let schema = schema_builder.build();

    let index = Index::create_in_ram(schema.clone());
    let mut index_writer = index.writer(100_000_000).unwrap();

    // Mock data
    index_writer.add_document(schema.build_document(
        vec![
            (title_field, "Python Hello World"),
            (content_field, "print(\"Hello, World!\")"),
        ],
    ));
    index_writer.add_document(schema.build_document(
        vec![
            (title_field, "JavaScript Array Example"),
            (content_field, "const arr = [1, 2, 3]; console.log(arr.length);"),
        ],
    ));
    index_writer.add_document(schema.build_document(
        vec![
            (title_field, "Rust Ownership"),
            (content_field, "fn main() { let s1 = String::from(\"hello\"); let s2 = s1; println!(\"{}\", s2); }"),
        ],
    ));
    index_writer.commit().unwrap();

    let reader = index.reader().unwrap();
    let searcher = reader.searcher();

    let query_parser = QueryParser::for_index(&index, vec![title_field, content_field]);
    let tantivy_query = query_parser.parse_query(&query.q).unwrap();

    let top_docs = searcher.search(&tantivy_query, &TopDocs::with_limit(10)).unwrap();

    let mut results = Vec::new();
    for (score, doc_address) in top_docs {
        let retrieved_doc = searcher.doc(doc_address).unwrap();
        let title = retrieved_doc.get_first(title_field).unwrap().text().unwrap().to_string();
        let content = retrieved_doc.get_first(content_field).unwrap().text().unwrap().to_string();
        results.push(SearchResult { score, title, content });
    }

    HttpResponse::Ok().json(results)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(healthz)
            .service(search)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
