use actix_web::{web, App, HttpServer};
use anyhow::{Context, Result};

use std::env;

mod database;
mod routes;
mod utils;

#[actix_web::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();

    let port = env::var("PORT")
        .context("PORT must be set")?
        .parse::<u16>()?;
    let host = env::var("HOST").context("HOST must be set")?;

    let (neo4j_graph, postgres_pool) = database::connect_to_databases().await?;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(postgres_pool.clone()))
            .app_data(web::Data::new(neo4j_graph.clone()))
            .service(routes::root::root_route_handler)
            .service(routes::health_check::health_check_route_handler)
    })
    .bind((host, port))?
    .run()
    .await
    .map_err(anyhow::Error::from)
}
