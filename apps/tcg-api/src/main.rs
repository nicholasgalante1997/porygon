use actix_web::{web, App, HttpServer};
use anyhow::{Context, Result};

use std::env;

mod database;
mod routes;
mod state;
mod utils;

#[actix_web::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();

    let port = env::var("PORT")
        .context("PORT must be set")?
        .parse::<u16>()?;
    let host = env::var("HOST").context("HOST must be set")?;

    let (neo4j, postgres) = database::connect_to_databases().await?;

    let app_state = web::Data::new(state::AppState::new(neo4j, postgres));

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .service(
                web::scope("/")
                    .configure(|app_config| routes::root::configure_root_route_handler(app_config)),
            )
            .service(routes::health_check::health_check_route_handler)
            .service(web::scope("/api").configure(|app_config| {}))
    })
    .bind((host, port))?
    .run()
    .await
    .map_err(anyhow::Error::from)
}
