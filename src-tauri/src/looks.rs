//! "Change your orb to stardust", "make your orb pure water", "switch to
//! Atlas", "be Kiki" — Izuki changes how it looks and sounds when asked, at
//! once and with no AI. A thing people can play with.

/// What to change.
#[derive(Debug, Clone, PartialEq)]
pub enum Look {
    Orb(&'static str, &'static str),
    Persona(&'static str, &'static str),
}

const ORBS: &[(&[&str], &str, &str)] = &[
    (&["stardust", "particles", "particle", "dots"], "particles", "Stardust"),
    (&["pure water", "see-through", "see through", "clear drop"], "dew", "Pure water"),
    (&["clear water", "water"], "ferrofluid", "Clear water"),
    (&["pearl"], "ripple", "Tidal pearl"),
    (&["crystal", "galaxy", "stars", "nebula", "constellation"], "constellation", "Star crystal"),
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
    }
}
