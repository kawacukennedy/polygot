use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};

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

#[get("/")]
async fn index() -> impl Responder {
    HttpResponse::Ok().body("Search Service Rust\n")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(healthz)
            .service(index)
    })
    .bind(("0.0.0.0", 8080))?;
    .run()
    .await
}
