//! "Change your orb to stardust", "make your orb pure water", "switch to
//! Atlas", "be Kiki" — Izuki changes how it looks and sounds when asked, at
//! once and with no AI. A thing people can play with.

/// What to change.
#[derive(Debug, Clone, PartialEq)]
pub enum Look {
    Orb(&'static str, &'static str),
    Persona(&'static str, &'static str),
    /// Changes to the 3D face: (setting, value) pairs, and what it is now.
    Avatar(Vec<(&'static str, serde_json::Value)>, String),
}

/// What people call each part of the 3D face: words → (setting, value, how to say it).
const FACE: &[(&[&str], &str, &str, &str)] = &[
    (&["long dreads", "long locs", "long dreadlocks"], "hair", "longlocs", "long dreads"),
    (&["dreads", "dreadlocks", "locs"], "hair", "locs", "dreads"),
    (&["box braids", "braids", "plaits"], "hair", "braids", "box braids"),
    (&["afro", "fro"], "hair", "afro", "an afro"),
    (&["high top", "high-top", "hightop", "flat top", "flattop"], "hair", "hightop", "a high-top"),
    (&["mohawk", "mohican"], "hair", "mohawk", "a mohawk"),
    (&["fade"], "hair", "fade", "a fade"),
    (&["buzz cut", "buzzcut", "buzz"], "hair", "buzz", "a buzz cut"),
    (&["bald", "shave your head", "no hair"], "hair", "none", "no hair"),
    (&["ponytail", "pony tail"], "hair", "ponytail", "a ponytail"),
    (&["bun"], "hair", "bun", "a bun"),
    (&["pixie"], "hair", "pixie", "a pixie cut"),
    (&["bob"], "hair", "bob", "a bob"),
    (&["wavy", "waves"], "hair", "wavy", "long waves"),
    (&["curly", "curls"], "hair", "curly", "curls"),
    (&["long hair"], "hair", "long", "long hair"),
    (&["short hair"], "hair", "short", "short hair"),
    (&["full beard", "big beard"], "beard", "full", "a full beard"),
    (&["goatee"], "beard", "goatee", "a goatee"),
    (&["moustache", "mustache", "mustache"], "beard", "mustache", "a moustache"),
    (&["stubble"], "beard", "stubble", "stubble"),
    (&["shave your beard", "shave the beard", "no beard", "clean shaven", "clean-shaven", "lose the beard"], "beard", "none", "no beard"),
    (&["beard"], "beard", "short", "a beard"),
    (&["visor"], "glasses", "visor", "a visor"),
    (&["take off your glasses", "no glasses", "lose the glasses", "remove your glasses"], "glasses", "none", "no glasses"),
    (&["glasses", "specs", "spectacles"], "glasses", "round", "glasses"),
    (&["blonde", "blond"], "hairColor", "blonde", "blonde hair"),
    (&["ginger", "auburn", "red hair"], "hairColor", "auburn", "auburn hair"),
    (&["pink hair"], "hairColor", "pink", "pink hair"),
    (&["blue hair"], "hairColor", "blue", "blue hair"),
    (&["silver hair", "grey hair", "gray hair"], "hairColor", "silver", "silver hair"),
    (&["white hair", "platinum"], "hairColor", "platinum", "platinum hair"),
    (&["green hair", "mint hair"], "hairColor", "mint", "mint hair"),
    (&["black hair"], "hairColor", "black", "black hair"),
    (&["brown hair"], "hairColor", "brown", "brown hair"),
    (&["glowing eyes", "cyber eyes", "robot eyes"], "eyes", "cyan", "glowing eyes"),
    (&["blue eyes"], "eyes", "blue", "blue eyes"),
    (&["green eyes"], "eyes", "green", "green eyes"),
    (&["brown eyes"], "eyes", "brown", "brown eyes"),
    (&["hazel eyes"], "eyes", "hazel", "hazel eyes"),
    (&["grey eyes", "gray eyes"], "eyes", "grey", "grey eyes"),
    (&["violet eyes", "purple eyes"], "eyes", "violet", "violet eyes"),
    (&["be a man", "a man's face", "male face", "be a guy", "man face"], "gender", "male", "a man's face"),
    (&["be a woman", "a woman's face", "female face", "be a girl", "woman face"], "gender", "female", "a woman's face"),
    (&["follow my voice", "match your voice", "match the voice"], "gender", "auto", "a face that matches my voice"),
];

/// "Give yourself dreads", "grow a beard", "put on a visor", "make your hair pink".
fn parse_face(s: &str) -> Option<Look> {
    let about_you = ["your", "yourself", "you a ", "grow a", "grow some", "put on", "wear ", "take off", "shave", "be a man", "be a woman", "be a guy", "be a girl"].iter().any(|w| s.contains(w));
    let verb = ["give", "grow", "put", "wear", "make", "change", "get", "try", "shave", "take", "switch", "turn", "be a", "have", "lose", "add", "go "].iter().any(|v| s.contains(v));
    if !about_you || !verb || s.split_whitespace().count() > 12 {
        return None;
    }
    let mut changes: Vec<(&'static str, serde_json::Value)> = Vec::new();
    let mut named: Vec<&'static str> = Vec::new();
    // "make your hair pink", "turn your eyes green": a colour said after the part.
    const COLOURS: &[(&str, &str, &str)] = &[
        ("pink", "pink", "pink"), ("blue", "blue", "blue"), ("blonde", "blonde", "blonde"), ("blond", "blonde", "blonde"),
        ("black", "black", "black"), ("brown", "brown", "brown"), ("red", "auburn", "auburn"), ("ginger", "auburn", "auburn"),
        ("silver", "silver", "silver"), ("grey", "silver", "silver"), ("gray", "silver", "silver"), ("white", "platinum", "platinum"),
        ("green", "mint", "mint"), ("purple", "violet", "violet"),
    ];
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).collect();
    for (part, key) in [("hair", "hairColor"), ("eyes", "eyes")] {
        if words.contains(&part) {
            if let Some((_, v, _)) = COLOURS.iter().find(|(w, _, _)| words.contains(w)) {
                let v = if key == "eyes" && *v == "mint" { "green" } else if key == "eyes" && *v == "auburn" { "brown" } else { *v };
                changes.push((key, serde_json::Value::String(v.into())));
                named.push(if key == "eyes" { "new eyes" } else { "new hair colour" });
            }
        }
    }
    for (words, key, value, say) in FACE {
        if changes.iter().any(|(k, _)| k == key) {
            continue;
        }
        if words.iter().any(|w| s.contains(w)) {
            changes.push((key, serde_json::Value::String((*value).into())));
            named.push(say);
        }
    }
    if s.contains("cyber") || s.contains("cyborg") || s.contains("glowing seams") {
        changes.push(("tech", serde_json::Value::Bool(true)));
        named.push("cyber seams");
    }
    if changes.is_empty() {
        return None;
    }
    Some(Look::Avatar(changes, named.join(" and ")))
}

const ORBS: &[(&[&str], &str, &str)] = &[
    (&["stardust", "particles", "particle", "dots"], "particles", "Stardust"),
    (&["pure water", "see-through", "see through", "clear drop"], "dew", "Pure water"),
    (&["clear water", "water"], "ferrofluid", "Clear water"),
    (&["pearl"], "ripple", "Tidal pearl"),
    (&["crystal", "galaxy", "stars", "nebula", "constellation"], "constellation", "Star crystal"),
    (&["3d avatar", "avatar", "3d face", "3d character", "character"], "avatar", "3D avatar"),
    (&["hologram bust", "bust", "3d hologram"], "holo3d", "Hologram bust"),
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
    // The 3D face: hair, beard, glasses, colours, man or woman.
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
            format!("Done — I'm {name} now. How do I look?")
        }
        Look::Avatar(changes, named) => {
            let mut v: serde_json::Value = serde_json::from_str(&s.avatar).unwrap_or_else(|_| serde_json::json!({}));
            if !v.is_object() {
                v = serde_json::json!({});
            }
            for (k, val) in changes {
                v[*k] = val.clone();
            }
            s.avatar = v.to_string();
            let beard = changes.iter().any(|(k, val)| *k == "beard" && val != "none");
            if beard && !crate::tv::avatar_is_male(&s) {
                v["gender"] = serde_json::Value::String("male".into());
                s.avatar = v.to_string();
            }
            // Hair, a beard or glasses show on the 3D faces; switch to one if needed.
            if s.orb_style != "avatar" && s.orb_style != "holo3d" {
                s.orb_style = "avatar".into();
            }
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
        assert_eq!(parse("change your orb to the 3d avatar"), Some(Look::Orb("avatar", "3D avatar")));
        let Some(Look::Avatar(c, _)) = parse("give yourself dreads and a beard") else { panic!("dreads") };
        assert!(c.iter().any(|(k, v)| *k == "hair" && v == "locs"));
        assert!(c.iter().any(|(k, v)| *k == "beard" && v == "short"));
        let Some(Look::Avatar(c, _)) = parse("make your hair pink") else { panic!("pink") };
        assert_eq!(c[0].0, "hairColor");
        let Some(Look::Avatar(c, _)) = parse("put on a visor") else { panic!("visor") };
        assert_eq!(c[0], ("glasses", serde_json::Value::String("visor".into())));
        let Some(Look::Avatar(c, _)) = parse("give yourself long dreads") else { panic!("long") };
        assert_eq!(c[0].1, "longlocs");
        assert_eq!(parse("open my dreads tutorial video"), None);
    }
}
