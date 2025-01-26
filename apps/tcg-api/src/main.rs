use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use anyhow::{Context, Result};

use std::env;

mod database;
mod handlers;
mod routes;
mod services;
mod utils;

#[get("/hello")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[actix_web::main]
async fn main() -> Result<()> {
    let port = env::var("PORT")
        .context("PORT must be set")?
        .parse::<u16>()?;
    let host = env::var("HOST").context("HOST must be set")?;

    let (neo4j_graph, postgres_pool) = database::connect_to_databases().await?;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(postgres_pool.clone()))
            .app_data(web::Data::new(neo4j_graph.clone()))
            .service(hello)
    })
    .bind((host, port))?
    .run()
    .await
    .map_err(anyhow::Error::from)
}
