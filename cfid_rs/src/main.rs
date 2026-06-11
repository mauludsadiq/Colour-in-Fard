use std::env;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("usage: cfid <hex>");
        process::exit(1);
    }
    match cfcolor::from_hex(&args[1]) {
        Ok(id) => println!("{}", id),
        Err(e) => {
            eprintln!("error: {}", e);
            process::exit(1);
        }
    }
}
