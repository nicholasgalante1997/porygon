use actix_web::{get, Responder};

#[get("/")]
pub async fn root_route_handler() -> impl Responder {
    "SERVER OK"
}