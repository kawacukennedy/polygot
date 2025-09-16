
use serde::Deserialize;
use std::time::Duration;
use tokio::time::sleep;

#[derive(Deserialize, Debug)]
struct Job {
    job_type: String,
    payload: serde_json::Value,
}

async fn process_job(job: Job) {
    println!("Processing job: {:?}", job);
    // Simulate work
    sleep(Duration::from_secs(1)).await;
    println!("Finished processing job: {:?}", job.job_type);
}

#[tokio::main]
async fn main() -> redis::RedisResult<()> {
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1/".to_string());
    let client = redis::Client::open(redis_url)?;
    let mut con = client.get_async_connection().await?;

    println!("Worker service (Rust) started. Listening for jobs on 'jobs' queue.");

    loop {
        let result: Result<Option<String>, _> = redis::cmd("RPOP")
            .arg("jobs")
            .query_async(&mut con)
            .await;

        match result {
            Ok(Some(job_str)) => {
                match serde_json::from_str::<Job>(&job_str) {
                    Ok(job) => {
                        tokio::spawn(process_job(job));
                    }
                    Err(e) => {
                        eprintln!("Failed to parse job: {}", e);
                    }
                }
            }
            Ok(None) => {
                // Queue is empty, wait a bit
                sleep(Duration::from_secs(1)).await;
            }
            Err(e) => {
                eprintln!("Failed to pop job from queue: {}", e);
                // Wait before retrying
                sleep(Duration::from_secs(5)).await;
            }
        }
    }
}
