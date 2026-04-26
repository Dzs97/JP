// ═══════════════════════════════════════════════════════════════════════
//  Romaji → Kana converter (Wapuro-style IME)
// ═══════════════════════════════════════════════════════════════════════

const ROMAJI_MAP = {
  // basic
  a:"あ",i:"い",u:"う",e:"え",o:"お",
  ka:"か",ki:"き",ku:"く",ke:"け",ko:"こ",
  sa:"さ",shi:"し",si:"し",su:"す",se:"せ",so:"そ",
  ta:"た",chi:"ち",ti:"ち",tsu:"つ",tu:"つ",te:"て",to:"と",
  na:"な",ni:"に",nu:"ぬ",ne:"ね",no:"の",
  ha:"は",hi:"ひ",fu:"ふ",hu:"ふ",he:"へ",ho:"ほ",
  ma:"ま",mi:"み",mu:"む",me:"め",mo:"も",
  ya:"や",yu:"ゆ",yo:"よ",
  ra:"ら",ri:"り",ru:"る",re:"れ",ro:"ろ",
  wa:"わ",wo:"を",n:"ん",nn:"ん",
  // dakuten
  ga:"が",gi:"ぎ",gu:"ぐ",ge:"げ",go:"ご",
  za:"ざ",ji:"じ",zi:"じ",zu:"ず",ze:"ぜ",zo:"ぞ",
  da:"だ",di:"ぢ",du:"づ",de:"で",do:"ど",
  ba:"ば",bi:"び",bu:"ぶ",be:"べ",bo:"ぼ",
  pa:"ぱ",pi:"ぴ",pu:"ぷ",pe:"ぺ",po:"ぽ",
  // yoon
  kya:"きゃ",kyu:"きゅ",kyo:"きょ",
  sha:"しゃ",shu:"しゅ",sho:"しょ",sya:"しゃ",syu:"しゅ",syo:"しょ",
  cha:"ちゃ",chu:"ちゅ",cho:"ちょ",tya:"ちゃ",tyu:"ちゅ",tyo:"ちょ",
  nya:"にゃ",nyu:"にゅ",nyo:"にょ",
  hya:"ひゃ",hyu:"ひゅ",hyo:"ひょ",
  mya:"みゃ",myu:"みゅ",myo:"みょ",
  rya:"りゃ",ryu:"りゅ",ryo:"りょ",
  gya:"ぎゃ",gyu:"ぎゅ",gyo:"ぎょ",
  ja:"じゃ",ju:"じゅ",jo:"じょ",jya:"じゃ",jyu:"じゅ",jyo:"じょ",
  bya:"びゃ",byu:"びゅ",byo:"びょ",
  pya:"ぴゃ",pyu:"ぴゅ",pyo:"ぴょ",
  // small
  la:"ぁ",li:"ぃ",lu:"ぅ",le:"ぇ",lo:"ぉ",
  xa:"ぁ",xi:"ぃ",xu:"ぅ",xe:"ぇ",xo:"ぉ",
  xtsu:"っ",xtu:"っ",ltu:"っ",
  // punctuation
  "-":"ー",",":"、",".":"。","?":"？","!":"！"," ":" ",
};

function romajiToKana(input) {
  let s = input.toLowerCase(), out = "", i = 0;
  while (i < s.length) {
    let matched = false;
    // try 4-char, 3-char, 2-char, 1-char
    for (const n of [4, 3, 2, 1]) {
      const chunk = s.slice(i, i + n);
      if (ROMAJI_MAP[chunk]) {
        out += ROMAJI_MAP[chunk];
        i += n;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    // double consonant (small tsu): kk, tt, ss, pp, ...
    if (i + 1 < s.length && s[i] === s[i + 1] && /[kstpbgzdhjmrfc]/.test(s[i])) {
      out += "っ";
      i += 1;
      continue;
    }
    // 'n' before consonant
    if (s[i] === "n" && i + 1 < s.length && /[kstpbgzdhjmrfcwy]/.test(s[i + 1])) {
      out += "ん";
      i += 1;
      continue;
    }
    // unmatched — keep as-is (so user sees what's pending)
    out += s[i];
    i += 1;
  }
  return out;
}

// Normalize Japanese input for checking: strip spaces, convert katakana -> hiragana
function normalizeKana(s) {
  return s.replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
          .replace(/\s+/g, "").trim();
}

window.romajiToKana = romajiToKana;
window.normalizeKana = normalizeKana;
