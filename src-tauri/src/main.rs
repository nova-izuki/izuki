// Izuki is a tray app: no console window should ever flash on launch.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    izuki_lib::run();
}
