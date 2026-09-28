//! List the controls of the window in front, then safely click one by name.
//!
//!   cargo run --example list_and_click -- "Sign in"
//!
//! You get 3 seconds to bring the window you want to the front.

fn main() {
    #[cfg(windows)]
    {
        use safe_hands::{controls, safe_click, Outcome};

        safe_hands::dpi_aware();
        let wanted = std::env::args().nth(1);
        println!("Bring the window you want to the front — 3 seconds…");
        std::thread::sleep(std::time::Duration::from_secs(3));

        let Some(window) = controls::foreground_window() else {
            println!("No window in front.");
            return;
        };
        let list = controls::list(window, 80);
        println!("{} controls — this is what you'd show your model:", list.len());
        for c in &list {
            println!("  {}", c.line());
        }

        let Some(wanted) = wanted else { return };
        let Some(pick) = list.iter().find(|c| c.name.eq_ignore_ascii_case(&wanted)) else {
            println!("Nothing called \"{wanted}\" on screen.");
            return;
        };
        match safe_click(window, pick) {
            Outcome::Clicked => println!("Clicked \"{}\".", pick.name),
            Outcome::ClickedWhereItMoved => println!("It had moved — clicked \"{}\" where it is now.", pick.name),
            Outcome::PressedDirectly { cover } => println!("{cover} was on top — pressed \"{}\" directly.", pick.name),
            Outcome::Disabled => println!("\"{}\" is greyed out.", pick.name),
            Outcome::Covered { by } => println!("{by} is on top of \"{}\" — close it first.", pick.name),
            Outcome::Failed(why) => println!("Couldn't: {why}"),
        }
    }
    #[cfg(not(windows))]
    println!("Safe Hands works on Windows.");
}
