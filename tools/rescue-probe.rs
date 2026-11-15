//! Runs against disposable, off-screen windows in this process and a test
//! child. Never attaches to Izuki, Explorer, the owner's windows or accounts.
#![allow(dead_code)]
#[path="../src-tauri/src/rescue_core.rs"] mod rescue_core;
#[path="../src-tauri/src/rescue_native.rs"] mod rescue_native;

#[cfg(windows)]
mod probe {
    use std::{ffi::c_void,sync::{mpsc,Arc,atomic::{AtomicBool,Ordering}},time::{Duration,Instant}};
    type Hwnd=*mut c_void;
    #[repr(C)] struct Class {style:u32,proc:Option<unsafe extern "system" fn(Hwnd,u32,usize,isize)->isize>,extra:i32,window_extra:i32,instance:*mut c_void,icon:*mut c_void,cursor:*mut c_void,brush:*mut c_void,menu:*const u16,name:*const u16}
    #[repr(C)] #[derive(Default)] struct Point{x:i32,y:i32}
    #[repr(C)] #[derive(Default)] struct Message{window:Hwnd,id:u32,wparam:usize,lparam:isize,time:u32,point:Point,private:u32}
    #[link(name="user32")] extern "system" {
        fn RegisterClassW(class:*const Class)->u16;
        fn CreateWindowExW(ex:u32,class:*const u16,title:*const u16,style:u32,x:i32,y:i32,width:i32,height:i32,parent:Hwnd,menu:*mut c_void,instance:*mut c_void,data:*mut c_void)->Hwnd;
        fn DefWindowProcW(window:Hwnd,id:u32,wp:usize,lp:isize)->isize;
        fn DestroyWindow(window:Hwnd)->i32;
        fn PeekMessageW(message:*mut Message,window:Hwnd,min:u32,max:u32,remove:u32)->i32;
        fn DispatchMessageW(message:*const Message)->isize;
        fn IsWindowVisible(window:Hwnd)->i32;
        fn IsWindow(window:Hwnd)->i32;
        fn ShowWindowAsync(window:Hwnd,command:i32)->i32;
    }
    fn wide(value:&str)->Vec<u16>{value.encode_utf16().chain(Some(0)).collect()}
    unsafe extern "system" fn window_proc(window:Hwnd,id:u32,wp:usize,lp:isize)->isize {DefWindowProcW(window,id,wp,lp)}
    unsafe fn make(class:&str,title:&str,registered:bool)->isize {
        let name=wide(class);let title=wide(title);
        let class=Class {style:0,proc:Some(window_proc),extra:0,window_extra:0,instance:std::ptr::null_mut(),icon:std::ptr::null_mut(),cursor:std::ptr::null_mut(),brush:std::ptr::null_mut(),menu:std::ptr::null(),name:name.as_ptr()};
        RegisterClassW(&class);
        // A full-screen-sized window, safely outside the visible desktop.
        let handle=CreateWindowExW(0x08000080,name.as_ptr(),title.as_ptr(),0x90000000,-30000,-30000,1280,720,std::ptr::null_mut(),std::ptr::null_mut(),std::ptr::null_mut(),std::ptr::null_mut());
        assert!(!handle.is_null(),"disposable test window creation failed");
        if registered {assert!(crate::rescue_native::register(handle as isize));}
        handle as isize
    }
    fn visible(handle:isize)->bool{unsafe{IsWindowVisible(handle as Hwnd)!=0}}
    fn pump(){unsafe{let mut message=Message::default();while PeekMessageW(&mut message,std::ptr::null_mut(),0,0,1)!=0 {DispatchMessageW(&message);}}}
    pub fn foreign(){
        use std::io::Write;
        let handle=unsafe{make("Tauri Window","Izuki Overlay",true)};println!("{handle}");std::io::stdout().flush().unwrap();
        let until=Instant::now()+Duration::from_secs(20);
        while Instant::now()<until {pump();std::thread::sleep(Duration::from_millis(5));}
        unsafe{DestroyWindow(handle as Hwnd);}
    }
    pub fn run(){
        use std::io::{BufRead,BufReader};use std::os::windows::process::CommandExt;
        let mut foreign=std::process::Command::new(std::env::current_exe().unwrap()).arg("--foreign").stdout(std::process::Stdio::piped()).stderr(std::process::Stdio::null()).creation_flags(0x08000000).spawn().unwrap();
        let mut line=String::new();BufReader::new(foreign.stdout.take().unwrap()).read_line(&mut line).unwrap();let foreign_handle:isize=line.trim().parse().unwrap();
        struct Child(std::process::Child);impl Drop for Child{fn drop(&mut self){let _=self.0.kill();let _=self.0.wait();}}let _foreign=Child(foreign);
        let (ready_tx,ready)=mpsc::channel();let (command_tx,command)=mpsc::channel();let frozen=Arc::new(AtomicBool::new(false));let marked=frozen.clone();
        let ui=std::thread::spawn(move||{
            let overlay=unsafe{make("Tauri Window","Izuki Overlay",true)};
            let veil=unsafe{make("IzukiDimTheRest","",true)};
            let config=unsafe{make("Tauri Window","Izuki",false)};
            ready_tx.send((overlay,veil,config)).unwrap();
            let mut stop=false;
            while !stop {
                match command.try_recv(){
                    Ok("quit")=>{stop=true;},
                    Ok("freeze")=>{
                        // Hold the UI thread until the test has completed its
                        // bounded hide and explicitly releases it. A fixed
                        // sleep could expire while the test was descheduled.
                        marked.store(true,Ordering::SeqCst);
                        let until=Instant::now()+Duration::from_secs(15);
                        while Instant::now()<until {
                            match command.try_recv(){
                                Ok("release")=>break,
                                Ok("quit")=>{stop=true;break;},
                                _=>{},
                            }
                            pump();std::thread::sleep(Duration::from_millis(3));
                        }
                        marked.store(false,Ordering::SeqCst);
                    },
                    _=>{},
                }
                if stop {break;}
                pump();std::thread::sleep(Duration::from_millis(3));
            }
            unsafe{for handle in [overlay,veil,config]{DestroyWindow(handle as Hwnd);}}
        });
        let (overlay,veil,config)=ready.recv_timeout(Duration::from_secs(5)).unwrap();
        assert!(visible(overlay)&&visible(veil)&&visible(config)&&visible(foreign_handle));
        assert_eq!(crate::rescue_native::visible(),Some(2));let _=crate::rescue_native::shell();
        let result=crate::rescue_native::hide();assert_eq!(result.found,2);assert_eq!(result.hidden,2);assert_eq!(result.remaining+result.unknown,0);
        assert!(!visible(overlay)&&!visible(veil));assert!(visible(config)&&visible(foreign_handle),"unrelated or foreign window was hidden");
        println!("PASS: full-screen own overlay and veil hidden; main and foreign same-title windows preserved");
        let again=crate::rescue_native::hide();assert_eq!(again.found,0);assert!(visible(config)&&visible(foreign_handle));
        println!("PASS: repeated native rescue leaves unrelated windows untouched");
        unsafe{ShowWindowAsync(overlay as Hwnd,4);}
        let until=Instant::now()+Duration::from_secs(2);while !visible(overlay)&&Instant::now()<until {std::thread::sleep(Duration::from_millis(5));}assert!(visible(overlay));
        command_tx.send("freeze").unwrap();while !frozen.load(Ordering::SeqCst){std::thread::sleep(Duration::from_millis(2));}
        let started=Instant::now();let stuck=crate::rescue_native::hide();
        assert!(started.elapsed()<Duration::from_millis(1000),"rescue blocked behind the frozen UI thread");assert_eq!(stuck.remaining,1);
        let report=crate::rescue_core::report(&stuck,None,Some(false));assert!(report.contains("Windows did not confirm"));assert!(!report.contains("Hid and checked"));
        println!("PASS: frozen UI dispatch returns a bounded, honest blocker; Explorer is never restarted");
        command_tx.send("release").unwrap();
        let until=Instant::now()+Duration::from_secs(3);while visible(overlay)&&Instant::now()<until{std::thread::sleep(Duration::from_millis(10));}assert!(!visible(overlay));
        println!("PASS: pending native hide completes when the UI recovers, without an AI retry");
        command_tx.send("quit").unwrap();ui.join().unwrap();assert_eq!(unsafe{IsWindow(overlay as Hwnd)},0);
        let stale=crate::rescue_native::hide();assert_eq!(stale.found,0);assert!(visible(foreign_handle));
        println!("PASS: destroyed handles are ignored; foreign same-title process remains visible");
    }
}
fn main(){
    #[cfg(windows)] {if std::env::args().any(|arg|arg=="--foreign"){probe::foreign();}else{probe::run();}}
    #[cfg(not(windows))] {println!("Native rescue probe requires Windows; pure policy tests are portable.");}
}
