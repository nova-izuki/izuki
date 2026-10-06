//! "Change your orb to stardust", "make your orb pure water", "switch to
//! Atlas", "be Kiki", "switch to the hologram woman", "use my face" — Izuki
//! changes how it looks and sounds when asked, at once and with no AI.

/// What to change.
#[derive(Debug, Clone, PartialEq)]
pub enum Look {
    Orb(&'static str, &'static str),
    Persona(&'static str, &'static str),
    /// Changes to the 3D face in use: (setting, value) pairs, and what it is now.
    Avatar(Vec<(&'static str, serde_json::Value)>, String),
}

/// The 3D faces, by what people call them (checked in order: "woman" before "man").
const FACES: &[(&[&str], &str, &str)] = &[
    (&["my face", "my avatar", "my own face", "my 3d", "me in 3d", "look like me"], "model:me", "your face"),
    (&["hologram woman", "hologram girl", "hologram lady", "holo woman", "holo girl"], "model:holo-female", "the hologram woman"),
    (&["hologram man", "hologram guy", "holo man", "holo guy", "hologram bust", "3d hologram"], "model:holo-male", "the hologram man"),
    (&["woman", "girl", "lady", "female"], "model:lightskin-female", "the woman"),
    (&["man", "guy", "male", "dude"], "model:black-male", "the man"),
];

const COLOURS: &[(&str, &str)] = &[
    ("pink", "#ff6fb5"), ("blue", "#4da3ff"), ("purple", "#9b6bff"), ("violet", "#9b6bff"), ("green", "#4ade80"),
    ("red", "#ff4d4d"), ("orange", "#ff9f43"), ("gold", "#f5c542"), ("yellow", "#f5d742"), ("blonde", "#e8c97a"),
    ("blond", "#e8c97a"), ("white", "#f2f2f2"), ("silver", "#c0c6d0"), ("grey", "#9aa0a8"), ("gray", "#9aa0a8"),
    ("black", "#1a1a1a"), ("brown", "#6b4423"), ("cyan", "#5ee7ff"), ("teal", "#2dd4bf"),
];

/// Haircuts, by what people call them (longer names first).
const CUTS: &[(&[&str], &str, &str)] = &[
    (&["afro puffs", "puffs", "space buns"], "puffs", "afro puffs"),
    (&["box braids"], "boxbraids", "box braids"),
    (&["cornrows", "braids"], "braids", "cornrows"),
    (&["dreads", "dreadlocks", "locs", "locks"], "locs", "dreads"),
    (&["curly top", "curls on top", "curly fade"], "curlytop", "a curly top fade"),
    (&["edgar"], "edgar", "an Edgar cut"),
    (&["fohawk", "mohawk", "faux hawk"], "mohawk", "a fohawk"),
    (&["buzz cut", "buzzcut", "buzz"], "buzz", "a buzz cut"),
    (&["crew cut"], "crew", "a crew cut"),
    (&["undercut"], "undercut", "an undercut"),
    (&["quiff", "pompadour"], "quiff", "a quiff"),
    (&["side part"], "sidepart", "a side part"),
    (&["slicked back", "slick back", "slicked"], "slick", "slicked-back hair"),
    (&["curtains", "middle part"], "curtains", "curtains"),
    (&["mullet"], "mullet", "a mullet"),
    (&["pixie"], "pixie", "a pixie cut"),
    (&["bob"], "bob", "a bob"),
    (&["long hair"], "long", "long hair"),
    (&["top knot", "man bun"], "topknot", "a top knot"),
    (&["bun"], "bun", "a bun"),
    (&["ponytail", "pony tail"], "ponytail", "a ponytail"),
    (&["beanie", "hat"], "beanie", "a beanie"),
    (&["afro", "fro"], "afro", "an afro"),
    (&["bald", "no hair", "shave your head"], "bald", "a bald head"),
    (&["your own hair", "your normal hair", "original hair"], "", "your own hair"),
];

/// "Make your glow pink", "more hologram", "just your head", "make your hair blonde".
fn parse_face(s: &str) -> Option<Look> {
    let about_you = ["your", "yourself"].iter().any(|w| s.contains(w));
    let verb = ["give", "make", "change", "turn", "set", "go ", "show", "zoom", "only", "just", "more", "less", "stop", "add", "put"].iter().any(|v| s.contains(v));
    if !about_you || !verb || s.split_whitespace().count() > 12 {
        return None;
    }
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let has = |w: &str| words.contains(&w);
    let colour = COLOURS.iter().find(|(w, _)| has(w)).map(|(_, hex)| serde_json::Value::String((*hex).into()));
    let mut changes: Vec<(&'static str, serde_json::Value)> = Vec::new();
    let mut named: Vec<&'static str> = Vec::new();
    let num = |v: f64| serde_json::json!(v);
    if has("hair") {
        if let Some(c) = colour.clone() { changes.push(("hair", c)); named.push("new hair colour"); }
    }
    // "Give yourself dreads", "change your hair to a buzz cut".
    let padded = format!(" {} ", words.join(" "));
    if let Some((_, key, name)) = CUTS.iter().find(|(says, _, _)| says.iter().any(|w| padded.contains(&format!(" {w} ")))) {
        changes.push(("cut", serde_json::Value::String((*key).into())));
        named.push(name);
    }
    if has("glow") || has("rim") || has("light") || has("aura") {
        if let Some(c) = colour.clone() { changes.push(("accent", c)); named.push("a new glow"); }
        else if ["more", "brighter", "up", "stronger"].iter().any(|w| has(w)) { changes.push(("glow", num(0.9))); named.push("more glow"); }
        else if ["less", "off", "no", "stop", "down", "softer"].iter().any(|w| has(w)) { changes.push(("glow", num(0.0))); named.push("no glow"); }
    }
    if s.contains("hologram") && !s.contains("hologram woman") && !s.contains("hologram man") {
        if ["less", "off", "no", "stop"].iter().any(|w| has(w)) { changes.push(("glow", num(0.0))); named.push("no hologram glow"); }
        else if ["more", "full", "real"].iter().any(|w| has(w)) { changes.push(("glow", num(0.9))); named.push("more hologram"); }
    }
    if has("skin") {
        if ["darker", "dark", "deeper"].iter().any(|w| has(w)) { changes.push(("tint", serde_json::Value::String("#b39a86".into()))); named.push("darker skin"); }
        else if ["lighter", "normal", "original", "natural", "back"].iter().any(|w| has(w)) { changes.push(("tint", serde_json::Value::String("#ffffff".into()))); named.push("your original skin"); }
        else if let Some(c) = colour.clone() { changes.push(("tint", c)); named.push("a new skin tone"); }
    }
    if has("bigger") || s.contains("zoom in") || has("closer") { changes.push(("scale", num(1.3))); named.push("closer"); }
    if has("smaller") || s.contains("zoom out") || has("further") { changes.push(("scale", num(0.8))); named.push("further back"); }
    if has("shinier") || has("glossy") || has("shiny") { changes.push(("gloss", num(0.9))); named.push("shinier"); }
    if has("matte") || s.contains("less shiny") { changes.push(("gloss", num(0.1))); named.push("matte"); }
    if s.contains("just your head") || s.contains("only your head") || s.contains("head only") { changes.push(("headOnly", serde_json::Value::Bool(true))); named.push("just my head"); }
    if s.contains("your body") || s.contains("full body") || s.contains("your shoulders") { changes.push(("headOnly", serde_json::Value::Bool(false))); named.push("head and shoulders"); }
    // The 2D characters' style.
    if s.contains("comic") || s.contains("spider-verse") || s.contains("spiderverse") || s.contains("spider verse") || s.contains("miles morales") {
        changes.push(("render", serde_json::Value::String("comic".into())));
        named.push("comic style");
    } else if s.contains("flat") || s.contains("vector") {
        changes.push(("render", serde_json::Value::String("flat".into())));
        named.push("flat vector style");
    }
    if changes.is_empty() {
        return None;
    }
    Some(Look::Avatar(changes, named.join(" and ")))
}

/// "Switch to the hologram woman", "use my face", "be the man".
fn parse_face_switch(s: &str) -> Option<Look> {
    let verb = ["switch", "change", "use", "show", "be ", "become", "go ", "turn into", "make"].iter().any(|v| s.contains(v));
    let about_face = ["face", "hologram", "avatar", "3d", "bust", "look like me"].iter().any(|w| s.contains(w));
    if !verb || !about_face || s.split_whitespace().count() > 10 {
        return None;
    }
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    FACES.iter().find(|(names, _, _)| names.iter().any(|n| if n.contains(' ') { s.contains(n) } else { words.contains(n) })).map(|(_, id, name)| Look::Orb(id, name))
}

const ORBS: &[(&[&str], &str, &str)] = &[
    (&["stardust", "particles", "particle", "dots"], "particles", "Stardust"),
    (&["pure water", "see-through", "see through", "clear drop"], "dew", "Pure water"),
    (&["clear water", "water"], "ferrofluid", "Clear water"),
    (&["pearl"], "ripple", "Tidal pearl"),
    (&["crystal", "galaxy", "stars", "nebula", "constellation"], "constellation", "Star crystal"),
    (&["hologram woman", "hologram girl", "holo woman"], "model:holo-female", "the hologram woman"),
    (&["hologram man", "hologram guy", "holo man", "hologram bust", "3d hologram"], "model:holo-male", "the hologram man"),
    (&["my face", "my avatar"], "model:me", "your face"),
    (&["3d woman", "3d girl"], "model:lightskin-female", "the woman"),
    (&["3d man", "3d guy", "3d face", "3d avatar", "avatar"], "model:black-male", "the man"),
    (&["cartoon", "2d character", "2d", "animated character", "my character", "comic character", "vector character"], "toon", "your 2D character"),
    (&["face", "hologram", "head"], "face", "Hologram face"),
    (&["ferrofluid", "ferro", "magnetic", "black liquid"], "ferro", "Ferrofluid"),
    (&["liquid", "glass", "default", "normal", "original"], "liquid", "Liquid glass"),
];

pub fn parse(said: &str) -> Option<Look> {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    let verb = ["change", "switch", "make", "turn", "set", "use", "become", "go"].iter().any(|v| s.contains(v));
    if s.contains("orb") || s.contains("your look") || s.contains("how you look") {
        if !verb {
            return None;
        }
        for (words, id, name) in ORBS {
            if words.iter().any(|w| s.contains(w)) {
                return Some(Look::Orb(id, name));
            }
        }
        return None;
    }
    // "Switch to your 2D character", "be a cartoon".
    if ["2d character", "cartoon", "animated character", "comic character", "vector character"].iter().any(|w| s.contains(w)) && verb {
        return Some(Look::Orb("toon", "your 2D character"));
    }
    // Which 3D face, then how it looks (glow, skin, hair, size, head only).
    if let Some(face) = parse_face_switch(s) {
        return Some(face);
    }
    if let Some(face) = parse_face(s) {
        return Some(face);
    }
    // "switch to Atlas", "be Kiki", "talk like Alfred", "change your voice to Sophie".
    if ["jarvis voice", "be jarvis", "talk like jarvis", "sound like jarvis", "switch to jarvis"].iter().any(|k| s.contains(k)) {
        return Some(Look::Persona("atlas", "Atlas"));
    }
    let persona_ask = ["switch to ", "change to ", "be ", "become ", "talk like ", "sound like ", "voice to ", "turn into "];
    let rest = persona_ask.iter().find_map(|lead| s.find(lead).map(|i| &s[i + lead.len()..]))?;
    let first = rest.split_whitespace().next()?.trim_matches(|c: char| !c.is_alphanumeric());
    if s.split_whitespace().count() > 7 {
        return None;
    }
    // "Jarvis" means the Jarvis-style voice, Atlas.
    let first = if first.eq_ignore_ascii_case("jarvis") { "atlas" } else { first };
    crate::voices::PERSONAS.iter().find(|p| p.name.eq_ignore_ascii_case(first) || p.id.eq_ignore_ascii_case(first)).map(|p| Look::Persona(p.id, p.name))
}

/// Make the change; what to say back.
pub fn apply(look: &Look) -> Option<String> {
    let store = crate::state::try_store()?;
    let mut s = store.settings();
    let said = match look {
        Look::Orb(id, name) => {
            s.orb_style = (*id).into();
            if *id == "model:me" {
                format!("Done — I'm {name} now. (If you haven't added it yet: Settings → Voice orb → My face, it takes a few minutes on avaturn.me.)")
            } else if id.starts_with("model:") {
                format!("Done — I'm {name} now. How do I look?")
            } else {
                format!("Done — I'm {name} now. How do I look?")
            }
        }
        Look::Avatar(changes, named) => {
            // Changes go to the face in use (a plain orb switches to a face first);
            // the 2D characters share one look, "toon".
            let toon = s.orb_style == "toon" || s.orb_style.starts_with("toon:") || changes.iter().any(|(k, _)| *k == "render");
            let id = if toon {
                if !(s.orb_style == "toon" || s.orb_style.starts_with("toon:")) {
                    s.orb_style = "toon".into();
                }
                "toon".to_string()
            } else {
                match s.orb_style.strip_prefix("model:") {
                    Some(id) => id.to_string(),
                    None => {
                        s.orb_style = "model:holo-female".into();
                        "holo-female".to_string()
                    }
                }
            };
            // "Just your head" / "full body" mean framing for a 2D character.
            let changes: Vec<(&str, serde_json::Value)> = changes
                .iter()
                .map(|(k, v)| if toon && *k == "headOnly" { ("framing", serde_json::Value::String(if v.as_bool() == Some(true) { "head" } else { "full" }.into())) } else { (*k, v.clone()) })
                .collect();
            let changes = &changes;
            let mut v: serde_json::Value = serde_json::from_str(&s.avatar).unwrap_or_else(|_| serde_json::json!({}));
            // A sculpted face's own hair is part of the sculpt: only a haircut
            // put on it (or a rigged face, yours) can change colour.
            let has_cut = v[&id]["cut"].as_str().is_some_and(|c| !c.is_empty());
            if !toon && changes.len() == 1 && changes[0].0 == "hair" && id != "me" && !id.starts_with("u-") && !has_cut {
                return Some("This face's own hair is sculpted in, so it can't change colour — but give it a haircut first (\"give yourself an afro\") and that can be any colour.".into());
            }
            if !v.is_object() {
                v = serde_json::json!({});
            }
            if !v[&id].is_object() {
                v[&id] = serde_json::json!({});
            }
            for (k, val) in changes {
                v[&id][*k] = val.clone();
            }
            s.avatar = v.to_string();
            format!("Done — {named}. How do I look?")
        }
        Look::Persona(id, name) => {
            s.persona = (*id).into();
            let sample = crate::voices::PERSONAS.iter().find(|p| p.id == *id).map(|p| p.sample).unwrap_or("");
            if sample.is_empty() { format!("Switched to {name}.") } else { sample.to_string() }
        }
    };
    if let Look::Persona(..) = look {
        // The character's own name and voice, not an earlier custom one.
        s.persona_name.clear();
        s.persona_voice.clear();
    }
    store.set_settings(s);
    crate::state::settings_changed_elsewhere();
    Some(said)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn changes_its_look_when_asked() {
        assert_eq!(parse("change your orb to stardust"), Some(Look::Orb("particles", "Stardust")));
        assert_eq!(parse("make your orb pure water"), Some(Look::Orb("dew", "Pure water")));
        assert_eq!(parse("switch the orb to water"), Some(Look::Orb("ferrofluid", "Clear water")));
        assert_eq!(parse("turn your orb into the galaxy one"), Some(Look::Orb("constellation", "Star crystal")));
        assert_eq!(parse("what is an orb"), None);
        assert_eq!(parse("switch to Atlas"), Some(Look::Persona("atlas", "Atlas")));
        assert_eq!(parse("be kiki"), Some(Look::Persona("kiki", "Kiki")));
        assert_eq!(parse("jarvis voice"), Some(Look::Persona("atlas", "Atlas")));
        assert_eq!(parse("switch to jarvis"), Some(Look::Persona("atlas", "Atlas")));
        assert_eq!(parse("switch to chrome"), None);
        assert_eq!(parse("please switch to the next tab in my browser now and also scroll"), None);
        assert_eq!(parse("change your orb to the 3d avatar"), Some(Look::Orb("model:black-male", "the man")));
        assert_eq!(parse("change your orb to the hologram woman"), Some(Look::Orb("model:holo-female", "the hologram woman")));
        assert_eq!(parse("switch to the hologram man"), Some(Look::Orb("model:holo-male", "the hologram man")));
        assert_eq!(parse("use my face"), Some(Look::Orb("model:me", "your face")));
        assert_eq!(parse("show the woman's face"), Some(Look::Orb("model:lightskin-female", "the woman")));
        assert_eq!(parse("change your face to the man"), Some(Look::Orb("model:black-male", "the man")));
        assert_eq!(parse("change your orb to the hologram face"), Some(Look::Orb("face", "Hologram face")));
        let Some(Look::Avatar(c, _)) = parse("make your glow pink") else { panic!("glow") };
        assert_eq!(c[0], ("accent", serde_json::Value::String("#ff6fb5".into())));
        let Some(Look::Avatar(c, _)) = parse("make your hair blonde") else { panic!("hair") };
        assert_eq!(c[0].0, "hair");
        let Some(Look::Avatar(c, _)) = parse("show just your head") else { panic!("head") };
        assert_eq!(c[0], ("headOnly", serde_json::Value::Bool(true)));
        let Some(Look::Avatar(c, _)) = parse("make your face bigger") else { panic!("bigger") };
        assert_eq!(c[0].0, "scale");
        let Some(Look::Avatar(c, _)) = parse("give yourself dreads") else { panic!("dreads") };
        assert_eq!(c[0], ("cut", serde_json::Value::String("locs".into())));
        let Some(Look::Avatar(c, _)) = parse("change your hair to afro puffs") else { panic!("puffs") };
        assert_eq!(c[0], ("cut", serde_json::Value::String("puffs".into())));
        let Some(Look::Avatar(c, _)) = parse("give yourself a buzz cut and make your hair blonde") else { panic!("both") };
        assert!(c.iter().any(|(k, _)| *k == "cut") && c.iter().any(|(k, _)| *k == "hair"));
        assert_eq!(parse("open my face wash shopping list"), None);
        assert_eq!(parse("open my dreads tutorial video"), None);
        assert_eq!(parse("switch to your 2d character"), Some(Look::Orb("toon", "your 2D character")));
        assert_eq!(parse("change your orb to the cartoon"), Some(Look::Orb("toon", "your 2D character")));
        let Some(Look::Avatar(c, _)) = parse("make your style comic") else { panic!("comic") };
        assert_eq!(c[0], ("render", serde_json::Value::String("comic".into())));
    }
}
